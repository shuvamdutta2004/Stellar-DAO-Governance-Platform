#!/usr/bin/env ts-node
/**
 * DAO Governance Contract Deployment Script
 * ============================================
 * Deploys the Stellar DAO Governance smart contract to Stellar Testnet.
 *
 * Prerequisites:
 *  - Stellar CLI installed (https://developers.stellar.org/docs/tools/cli)
 *  - Rust + wasm32 target: rustup target add wasm32-unknown-unknown
 *  - stellar keys generate --fund deployer --network testnet
 *
 * Usage:
 *  npx ts-node scripts/deploy.ts
 *
 * Outputs the CONTRACT_ID to .env.local
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

// Prepend Stellar CLI path so execSync can run the CLI
process.env.PATH = `C:\\Program Files (x86)\\Stellar CLI;${process.env.PATH}`;

// ─── Config ──────────────────────────────────────────────────────────────────

const NETWORK = "testnet";
const RPC_URL = "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";
const DEPLOYER_ALIAS = "deployer";

// Initial members for the DAO (can be changed before deployment).
// For demo purposes we use the deployer as the first member.
const INITIAL_SIGNERS: string[] = [
  "GD73H6YI3Z63WGVEVXC4NECRTNXZ6EPYIDUJIQHGWKK6IOAG5D7PNUO2"
];
const THRESHOLD = 1; // 1-of-N for demo (change to 2 for 2-of-3 etc.)

// ─── Helpers ─────────────────────────────────────────────────────────────────

function run(cmd: string): string {
  console.log(`\n$ ${cmd}`);
  try {
    const output = execSync(cmd, { encoding: "utf8", stdio: ["inherit", "pipe", "pipe"] });
    if (output) process.stdout.write(output);
    return output.trim();
  } catch (err: any) {
    console.error(`Error: ${err.stderr || err.message}`);
    throw err;
  }
}

function writeEnvLocal(contractId: string, deployerAddress: string) {
  const envPath = path.join(process.cwd(), ".env.local");
  let existing = "";
  if (fs.existsSync(envPath)) {
    existing = fs.readFileSync(envPath, "utf8");
  }

  // Replace or append each variable
  const vars: Record<string, string> = {
    NEXT_PUBLIC_TREASURY_CONTRACT_ID: contractId,
    NEXT_PUBLIC_STELLAR_NETWORK: NETWORK,
    NEXT_PUBLIC_STELLAR_RPC_URL: RPC_URL,
    NEXT_PUBLIC_NETWORK_PASSPHRASE: NETWORK_PASSPHRASE,
    NEXT_PUBLIC_DEPLOYER_ADDRESS: deployerAddress,
    NEXT_PUBLIC_HORIZON_URL: "https://horizon-testnet.stellar.org",
  };

  let content = existing;
  for (const [key, value] of Object.entries(vars)) {
    const regex = new RegExp(`^${key}=.*$`, "m");
    const line = `${key}=${value}`;
    if (regex.test(content)) {
      content = content.replace(regex, line);
    } else {
      content += `\n${line}`;
    }
  }

  fs.writeFileSync(envPath, content.trim() + "\n");
  console.log(`\n✅ Written to .env.local`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🚀 Stellar DAO Governance Deployment Script");
  console.log("=============================================\n");

  // Step 1: Ensure deployer account exists and is funded
  console.log("Step 1: Setting up deployer account...");
  try {
    run(`stellar keys generate --fund ${DEPLOYER_ALIAS} --network ${NETWORK}`);
  } catch {
    console.log("  (account may already exist — continuing)");
  }

  const deployerAddress = run(`stellar keys public-key ${DEPLOYER_ALIAS}`);
  console.log(`  Deployer: ${deployerAddress}`);

  // Step 2: Locate pre-built WASM (contract logic is identical — only metadata/naming changed)
  console.log("\nStep 2: Locating pre-built contract WASM...");

  const possiblePaths = [
    path.join(process.cwd(), "target", "wasm32v1-none", "release", "dao_governance.wasm"),
    path.join(process.cwd(), "target", "wasm32-unknown-unknown", "release", "dao_governance.wasm"),
    // fallback: old treasury name (functionally identical, same contract ABI)
    path.join(process.cwd(), "target", "wasm32v1-none", "release", "treasury.wasm"),
    path.join(process.cwd(), "target", "wasm32-unknown-unknown", "release", "treasury.wasm"),
  ];

  let resolvedWasm = "";
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      resolvedWasm = p;
      break;
    }
  }

  if (!resolvedWasm) {
    // If no pre-built WASM exists, try to build from workspace root
    console.log("  No pre-built WASM found — attempting fresh build from workspace root...");
    run(`stellar contract build`);

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        resolvedWasm = p;
        break;
      }
    }
  }

  if (!resolvedWasm) {
    throw new Error(`WASM not found in any of the expected paths:\n${possiblePaths.join("\n")}`);
  }
  console.log(`  Using WASM: ${resolvedWasm}`);

  // Step 3: Deploy the contract
  console.log("\nStep 3: Deploying contract to testnet...");
  const deployOutput = run(
    `stellar contract deploy \
      --wasm "${resolvedWasm}" \
      --source ${DEPLOYER_ALIAS} \
      --network ${NETWORK} \
      --rpc-url ${RPC_URL} \
      --network-passphrase "${NETWORK_PASSPHRASE}" \
      --alias dao_governance \
      --ignore-checks`
  );

  // The deploy command outputs the contract ID on the last line
  const contractId = deployOutput.split("\n").filter(Boolean).pop() || deployOutput;
  console.log(`\n✅ Contract deployed! ID: ${contractId}`);

  // Step 4: Initialize the DAO
  console.log("\nStep 4: Initializing DAO governance...");

  const signers = [deployerAddress, ...INITIAL_SIGNERS];
  const signersArg = JSON.stringify(signers).replace(/"/g, '\\"');

  // Build the initialize invocation
  run(
    `stellar contract invoke \
      --id ${contractId} \
      --source ${DEPLOYER_ALIAS} \
      --network ${NETWORK} \
      --rpc-url ${RPC_URL} \
      --network-passphrase "${NETWORK_PASSPHRASE}" \
      -- \
      initialize \
      --signers "${signersArg}" \
      --threshold ${THRESHOLD}`
  );

  console.log(`\n✅ DAO initialized with ${signers.length} member(s), threshold=${THRESHOLD}`);

  // Step 5: Write to .env.local
  console.log("\nStep 5: Saving configuration...");
  writeEnvLocal(contractId, deployerAddress);

  console.log("\n🎉 Deployment complete!");
  console.log(`   Contract ID : ${contractId}`);
  console.log(`   Network     : ${NETWORK}`);
  console.log(`   DAO Admin   : ${deployerAddress}`);
  console.log(`   Member      : GD73H6YI3Z63WGVEVXC4NECRTNXZ6EPYIDUJIQHGWKK6IOAG5D7PNUO2`);
  console.log("\n   Start the dev server: npm run dev\n");
}

main().catch((err) => {
  console.error("\n❌ Deployment failed:", err.message || err);
  process.exit(1);
});
