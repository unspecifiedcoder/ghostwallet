import { ethers } from "hardhat";
import { getSigner } from "./tools";

async function main() {
  await getSigner();
  const Ghost = await ethers.getContractFactory("GhostToken");
  const g = await Ghost.deploy();
  await g.waitForDeployment();
  console.log("GhostToken:", await g.getAddress());
}
main().catch((e) => { console.error(e); process.exit(1); });
