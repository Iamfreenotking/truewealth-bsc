// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @notice The beneficiary may release the team's fixed allocation to their own wallet.
/// @dev There is no admin, beneficiary change, arbitrary recipient, or token minting.
contract TeamReserve {
    IERC20 public immutable token;
    address public immutable beneficiary;

    error NotBeneficiary();

    constructor(address beneficiary_) {
        beneficiary = beneficiary_;
        token = IERC20(msg.sender);
    }

    function withdraw(uint256 amount) external {
        if (msg.sender != beneficiary) revert NotBeneficiary();
        require(token.transfer(beneficiary, amount), "TRANSFER_FAILED");
    }
}

/// @notice Fixed-supply, zero-tax BEP-20/ERC-20 token for BNB Smart Chain.
/// @dev The only minting happens once in the constructor. There is no owner.
contract TrueWealth is ERC20 {
    uint256 public constant TOTAL_SUPPLY = 210_000_000 ether;
    uint256 public constant TEAM_SUPPLY = 5_250_000 ether;
    uint256 public constant LAUNCH_SUPPLY = TOTAL_SUPPLY - TEAM_SUPPLY;

    address public immutable teamReserve;

    error ZeroAddress();

    constructor(address launchWallet, address teamBeneficiary)
        ERC20("True Wealth", "TRUEWEALTH")
    {
        if (launchWallet == address(0) || teamBeneficiary == address(0)) {
            revert ZeroAddress();
        }

        TeamReserve reserve = new TeamReserve(teamBeneficiary);
        teamReserve = address(reserve);
        _mint(address(reserve), TEAM_SUPPLY);
        _mint(launchWallet, LAUNCH_SUPPLY);
    }
}
