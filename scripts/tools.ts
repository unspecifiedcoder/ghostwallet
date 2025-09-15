import { ethers } from "hardhat";

export async function getSigner() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  return deployer;
}
