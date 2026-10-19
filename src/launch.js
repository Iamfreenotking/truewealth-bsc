import { BrowserProvider, Contract, ContractFactory, formatEther, getAddress, isAddress, parseEther, ZeroAddress } from "ethers";
import tokenArtifact from "../artifacts/contracts/TrueWealth.sol/TrueWealth.json";

const EXPECTED = getAddress("0x5d5d0f0b1b64c40d6e27528cf678d0e188e941ec");
const ROUTER = getAddress("0x10ED43C718714eb63d5aA57B78B54704E256024E");
const DEAD = getAddress("0x000000000000000000000000000000000000dEaD");
const LAUNCH_SUPPLY = parseEther("204750000");
const routerAbi = [
  "function factory() view returns (address)",
  "function addLiquidityETH(address token,uint amountTokenDesired,uint amountTokenMin,uint amountETHMin,address to,uint deadline) payable returns (uint amountToken,uint amountETH,uint liquidity)"
];
const factoryAbi = ["function getPair(address,address) view returns (address)"];
const pairAbi = ["function balanceOf(address) view returns (uint256)"];
const tokenAbi = tokenArtifact.abi;

const byId = (id) => document.getElementById(id);
byId("expected").textContent = EXPECTED;
byId("router-address").textContent = ROUTER;
byId("burn-address").textContent = DEAD;

let provider;
let signer;
let tokenAddress = localStorage.getItem("truewealth-token-56") || "";
let busy = false;

function status(message) {
  byId("status").textContent = message;
}

function fail(error) {
  const message = error?.code === "ACTION_REJECTED" || error?.code === 4001
    ? "你在钱包里取消了操作；没有继续执行。如需重试，请重新点击按钮。"
    : error?.shortMessage || error?.reason || error?.message || String(error);
  status(`操作没有完成：${message}`);
}

function connectionStatus(message) {
  byId("connect-status").textContent = message;
  status(message);
}

function refresh() {
  byId("token-address").textContent = tokenAddress || "尚未创建";
  byId("deploy").disabled = busy || !signer || !!tokenAddress || !byId("deploy-consent").checked;
  byId("deploy-hint").textContent = tokenAddress ? "这个浏览器已记录代币地址，不会重复创建。" : !signer ? "请先完成第 1 步：连接钱包。" : !byId("deploy-consent").checked ? "请先认真核对信息，再勾选上面的确认框。" : "可以点击创建；最后仍需你在 OKX 钱包亲自确认并支付网络手续费。";
  byId("recover").disabled = busy || !signer || !isAddress(byId("recover-address").value.trim());
  byId("recover-hint").textContent = !signer ? "请先连接钱包，再填写完整的代币合约地址。" : isAddress(byId("recover-address").value.trim()) ? "可以检查；这一步只读取链上信息，不收费。" : "请填写完整的、以 0x 开头的代币合约地址。";
  let validAmounts = false;
  try {
    const tokens = parseEther(byId("token-amount").value);
    const bnb = parseEther(byId("bnb-amount").value);
    validAmounts = tokens > 0n && tokens <= LAUNCH_SUPPLY && bnb > 0n;
  } catch { /* 数量未填或格式不正确时，按钮保持不可点击。 */ }
  byId("pool").disabled = busy || !signer || !tokenAddress || !validAmounts || !byId("pool-consent").checked;
  byId("pool-hint").textContent = !signer ? "请先完成第 1 步：连接钱包。" : !tokenAddress ? "请先完成第 2 步：创建代币。" : !validAmounts ? "请填写大于 0 的代币和 BNB 数量；代币不能超过你可用的 2.0475 亿个。" : !byId("pool-consent").checked ? "请先核对数量和风险，再勾选上面的确认框。" : "可以继续；真正放入资金前，你还要在 OKX 钱包逐笔确认。";
  const tokenAmount = Number(byId("token-amount").value);
  const bnbAmount = Number(byId("bnb-amount").value);
  byId("price").textContent = validAmounts && tokenAmount > 0 && bnbAmount > 0
    ? `按你填写的数量，起始比例大约是：1 BNB 可换 ${(tokenAmount / bnbAmount).toLocaleString()} 个 TRUEWEALTH；1 个 TRUEWEALTH 约值 ${(bnbAmount / tokenAmount).toPrecision(6)} BNB。实际成交价格会随买卖变化。`
    : "填好两个有效数量后，这里会显示起始兑换比例。";
}

