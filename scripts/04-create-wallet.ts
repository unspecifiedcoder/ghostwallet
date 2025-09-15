import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

async function main() {
  const [deployer]: HardhatEthersSigner[] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const factoryAddress: string = process.env.FACTORY as string;
  const factory = await ethers.getContractAt("ShadeVaultFactory", factoryAddress, deployer);
  console.log("Factory at:", factory.target);

  const userAddress = deployer.address;
  const backupAddress = process.env.BACKUP as string;
  const deadmanDelay = BigInt(process.env.DEADMAN!);
  const inactivityTimeout = BigInt(process.env.INACTIVITY!);

  // adjust values if your contract uses enums
  const destructAction = 1n; // e.g. TransferToBackup
  const trapMode       = 2n; // e.g. Revert

  const tx = await factory.createVault(
    userAddress,
    backupAddress,
    deadmanDelay,
    inactivityTimeout,
    destructAction,
    trapMode
  );

  console.log("⏳ Waiting for confirmation...");
  const receipt = await tx.wait();
  if (!receipt) {
    throw new Error("Transaction receipt is null");
  }

  let found = false;
  for (const log of receipt.logs) {
    try {
      const parsed = factory.interface.parseLog(log);
      if (parsed && parsed.name === "VaultCreated") {
        console.log("✅ VaultCreated — user:", parsed.args[0], "vault:", parsed.args[1]);
        found = true;
        break;
      }
    } catch {
      // ignore logs from unrelated contracts
    }
  }

  if (!found) {
    console.log("⚠️ Vault created, but no VaultCreated event decoded. Tx hash:", receipt.hash);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
