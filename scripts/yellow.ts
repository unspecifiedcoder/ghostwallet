// scripts/yellow.ts
import WebSocket from "ws";
import fetch from "node-fetch";

interface YellowOpts {
  wsUrl: string;
  faucet: string;
  vault: string;
  user: string;
}

export async function startYellowListener(opts: YellowOpts) {
  // fund test tokens if needed
  await fetch(opts.faucet, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address: opts.user, amount: "100" }),
  });

  const ws = new WebSocket(opts.wsUrl);
  ws.on("open", () => {
    console.log("Connected to Yellow sandbox");
    // subscribe to channels for this vault/user
    ws.send(JSON.stringify({ type: "subscribe", vault: opts.vault }));
  });

  ws.on("message", (msg) => {
    console.log("Yellow event:", msg.toString());
  });
}
