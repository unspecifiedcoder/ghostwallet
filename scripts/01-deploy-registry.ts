import { ethers } from "hardhat";

async function main() {
  if (!process.env.PRIVATE_KEY) throw new Error("PRIVATE_KEY not set");

  // Create deployer wallet with provider
  const deployer = new ethers.Wallet(process.env.PRIVATE_KEY, ethers.provider);
  console.log("Deploying with address:", deployer.address);

  // Get contract factory with deployer
  const Registry = await ethers.getContractFactory("ShadowRegistry", deployer);
  const reg = await Registry.deploy(deployer.address);
  await reg.waitForDeployment();

  console.log("ShadowRegistry deployed at:", await reg.getAddress());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});