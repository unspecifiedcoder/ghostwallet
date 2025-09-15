import { ethers, network } from "hardhat";

async function main() {
  const vaultAddr = process.env.VAULT;
  if (!vaultAddr) throw new Error("VAULT not set in .env");

  // --- Get signers ---
  const [deployer, user, backup, attacker] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("User (owner):", user.address);
  console.log("Backup:", backup.address);
  console.log("Attacker:", attacker.address);
  console.log("Vault:", vaultAddr);

  // --- Attach to vault using the actual owner (deployer in your deployment) ---
  const vault = await ethers.getContractAt("ShadeVault", vaultAddr, deployer);

  // --- 1. Check displayed balances ---
  let balOwner = await vault.getDisplayedEthBalance(deployer.address);
  let balBackup = await vault.getDisplayedEthBalance(backup.address);
  console.log("Displayed balance (owner):", ethers.formatEther(balOwner));
  console.log("Displayed balance (backup):", ethers.formatEther(balBackup));

  // --- 2. Fund vault with 1 ETH from deployer/owner ---
  console.log("\nFunding vault with 1 ETH from owner...");
  await deployer.sendTransaction({
    to: vaultAddr,
    value: ethers.parseEther("1.0"),
  });
  console.log("Vault funded successfully.");

  // --- 3. Ping the vault (owner-only function) ---
  console.log("Pinging vault from owner...");
  await (await vault.ping()).wait();
  console.log("Ping successful!");

  // --- 4. Attacker tries unauthorized withdraw (triggers trap) ---
  console.log("\nSimulating attacker trap...");
  try {
    await (await vault.connect(attacker).tryWithdrawAsAttacker(ethers.parseEther("0.5"))).wait();
    console.log("Attacker trapped (ghost tokens minted if trapMode=GhostToken).");
  } catch (err) {
    console.log("Attacker trap reverted:", (err as Error).message);
  }

  // --- 5. Try backup withdraw before deadman delay (should fail) ---
  console.log("\nBackup trying to withdraw early...");
  try {
    await (await vault.connect(backup).withdrawETH(ethers.parseEther("0.1"), backup.address)).wait();
  } catch (err) {
    console.log("Backup withdraw failed as expected:", (err as Error).message);
  }

  // --- 6. Advance time & allow backup to withdraw ---
  console.log("\nAdvancing time by 4000s (> deadman delay)...");
  await network.provider.send("evm_increaseTime", [4000]);
  await network.provider.send("evm_mine");

  console.log("Backup withdrawing 0.1 ETH...");
  await (await vault.connect(backup).withdrawETH(ethers.parseEther("0.1"), backup.address)).wait();
  console.log("Backup successfully withdrew after timeout!");

  // --- 7. Final balances ---
  const vaultBalance = await ethers.provider.getBalance(vaultAddr);
  const backupBalanceFinal = await ethers.provider.getBalance(backup.address);
  console.log("\n✅ Final Balances:");
  console.log("Vault ETH left:", ethers.formatEther(vaultBalance));
  console.log("Backup ETH balance:", ethers.formatEther(backupBalanceFinal));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
