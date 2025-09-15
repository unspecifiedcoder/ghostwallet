// scripts/03-deploy-factory.ts
import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // --- Load previously deployed addresses ---
  const registryAddr = process.env.REGISTRY!;
  const ghostAddr = process.env.GHOST!;

  if (!registryAddr || !ghostAddr) {
    throw new Error("REGISTRY or GHOST address not set in .env");
  }

  // --- Deploy ShadeVaultFactory ---
  const Factory = await ethers.getContractFactory("ShadeVaultFactory", deployer);
  const factory = await Factory.deploy(deployer.address, registryAddr, ghostAddr);
  await factory.waitForDeployment();
  console.log("ShadeVaultFactory deployed at:", await factory.getAddress());

  // --- Attach GhostToken and give factory minter rights ---
  const ghostToken = await ethers.getContractAt("GhostToken", ghostAddr, deployer);
  const tx1 = await ghostToken.setMinter(await factory.getAddress(), true);
  await tx1.wait();
  console.log("Factory set as GhostToken minter");

  // --- Attach Registry and update admin safely ---
  const registry = await ethers.getContractAt("ShadowRegistry", registryAddr, deployer);

  try {
    const tx2 = await registry.setAdmin(await factory.getAddress());
    await tx2.wait();
    console.log("Registry admin updated to Factory:", await factory.getAddress());
  } catch (err: any) {
    if (err.message.includes("REG:NOT_ADMIN")) {
      console.log(
        "⚠️ Skipping registry.setAdmin() because deployer is not admin (already assigned or using different account)"
      );
    } else {
      throw err;
    }
  }

  console.log("\n✅ Factory deployment completed successfully!");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
