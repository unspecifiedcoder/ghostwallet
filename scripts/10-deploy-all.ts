import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";

dotenv.config();
// add imports for your off-chain modules
import { startYellowListener  } from "./yellow" // you create this
import { startEventProcessor } from "./event";  // you create this

async function logTxCost(label: string, tx: any) {
  const receipt = await tx.wait();
  const gasUsed = receipt.gasUsed;
  const gasPrice = tx.gasPrice ?? (await ethers.provider.getFeeData()).gasPrice;
  const cost = gasUsed * (gasPrice ?? 0n);
  console.log(
    `${label}: gasUsed=${gasUsed.toString()}, gasPrice=${ethers.formatUnits(
      gasPrice ?? 0n,
      "gwei"
    )} gwei, cost=${ethers.formatEther(cost)} MON`
  );
  return receipt;
}

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // --- Deploy ShadowRegistry ---
  const Registry = await ethers.getContractFactory("ShadowRegistry");
  const registry = await Registry.deploy(deployer.address);
  await registry.waitForDeployment();
  await logTxCost("ShadowRegistry deployed", registry.deploymentTransaction());
  const registryAddr = await registry.getAddress();

  // --- Deploy GhostToken ---
  const Ghost = await ethers.getContractFactory("GhostToken");
  const ghost = await Ghost.deploy(deployer.address);
  await ghost.waitForDeployment();
  await logTxCost("GhostToken deployed", ghost.deploymentTransaction());
  const ghostAddr = await ghost.getAddress();

  // --- Deploy ShadeVaultFactory ---
  const Factory = await ethers.getContractFactory("ShadeVaultFactory");
  const factory = await Factory.deploy(
    deployer.address,
    registryAddr,
    ghostAddr
  );
  await factory.waitForDeployment();
  await logTxCost("ShadeVaultFactory deployed", factory.deploymentTransaction());
  const factoryAddr = await factory.getAddress();

  // --- Create a vault ---
  const createTx = await factory.createVault(
    deployer.address, // owner
    process.env.BACKUP!, // backup
    parseInt(process.env.DEADMAN || "3600"),
    parseInt(process.env.INACTIVITY || "86400"),
    1, // DestructAction.TransferToBackup
    1 // TrapMode.GhostToken
  );
  const receipt = await logTxCost("Vault created", createTx);

  // decode VaultCreated event
  let vaultAddr: string | undefined;
  for (const log of receipt.logs) {
    try {
      const parsed = factory.interface.parseLog(log);
      if (parsed && parsed.name === "VaultCreated") {
        vaultAddr = parsed.args[1];
        break;
      }
    } catch {}
  }
  console.log("Vault deployed at:", vaultAddr);

  // --- Update .env ---
  const envPath = path.resolve(__dirname, "../.env");
  const envConfig = fs.existsSync(envPath)
    ? dotenv.parse(fs.readFileSync(envPath))
    : {};

  envConfig.REGISTRY = registryAddr;
  envConfig.GHOST = ghostAddr;
  envConfig.FACTORY = factoryAddr;
  if (vaultAddr) envConfig.VAULT = vaultAddr;

  const newEnv = Object.entries(envConfig)
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");

  fs.writeFileSync(envPath, newEnv);
  console.log("\n✅ .env file updated with new addresses!");

  // --- Boot off-chain listeners ---
  console.log("\n🔄 Starting Yellow sandbox & event processor…\n");
  await startYellowListener({
    wsUrl: process.env.YELLOW_WS!,
    faucet: process.env.FAUCET!,
    vault: vaultAddr!,
    user: deployer.address,
  });

  await startEventProcessor({
    rpc: ethers.provider,
    factoryAddr,
    registryAddr,
    ghostAddr,
  });
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
