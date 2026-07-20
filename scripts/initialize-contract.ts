#!/usr/bin/env ts-node
/**
 * Post-deployment initialization helper.
 * Call this if you deployed the contract but forgot to initialize it.
 *
 * Usage:
 *   npx ts-node --project tsconfig.scripts.json scripts/initialize-contract.ts
 *
 * Set CONTRACT_ID and SIGNERS below before running.
 */

import { execSync } from "child_process";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const NETWORK = "testnet";
const RPC_URL = process.env.NEXT_PUBLIC_STELLAR_RPC_URL || "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE || "Test SDF Network ; September 2015";
const CONTRACT_ID = process.env.NEXT_PUBLIC_TREASURY_CONTRACT_ID!;
const DEPLOYER_ALIAS = "deployer";
const THRESHOLD = 1;

if (!CONTRACT_ID || CONTRACT_ID === "CONTRACT_ADDRESS_HERE") {
  console.error("❌ Set NEXT_PUBLIC_TREASURY_CONTRACT_ID in .env.local first");
  process.exit(1);
}

// Get deployer public key
const deployerAddress = execSync(`stellar keys public-key ${DEPLOYER_ALIAS}`, { encoding: "utf8" }).trim();

// Additional signers to register (optional, add more as needed)
const additionalSigners: string[] = [
  // "GADDR2...",
  // "GADDR3...",
];

const signers = [deployerAddress, ...additionalSigners];
const signersArg = signers.map((s) => `'${s}'`).join(", ");

console.log("🔧 Initializing contract...");
console.log(`   Contract: ${CONTRACT_ID}`);
console.log(`   Signers : ${signers.join(", ")}`);
console.log(`   Threshold: ${THRESHOLD}\n`);

execSync(
  `stellar contract invoke \
    --id ${CONTRACT_ID} \
    --source ${DEPLOYER_ALIAS} \
    --network ${NETWORK} \
    --rpc-url ${RPC_URL} \
    --network-passphrase "${NETWORK_PASSPHRASE}" \
    -- \
    initialize \
    --signers '[${signersArg}]' \
    --threshold ${THRESHOLD}`,
  { stdio: "inherit" }
);

console.log("\n✅ Contract initialized successfully!");
