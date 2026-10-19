// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {TrueWealth, TeamReserve} from "../contracts/TrueWealth.sol";

contract ReserveCaller {
    function withdraw(TeamReserve reserve, uint256 amount) external {
        reserve.withdraw(amount);
    }

    function spend(TrueWealth token, address from, address to, uint256 amount) external {
        require(token.transferFrom(from, to, amount), "SPEND");
    }
}

contract TrueWealthTest {
    TrueWealth private token;
    TeamReserve private reserve;
    ReserveCaller private other;

    constructor() {
        token = new TrueWealth(address(this), address(this));
        reserve = TeamReserve(token.teamReserve());
        other = new ReserveCaller();
    }

    function testFixedInitialAllocation() external view {
        require(token.totalSupply() == 210_000_000 ether, "TOTAL");
        require(token.balanceOf(address(reserve)) == 5_250_000 ether, "TEAM");
        require(token.balanceOf(address(this)) == 204_750_000 ether, "LAUNCH");
        require(reserve.beneficiary() == address(this), "BENEFICIARY");
        require(address(reserve.token()) == address(token), "TOKEN");
    }

    function testTransfersHaveNoTax() external {
        uint256 amount = 10_000 ether;
        uint256 beforeSupply = token.totalSupply();
        require(token.transfer(address(other), amount), "TRANSFER");
        require(token.balanceOf(address(other)) == amount, "RECIPIENT");
        require(token.balanceOf(address(this)) == 204_740_000 ether, "SENDER");
        require(token.totalSupply() == beforeSupply, "SUPPLY_CHANGED");
    }

    function testFuzzTransferNoTax(uint256 seed) external {
        uint256 amount = seed % (204_750_000 ether + 1);
        uint256 beforeSupply = token.totalSupply();
        uint256 beforeSender = token.balanceOf(address(this));
        uint256 beforeRecipient = token.balanceOf(address(other));
        require(token.transfer(address(other), amount), "TRANSFER");
        require(token.balanceOf(address(this)) == beforeSender - amount, "SENDER_TAX");
        require(token.balanceOf(address(other)) == beforeRecipient + amount, "RECIPIENT_TAX");
        require(token.totalSupply() == beforeSupply, "SUPPLY_CHANGED");
    }

    function testApprovalAndTransferFrom() external {
        uint256 amount = 123 ether;
        require(token.approve(address(other), amount), "APPROVE");
        other.spend(token, address(this), address(other), amount);
        require(token.balanceOf(address(other)) == amount, "SPEND_BALANCE");
        require(token.allowance(address(this), address(other)) == 0, "ALLOWANCE");
        require(token.totalSupply() == 210_000_000 ether, "SUPPLY");
    }

    function testNonBeneficiaryCannotWithdrawReserve() external {
        try other.withdraw(reserve, 1 ether) {
            revert("UNAUTHORIZED_WITHDRAWAL");
        } catch (bytes memory reason) {
            require(bytes4(reason) == TeamReserve.NotBeneficiary.selector, "WRONG_REVERT");
        }
    }

    function testReserveWithdrawToBeneficiary() external {
        reserve.withdraw(250_000 ether);
        require(token.balanceOf(address(this)) == 205_000_000 ether, "BENEFICIARY_BALANCE");
        require(token.balanceOf(address(reserve)) == 5_000_000 ether, "RESERVE_BALANCE");
        require(token.totalSupply() == 210_000_000 ether, "SUPPLY");
    }

    function testRejectZeroAddresses() external {
        try new TrueWealth(address(0), address(this)) {
            revert("ZERO_LAUNCH_ACCEPTED");
        } catch {}
        try new TrueWealth(address(this), address(0)) {
            revert("ZERO_TEAM_ACCEPTED");
        } catch {}
    }
}
