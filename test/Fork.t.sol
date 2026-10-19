// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {TrueWealth} from "../contracts/TrueWealth.sol";

interface Vm {
    function deal(address account, uint256 newBalance) external;
}

interface IPancakeRouterV2 {
    function factory() external view returns (address);
    function addLiquidityETH(
        address token,
        uint256 amountTokenDesired,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address to,
        uint256 deadline
    ) external payable returns (uint256 amountToken, uint256 amountETH, uint256 liquidity);
}

interface IPancakeFactoryV2 {
    function getPair(address tokenA, address tokenB) external view returns (address);
}

interface ILpToken {
    function balanceOf(address owner) external view returns (uint256);
}

/// @dev Run with: npx hardhat test solidity test/Fork.t.sol --network bscFork
contract ForkTest {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));
    address private constant ROUTER = 0x10ED43C718714eb63d5aA57B78B54704E256024E;
    address private constant WBNB = 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c;
    address private constant DEAD = 0x000000000000000000000000000000000000dEaD;

    function testMainnetForkCreatesAndBurnsLp() external {
        // This test is meaningful only on the configured BSC fork.
        if (block.chainid != 56 || ROUTER.code.length == 0) return;

        vm.deal(address(this), 1 ether);
        TrueWealth token = new TrueWealth(address(this), address(this));
        require(token.approve(ROUTER, 1_000_000 ether), "APPROVE");

        (, , uint256 liquidity) = IPancakeRouterV2(ROUTER).addLiquidityETH{value: 0.1 ether}(
            address(token), 1_000_000 ether, 990_000 ether, 0.099 ether,
            DEAD, block.timestamp + 20 minutes
        );
        address pair = IPancakeFactoryV2(IPancakeRouterV2(ROUTER).factory())
            .getPair(address(token), WBNB);
        require(pair != address(0), "NO_PAIR");
        require(liquidity > 0, "NO_LIQUIDITY");
        require(ILpToken(pair).balanceOf(DEAD) == liquidity, "LP_NOT_BURNED");
        require(token.balanceOf(pair) == 1_000_000 ether, "PAIR_TOKEN_BALANCE");
    }
}
