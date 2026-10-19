# True Wealth (TRUEWEALTH)

Open-source contract, tests, verification inputs, and a local launch assistant for the **already deployed** True Wealth token on BNB Smart Chain. This repository is a record of the deployed implementation, not an invitation to deploy a look-alike token. Nothing here is investment advice or an endorsement by CZ, Binance, BNB Chain, PancakeSwap, OKX, or Phantom.

## Mainnet facts

The following snapshot was independently read from BNB Chain block **128608198** at **2026-10-19 19:13 UTC**. Balances can change. Follow the block explorer links before relying on them.

| Item | Value |
| --- | --- |
| Chain | BNB Smart Chain mainnet (chain ID 56) |
| Name / symbol | True Wealth / TRUEWEALTH |
| Total supply | 210,000,000 (18 decimals), minted once at deployment |
| Token contract | [`0x962C4730CFd8478D63C754c6060B82Aa2142d8D1`](https://bscscan.com/address/0x962C4730CFd8478D63C754c6060B82Aa2142d8D1) |
| Team reserve contract | [`0x7e2a9d7373f257f39be79472D63c0cb660b8B75a`](https://bscscan.com/address/0x7e2a9d7373f257f39be79472D63c0cb660b8B75a) |
| Team reserve balance at snapshot | 5,250,000 TRUEWEALTH (2.5%) |
| Fixed reserve beneficiary | `0x5D5D0F0b1b64c40d6e27528Cf678D0e188E941eC` |
| PancakeSwap V2 TRUEWEALTH/WBNB pool | [`0x4Adfb6c1503D8Fdcd2fbE39F4C4Ef5C941992ab1`](https://bscscan.com/address/0x4Adfb6c1503D8Fdcd2fbE39F4C4Ef5C941992ab1) |
| Initial pool deposit | 204,750,000 TRUEWEALTH + 0.001 BNB |
| LP burn destination | [`0x000000000000000000000000000000000000dEaD`](https://bscscan.com/token/0x4Adfb6c1503D8Fdcd2fbE39F4C4Ef5C941992ab1?a=0x000000000000000000000000000000000000dEaD) |
| Token transfer tax | 0% (DEX/network fees are separate) |

**Important:** The team tokens are held by the separate reserve contract, not directly by the beneficiary's OKX wallet, so they do not appear as wallet holdings. The beneficiary can call `withdraw(amount)` at any time, and the reserve sends only to that fixed address. This is **not a time lock**. At the snapshot, the launch wallet held 0 TRUEWEALTH because 204.75 million had been deposited in the pool. The LP burn address held 452.493093869950681587 LP units of 452.493093869950682587 total units; the difference is PancakeSwap V2's minimum locked liquidity.

## Extreme liquidity warning

The pool began with just **0.001 BNB**. This is far too shallow for an ordinary 0.1 or 1 BNB purchase. Using the simple V2 pool formula and ignoring fees or earlier trades, the first 0.1 BNB buy could take about **99.01% of the pool's tokens**; 1 BNB could take about **99.90%**. Real trades may fail, be front-run, or execute differently. Do not market the token as safe or liquid simply because a pool exists. The public information website deliberately has no buy button while this risk is unresolved.

## Contract design

[`contracts/TrueWealth.sol`](contracts/TrueWealth.sol) contains two non-upgradeable contracts: `TrueWealth` and `TeamReserve`. There is no owner, external mint, blacklist, pause, adjustable transfer tax, `tx.origin` check, special `balanceOf` case, or hidden allowance logic. The source uses OpenZeppelin ERC-20 5.6.1. The symbol is `TRUEWEALTH`; `True Wealth` is the display name.

No code repository alone proves that the deployed bytecode matches its source. The Solidity compiler is pinned to 0.8.30 with optimizer 200 runs and EVM target `paris`; the `verification/` folder contains compiler input and constructor arguments for BscScan standard-JSON verification. BscScan's verification status should be checked independently. An independent third-party security audit has **not** been claimed.

## Reproduce and test

Requires Node.js 22.13+.

```sh
npm ci
npm run compile
npm test
npx hardhat test solidity test/Fork.t.sol --network bscFork
npm run build-ui
```

The fork test uses a public BNB Chain RPC and sends no mainnet transaction. The browser-based launcher in this repository is for reproducing the original launch flow. **Do not use it to deploy a second token or add another pool without an explicit new decision and independent review.** The already deployed token and pool addresses are above.

## Public documentation

[`docs/index.html`](docs/index.html) is the informational GitHub Pages page. It does not handle wallets or purchases. The project website separately explains the same on-chain facts and the current liquidity risk. The optional local photo `truewealth.jpeg` is intentionally excluded from this open-source repository and public pages; the public mark is original typography, not a third-party endorsement.

## Security

See [`SECURITY.md`](SECURITY.md). Never send a seed phrase, private key, or wallet connection request to someone claiming to offer support. Check the full contract address before interacting. The code is MIT-licensed; this does not imply any security guarantee.
