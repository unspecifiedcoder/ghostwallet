# 👻 GhostWallet - The Active Defense Smart Wallet

### A high-security, event-driven smart wallet that actively fights back against attackers, powered by the Yellow SDK for real-time, cross-chain security.

**Built for the Yellow Bizzathon.**

![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blueviolet)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Hardhat](https://img.shields.io/badge/Hardhat-2.x-orange)
![Yellow SDK](https://img.shields.io/badge/Yellow%20SDK-Nitrolite-yellow)

---

## 🔹 The Problem: Crypto Security is Reactive

Standard crypto wallets are passive vaults. Their entire security model relies on hoping a private key is never stolen. If a key is compromised, it's game over. They are reactive, not proactive, and they are isolated to a single chain, making multi-chain security a nightmare.

## 🔸 Our Solution: Active Defense with a Hybrid Architecture

GhostWallet is not just a vault; it's an **active security system** that protects your assets even if your key is compromised. It achieves this with a powerful hybrid architecture:

* **On-Chain Fortress:** A robust smart contract with multiple layers of automated and deceptive security features.
* **Off-Chain Nervous System:** A backend service that uses the **Yellow SDK (Nitrolite)** to listen to on-chain events and manage a real-time, cross-chain "Shadow Mirror" of a user's security status.

---

## ⚡ The Magic: Real-Time Automation with the Yellow SDK

The Yellow SDK is the core of our off-chain architecture, enabling a seamless and real-time user experience that is impossible with on-chain logic alone.

* **Event-Driven Automation:** Our backend service (`mirror-service.ts`) listens for on-chain events like `ShadowMirrorRequest` and `BoobyTrapTriggered`. When an event is detected, it triggers immediate off-chain actions, such as updating a user's dashboard or logging an attack.

* **High-Speed Cross-Chain State:** When a new `GhostWallet` is deployed on any blockchain, our service uses the `createAppSessionMessage` function from the Nitrolite SDK to instantly update a unified, off-chain application session on a **ClearNode**. This creates a "Shadow Mirror" of the user's wallets, providing a single source of truth for their multi-chain assets.

* **Gasless Real-Time Notifications:** By connecting a frontend to the ClearNode, we can push security alerts and wallet updates to the user **instantly and without any gas fees**. This provides a vastly superior and more secure user experience than any purely on-chain solution.

---

## 演示 Demo Scenarios

Our project is fully demonstrable in two powerful ways:

### Demo 1: The On-Chain Fortress
This demo runs on a single testnet and showcases the wallet's unique, active defense mechanisms.

1.  **Decoy Mode:** We show two views of the wallet. The owner sees the **real balance (e.g., 1 ETH)**, while an attacker sees a **fake decoy balance (0.01 ETH)**.
2.  **Booby Trap:** We simulate an attack from a flagged address. The audience sees the attacker's transaction **instantly revert**, forcing them to waste money on gas fees.
3.  **Dead Man's Switch:** We demonstrate the automated inheritance by showing how a designated backup recipient can successfully recover the funds after a preset inactivity period.

### Demo 2: The Cross-Chain Shadow Mirror (Powered by Nitrolite)
This demo showcases the power of the Yellow SDK.

1.  **Unified Dashboard:** We show a dashboard connected to the ClearNode, displaying a user's Ghost Wallet on the Sepolia testnet.
2.  **Real-Time Update:** We deploy a *new* Ghost Wallet for the same user on a different chain (e.g., Arbitrum Sepolia).
3.  **The "Wow" Moment:** **Instantly, without a page refresh**, the new wallet appears on the dashboard. This proves our ability to create a seamless, real-time, multi-chain user experience, made possible only by the high-speed off-chain messaging of the Nitrolite SDK.

---

## 🏗️ Architecture Flow

Brainstormer

Show thinking
Got it. Let's craft the ultimate README for your hackathon submission.

This version takes the best of your draft, incorporates all the powerful ideas we've discussed in our chat, and is structured to be instantly impressive to the Yellow Bizzathon judges. It tells a compelling story, highlights the most exciting features, and puts your innovative use of the Yellow SDK front and center.

You can copy and paste the entire code block directly into your README.md file.

Markdown

# 👻 GhostWallet - The Active Defense Smart Wallet

### A high-security, event-driven smart wallet that actively fights back against attackers, powered by the Yellow SDK for real-time, cross-chain security.

**Built for the Yellow Bizzathon.**

![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blueviolet)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Hardhat](https://img.shields.io/badge/Hardhat-2.x-orange)
![Yellow SDK](https://img.shields.io/badge/Yellow%20SDK-Nitrolite-yellow)

---

## 🔹 The Problem: Crypto Security is Reactive

Standard crypto wallets are passive vaults. Their entire security model relies on hoping a private key is never stolen. If a key is compromised, it's game over. They are reactive, not proactive, and they are isolated to a single chain, making multi-chain security a nightmare.

## 🔸 Our Solution: Active Defense with a Hybrid Architecture

GhostWallet is not just a vault; it's an **active security system** that protects your assets even if your key is compromised. It achieves this with a powerful hybrid architecture:

* **On-Chain Fortress:** A robust smart contract with multiple layers of automated and deceptive security features.
* **Off-Chain Nervous System:** A backend service that uses the **Yellow SDK (Nitrolite)** to listen to on-chain events and manage a real-time, cross-chain "Shadow Mirror" of a user's security status.

---

## ⚡ The Magic: Real-Time Automation with the Yellow SDK

The Yellow SDK is the core of our off-chain architecture, enabling a seamless and real-time user experience that is impossible with on-chain logic alone.

* **Event-Driven Automation:** Our backend service (`mirror-service.ts`) listens for on-chain events like `ShadowMirrorRequest` and `BoobyTrapTriggered`. When an event is detected, it triggers immediate off-chain actions, such as updating a user's dashboard or logging an attack.

* **High-Speed Cross-Chain State:** When a new `GhostWallet` is deployed on any blockchain, our service uses the `createAppSessionMessage` function from the Nitrolite SDK to instantly update a unified, off-chain application session on a **ClearNode**. This creates a "Shadow Mirror" of the user's wallets, providing a single source of truth for their multi-chain assets.

* **Gasless Real-Time Notifications:** By connecting a frontend to the ClearNode, we can push security alerts and wallet updates to the user **instantly and without any gas fees**. This provides a vastly superior and more secure user experience than any purely on-chain solution.

---

## 演示 Demo Scenarios

Our project is fully demonstrable in two powerful ways:

### Demo 1: The On-Chain Fortress
This demo runs on a single testnet and showcases the wallet's unique, active defense mechanisms.

1.  **Decoy Mode:** We show two views of the wallet. The owner sees the **real balance (e.g., 1 ETH)**, while an attacker sees a **fake decoy balance (0.01 ETH)**.
2.  **Booby Trap:** We simulate an attack from a flagged address. The audience sees the attacker's transaction **instantly revert**, forcing them to waste money on gas fees.
3.  **Dead Man's Switch:** We demonstrate the automated inheritance by showing how a designated backup recipient can successfully recover the funds after a preset inactivity period.

### Demo 2: The Cross-Chain Shadow Mirror (Powered by Nitrolite)
This demo showcases the power of the Yellow SDK.

1.  **Unified Dashboard:** We show a dashboard connected to the ClearNode, displaying a user's Ghost Wallet on the Sepolia testnet.
2.  **Real-Time Update:** We deploy a *new* Ghost Wallet for the same user on a different chain (e.g., Arbitrum Sepolia).
3.  **The "Wow" Moment:** **Instantly, without a page refresh**, the new wallet appears on the dashboard. This proves our ability to create a seamless, real-time, multi-chain user experience, made possible only by the high-speed off-chain messaging of the Nitrolite SDK.

---

## 🏗️ Architecture Flow

[On-Chain Event on Chain A] ---+
|
+--> [Backend Service (mirror-service.ts)]
|
[On-Chain Event on Chain B] ---+
|
V
[Yellow SDK (Nitrolite)]
|
V
[ClearNode Off-Chain Application Session]
|
V
[Real-Time Dashboard/UI]


---

## 🛠️ Tech Stack

-   **Core Off-Chain Logic:** **Yellow SDK (Nitrolite)**
-   **Smart Contracts:** Hardhat, Solidity, TypeScript, OpenZeppelin
-   **Backend:** Node.js, Ethers.js, WebSocket

---

## 🚀 How to Run

1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **Compile Contracts:**
    ```bash
    npx hardhat compile
    ```
3.  **Run Tests:**
    ```bash
    npx hardhat test
    ```
4.  **Start the Backend Service:**
    *Create a `.env` file with your private key and RPC URLs.*
    ```bash
    npm run start:mirror
    ```

---

## 🔗 Links & Resources

-   **Yellow SDK Documentation:** [https://docs.yellow.com/](https://docs.yellow.com/)
-   **GitHub Repository:** `https://github.com/unspecifiedcoder/ghostwallet`
