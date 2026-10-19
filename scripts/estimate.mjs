import { readFile } from "node:fs/promises";
import { ContractFactory, JsonRpcProvider, formatEther } from "ethers";

const wallet = "0x5d5d0f0b1b64c40d6e27528cf678d0e188e941ec";
const rpc = new JsonRpcProvider("https://bsc-dataseed.bnbchain.org", 56);
const artifact = JSON.parse(await readFile(new URL("../artifacts/contracts/TrueWealth.sol/TrueWealth.json", import.meta.url)));
const factory = new ContractFactory(artifact.abi, artifact.bytecode);
const deployment = await factory.getDeployTransaction(wallet, wallet);
const [balance, gas, fee] = await Promise.all([
  rpc.getBalance(wallet),
  rpc.estimateGas({ ...deployment, from: wallet }),
  rpc.getFeeData()
]);

console.log(`Wallet BNB: ${formatEther(balance)}`);
console.log(`Estimated deployment gas: ${gas}`);
console.log(`Current gas price (gwei): ${fee.gasPrice ? Number(fee.gasPrice) / 1e9 : "unavailable"}`);
console.log(`Approximate deployment fee (BNB): ${fee.gasPrice ? formatEther(gas * fee.gasPrice) : "unavailable"}`);