async function assertWallet() {
  if (!signer) throw new Error("请先完成第 1 步：连接 OKX 钱包");
  const network = await provider.getNetwork();
  if (network.chainId !== 56n) throw new Error("钱包不在 BNB 主网（网络编号 56）；请切换后重试");
  if (getAddress(await signer.getAddress()) !== EXPECTED) throw new Error("当前钱包地址与你指定的地址不一致；请先在 OKX 中切换账户");
}

async function connect() {
  byId("connect").disabled = true;
  connectionStatus("正在请求 OKX 钱包连接；请查看 Brave 中的 OKX 弹窗。");
  try {
    const injected = window.okxwallet || window.ethereum?.providers?.find((p) => p.isOkxWallet) || (window.ethereum?.isOkxWallet ? window.ethereum : null);
    if (!injected) throw new Error("当前浏览器没有检测到 OKX 钱包扩展；请在安装该钱包的 Brave 中打开此页面");
    const accounts = await injected.request({ method: "eth_requestAccounts" });
    if (!accounts?.length || getAddress(accounts[0]) !== EXPECTED) {
      throw new Error(`OKX 当前账户不是指定的上线地址 ${EXPECTED}；请在 OKX 中切换账户后重试`);
    }
    const chainId = await injected.request({ method: "eth_chainId" });
    if (BigInt(chainId) !== 56n) {
      connectionStatus(`OKX 当前网络编号为 ${BigInt(chainId)}，不是 BNB 主网。正在请求切换；如果钱包弹窗出现，请由你亲自确认。`);
      try {
        await injected.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0x38" }] });
      } catch (error) {
        if (error?.code === 4902) {
          throw new Error("OKX 尚未添加 BNB Smart Chain 主网；请先在钱包里添加 Chain ID 56，然后重试");
        }
        if (error?.code === 4001) {
          throw new Error("你取消了切换网络；请先在 OKX 中选择 BNB Smart Chain 主网，再重新连接");
        }
        throw error;
      }
    }
    provider = new BrowserProvider(injected);
    signer = await provider.getSigner();
    await assertWallet();
    byId("wallet").textContent = `已连接 ${await signer.getAddress()}；余额 ${formatEther(await provider.getBalance(EXPECTED))} BNB`;
    if (tokenAddress) await loadToken(tokenAddress);
    connectionStatus("第 1 步完成：已连接指定的钱包和 BNB 主网。连接没有花钱；请阅读第 2 步，再决定是否创建代币。");
  } catch (error) {
    signer = undefined;
    fail(error);
    byId("connect-status").textContent = byId("status").textContent;
  }
  byId("connect").disabled = false;
  refresh();
}

async function loadToken(address) {
  if (!isAddress(address) || (await provider.getCode(address)) === "0x") {
    throw new Error("该代币地址在 BNB 主网上不存在");
  }
  const token = new Contract(address, tokenAbi, provider);
  if (await token.totalSupply() !== parseEther("210000000") || await token.symbol() !== "TRUEWEALTH") {
    throw new Error("本地记录的合约信息与本项目不符，请停止使用此页面");
  }
  const reserveAddress = await token.teamReserve();
  const reserve = new Contract(reserveAddress, ["function beneficiary() view returns (address)", "function token() view returns (address)"], provider);
  if (getAddress(await reserve.beneficiary()) !== EXPECTED || getAddress(await reserve.token()) !== getAddress(address)) {
    throw new Error("团队保管合约受益人或代币地址不符");
  }
  byId("reserve-address").textContent = reserveAddress;
}

async function recover() {
  busy = true; refresh();
  try {
    await assertWallet();
    const address = getAddress(byId("recover-address").value.trim());
    await loadToken(address);
    tokenAddress = address;
    localStorage.setItem("truewealth-token-56", address);
    status(`页面记录已找回：这个地址的代币信息与预期一致，页面现在会记住它。请再与原始部署交易核对地址。链上查看：https://bscscan.com/address/${address}`);
  } catch (error) { fail(error); }
  busy = false; refresh();
}

