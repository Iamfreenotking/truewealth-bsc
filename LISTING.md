# True Wealth listing dossier — evidence and outstanding requirements

This is a factual draft for future CoinGecko, CoinMarketCap, and wallet submissions. A live pair and a website do **not** guarantee listing, name search, a market price, or endorsement. Do not submit inaccurate claims or describe CZ's X account as a project account.

## Verified launch data

Snapshot: BNB Smart Chain block **128608198**, 2026-10-19 19:13 UTC. Balances and pool reserves can change; inspect the links again immediately before a submission.

| Item | Value |
| --- | --- |
| Name / symbol | True Wealth / TRUEWEALTH |
| Chain | BNB Smart Chain mainnet, chain ID 56 |
| Decimals / fixed supply | 18 / 210,000,000 |
| Token contract | [`0x962C4730CFd8478D63C754c6060B82Aa2142d8D1`](https://bscscan.com/address/0x962C4730CFd8478D63C754c6060B82Aa2142d8D1) |
| Team reserve contract | [`0x7e2a9d7373f257f39be79472D63c0cb660b8B75a`](https://bscscan.com/address/0x7e2a9d7373f257f39be79472D63c0cb660b8B75a) |
| Team reserve at snapshot | 5,250,000 TRUEWEALTH, 2.5% of supply |
| Fixed reserve beneficiary | `0x5D5D0F0b1b64c40d6e27528Cf678D0e188E941eC` |
| Transfer tax | 0%; exchange/network fees may still apply |
| Owner / pause / blacklist / further mint | None in the supplied token source; confirm explorer verification before relying on source claims |
| PancakeSwap V2 token/WBNB pair | [`0x4Adfb6c1503D8Fdcd2fbE39F4C4Ef5C941992ab1`](https://bscscan.com/address/0x4Adfb6c1503D8Fdcd2fbE39F4C4Ef5C941992ab1) |
| Initial pool deposit | 204,750,000 TRUEWEALTH + 0.001 BNB |
| LP burn holder | [`0x000000000000000000000000000000000000dEaD`](https://bscscan.com/token/0x4Adfb6c1503D8Fdcd2fbE39F4C4Ef5C941992ab1?a=0x000000000000000000000000000000000000dEaD) |
| Independent project information site | [truewealth-bnb.david-0946.chatgpt.site](https://truewealth-bnb.david-0946.chatgpt.site/) (free hosted subdomain, **not** a user-owned custom domain) |
| Original 32×32 SVG token logo | [Public download](https://truewealth-bnb.david-0946.chatgpt.site/logo-32.svg) |

The team allocation is held by the reserve contract, so the OKX wallet does **not** display it as a direct balance. The fixed beneficiary can withdraw at any time. It is **not** time-locked. At the snapshot, the launch wallet directly held 0 TRUEWEALTH; 204.75 million tokens were in the pool. The burn address held 452.493093869950681587 of 452.493093869950682587 total LP units; the 1000-wei difference is V2's minimum liquidity.

## Neutral short descriptions

> True Wealth is an independent community meme token on BNB Smart Chain. Its 210 million-token supply was created once at deployment, with no transfer tax or administrator controls in the supplied source. A separate immutable reserve held 2.5% for the designated team beneficiary at the stated snapshot. A PancakeSwap V2 pair was initialized with 204.75 million tokens and 0.001 BNB, and almost all LP tokens were sent to a burn address. This very small BNB reserve creates extreme price-impact risk. The project is not affiliated with or endorsed by CZ or Binance.

> True Wealth 是 BNB Smart Chain 上的独立社区 meme 代币。总量 2.1 亿枚，在部署时一次性生成；提供的源码没有交易税或管理员权限。指定团队地址受益的独立保管合约在上述快照时持有 2.5%。PancakeSwap V2 交易池初始放入 2.0475 亿枚代币和 0.001 BNB，几乎全部取回凭证已发送至销毁地址。BNB 极少，交易价格可能剧烈变化。本项目与 CZ 或币安没有官方合作或背书关系。

## Submission blockers and checks

1. **Project identity:** create project-controlled X/Telegram accounts and a reachable contact address. [CZ's X account](https://x.com/cz_binance) is inspiration only. It must not be entered as the project's social account, and its images/text should not be copied into the website without specific rights and attribution.
2. **Open source:** publish the project repository under the chosen GitHub account. Verify the exact deployed bytecode and the team reserve on BscScan; record successful verification URLs. Publishing source alone is not the same as verification. At the time this dossier was updated, BscScan still showed “Verify and Publish” for the token.
3. **Liquidity:** the initial 0.001 BNB is exceptionally shallow. Review current pool reserves and price impact before encouraging trading or seeking broad promotion. No campaign can guarantee 10,000 buyers.
4. **Brand assets:** use the project's original [32×32 SVG logo](https://truewealth-bnb.david-0946.chatgpt.site/logo-32.svg), which follows the Etherscan token-info guideline. A local third-party photograph is not public site material; image-use permission does not imply a CZ or Binance endorsement. Confirm each listing platform's dimensions and file format before uploading. BscScan will not pick up a website image automatically: it requires its token-info update form, a BscScan account, source verification, contract-address ownership proof, and human review.
5. **Platforms:** after prerequisites are ready, use [CoinGecko's request form](https://partner.coingecko.com/request-form/new) and [CoinMarketCap's request form](https://coinmarketcap.com/request/). Their review/indexing is independent and cannot be guaranteed. Search in wallets by the full contract address first; ticker/name discovery may lag or be filtered.

Do not imply affiliation with Binance, CZ, PancakeSwap, CoinGecko, CoinMarketCap, Phantom, Uniswap, or OKX. Do not present the hosted subdomain as an owned independent domain.
