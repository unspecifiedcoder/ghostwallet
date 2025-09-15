// scripts/event.ts
import { ethers } from "ethers";

interface EventProcessorOpts {
  rpc: ethers.Provider;
  factoryAddr: string;
  registryAddr: string;
  ghostAddr: string;
}

export async function startEventProcessor(opts: EventProcessorOpts) {
  const factoryAbi = [
    "event VaultCreated(address indexed user, address indexed wallet)",
  ];
  const factory = new ethers.Contract(
    opts.factoryAddr,
    factoryAbi,
    opts.rpc
  );

  factory.on("VaultCreated", (user, wallet) => {
    console.log("VaultCreated event caught locally:", user, wallet);
    // here you’d call Yellow API or update off-chain state
  });
}
