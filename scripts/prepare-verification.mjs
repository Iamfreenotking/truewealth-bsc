import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { AbiCoder } from "ethers";

const wallet = "0x5d5d0f0b1b64c40d6e27528cf678d0e188e941ec";
const root = new URL("../", import.meta.url);
const buildInfoDir = new URL("artifacts/build-info/", root);
const files = (await readdir(buildInfoDir)).filter((name) => name.endsWith(".json") && !name.endsWith(".output.json"));
let input;
let compilerVersion;
for (const name of files) {
  const buildInfo = JSON.parse(await readFile(new URL(name, buildInfoDir), "utf8"));
  if (buildInfo.input?.sources?.["project/contracts/TrueWealth.sol"]) {
    input = buildInfo.input;
    compilerVersion = buildInfo.solcLongVersion;
    break;
  }
}
if (!input) throw new Error("Run npm run compile first; token build info was not found");

const verificationDir = new URL("verification/", root);
await mkdir(verificationDir, { recursive: true });
await writeFile(new URL("standard-json-input.json", verificationDir), JSON.stringify(input, null, 2));
const args = AbiCoder.defaultAbiCoder().encode(["address", "address"], [wallet, wallet]).slice(2);
await writeFile(new URL("constructor-arguments.txt", verificationDir), `${args}\n`);
const reserveArgs = AbiCoder.defaultAbiCoder().encode(["address"], [wallet]).slice(2);
await writeFile(new URL("reserve-constructor-arguments.txt", verificationDir), `${reserveArgs}\n`);
console.log("Prepared verification/standard-json-input.json and both constructor argument files");
console.log("BscScan contract name: project/contracts/TrueWealth.sol:TrueWealth");
console.log("BscScan reserve name: project/contracts/TrueWealth.sol:TeamReserve");
console.log(`Compiler: v${compilerVersion}; optimization: enabled, 200 runs; EVM version: paris`);