async function deploy() {
  busy = true; refresh();
  try {
    await assertWallet();
    if (!byId("deploy-consent").checked || tokenAddress) throw new Error("未确认部署参数，或代币已部署");
    const factory = new ContractFactory(tokenAbi, tokenArtifact.bytecode, signer);
    const transaction = await factory.getDeployTransaction(EXPECTED, EXPECTED);
    const gas = await signer.estimateGas(transaction);
    const gasPrice = (await provider.getFeeData()).gasPrice;
    status(`创建代币预计需要 ${gasPrice ? formatEther(gas * gasPrice) : "未知数量的"} BNB 网络手续费。请在 OKX 钱包核对费用并亲自确认；如果不想继续，可以拒绝。`);
    const contract = await factory.deploy(EXPECTED, EXPECTED);
    const receipt = await contract.deploymentTransaction().wait();
    tokenAddress = getAddress(await contract.getAddress());
    localStorage.setItem("truewealth-token-56", tokenAddress);
    await loadToken(tokenAddress);
    status(`第 2 步完成：代币已创建，但还不能在 PancakeSwap 买卖；请先决定第 3 步要放入的代币和 BNB 数量。\n创建记录：https://bscscan.com/tx/${receipt.hash}\n代币地址：https://bscscan.com/address/${tokenAddress}`);
  } catch (error) { fail(error); }
  busy = false; refresh();
}

async function pool() {
  busy = true; refresh();
  try {
    await assertWallet();
    if (!byId("pool-consent").checked || !tokenAddress) throw new Error("尚未确认加池参数或代币尚未部署");
    const tokenAmount = parseEther(byId("token-amount").value);
    const bnbAmount = parseEther(byId("bnb-amount").value);
    if (tokenAmount <= 0n || bnbAmount <= 0n || tokenAmount > LAUNCH_SUPPLY) throw new Error("代币或 BNB 数量无效");
    if (await provider.getBalance(EXPECTED) <= bnbAmount) throw new Error("BNB 余额不足以支付流动性和网络费用");
    if (await provider.getCode(ROUTER) === "0x") throw new Error("PancakeSwap 路由器地址没有合约代码");
    const router = new Contract(ROUTER, routerAbi, signer);
    const factory = new Contract(await router.factory(), factoryAbi, provider);
    const wrappedBnb = getAddress("0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c");
    if (await factory.getPair(tokenAddress, wrappedBnb) !== ZeroAddress) throw new Error("代币/BNB 池已存在；请先人工核对池子与价格，当前页面只支持首次建池");
    const token = new Contract(tokenAddress, tokenAbi, signer);
    if (await token.balanceOf(EXPECTED) < tokenAmount) throw new Error("钱包代币余额不足");
    const allowance = await token.allowance(EXPECTED, ROUTER);
    if (allowance < tokenAmount) {
      status(`第 1 次钱包确认：只允许 PancakeSwap 使用你填写的 ${byId("token-amount").value} 个 TRUEWEALTH。请在 OKX 中核对并亲自确认。`);
      const approved = await token.approve(ROUTER, tokenAmount);
      await approved.wait();
    }
    if (await factory.getPair(tokenAddress, wrappedBnb) !== ZeroAddress) throw new Error("授权期间池子已被创建；加池已停止，请人工核对");
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 20 * 60);
    const minToken = tokenAmount * 99n / 100n;
    const minBnb = bnbAmount * 99n / 100n;
    status(`第 2 次钱包确认：准备放入 ${byId("token-amount").value} 个 TRUEWEALTH 和 ${byId("bnb-amount").value} BNB。代表取回权的 LP 会直接送到无法控制的地址 ${DEAD}。请在 OKX 中核对并亲自确认。`);
    const tx = await router.addLiquidityETH(tokenAddress, tokenAmount, minToken, minBnb, DEAD, deadline, { value: bnbAmount });
    const receipt = await tx.wait();
    const pairAddress = await factory.getPair(tokenAddress, wrappedBnb);
    if (pairAddress === ZeroAddress) throw new Error("交易已执行，但未找到 V2 池地址；请核对交易记录");
    const pair = new Contract(pairAddress, pairAbi, provider);
    const burnedLp = await pair.balanceOf(DEAD);
    byId("pair-address").textContent = pairAddress;
    byId("lp-proof").textContent = `${formatEther(burnedLp)} LP 已在销毁地址`;
    byId("lp-proof").href = `https://bscscan.com/token/${pairAddress}?a=${DEAD}`;
    status(`第 3 步完成：PancakeSwap V2 交易池已创建。\n交易记录：https://bscscan.com/tx/${receipt.hash}\n交易池：https://bscscan.com/address/${pairAddress}\n无法取回地址持有 ${formatEther(burnedLp)} 个 LP 凭证。`);
  } catch (error) { fail(error); }
  busy = false; refresh();
}

byId("connect").addEventListener("click", connect);
byId("deploy").addEventListener("click", deploy);
byId("recover").addEventListener("click", recover);
byId("pool").addEventListener("click", pool);
for (const id of ["deploy-consent", "pool-consent", "token-amount", "bnb-amount", "recover-address"]) byId(id).addEventListener("input", refresh);
refresh();
