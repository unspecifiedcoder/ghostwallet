import { expect } from "chai";
import { ethers } from "hardhat";

describe("ShadeVault timers", () => {
  it("backup withdraws after deadman delay; self destruct after inactivity", async () => {
    const [owner, backup, admin] = await ethers.getSigners();

    const Ghost = await ethers.getContractFactory("GhostToken");
    const ghost = await Ghost.deploy();
    await ghost.waitForDeployment();

    const Reg = await ethers.getContractFactory("ShadowRegistry");
    const reg = await Reg.deploy(admin.address);

    const Vault = await ethers.getContractFactory("ShadeVault");
    const vault = await Vault.deploy(
      owner.address,
      backup.address,
      3,              // deadmanDelay
      10,             // inactivityTimeout
      1,              // DestructAction.TransferToBackup
      0,              // TrapMode.None
      await ghost.getAddress(),
      await reg.getAddress()
    );
    await vault.waitForDeployment();

    // allow mint
    await ghost.connect(admin).transfer(ethers.ZeroAddress, 0); // noop just to keep admin busy
    await ghost.connect(owner).transfer(ethers.ZeroAddress, 0); // noop

    // fund wallet
    await owner.sendTransaction({ to: await vault.getAddress(), value: ethers.parseEther("1") });

    // too soon for backup
    await expect(
      vault.connect(backup).withdrawETH(ethers.parseEther("0.1"), backup.address)
    ).to.be.revertedWith("SV:NOT_OWNER_OR_BACKUP");

    // time travel past deadman
    await ethers.provider.send("evm_increaseTime", [4]);
    await ethers.provider.send("evm_mine", []);

    // backup can withdraw
    await vault.connect(backup).withdrawETH(ethers.parseEther("0.1"), backup.address);

    // time travel past inactivityTimeout
    await ethers.provider.send("evm_increaseTime", [7]);
    await ethers.provider.send("evm_mine", []);

    // anyone can self destruct behavior (sweep)
    await vault.performSelfDestruct();

    expect(await ethers.provider.getBalance(await vault.getAddress())).to.eq(0n);
  });
});
