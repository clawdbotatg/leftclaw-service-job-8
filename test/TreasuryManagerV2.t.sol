// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test, console} from "forge-std/Test.sol";
import {TreasuryManagerV2} from "../src/TreasuryManagerV2.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TreasuryManagerV2Test is Test {
    TreasuryManagerV2 public treasury;

    address owner = address(0x1);
    address operator = address(0x2);
    address usdcRecipient = address(0x3);
    address alice = address(0x4);

    function setUp() public {
        treasury = new TreasuryManagerV2(owner, operator, usdcRecipient);
    }

    // ─── Constructor Tests ───

    function test_constructorSetsOwner() public view {
        // With Ownable2Step, ownership transfer is two-step
        // Constructor sets pending owner, but since we use Ownable(_owner), 
        // the owner is set directly via the Ownable constructor
        assertEq(treasury.owner(), owner);
    }

    function test_constructorSetsOperator() public view {
        assertEq(treasury.operator(), operator);
    }

    function test_constructorSetsUsdcRecipient() public view {
        assertEq(treasury.usdcRecipient(), usdcRecipient);
    }

    function test_constructorSetsDefaultCaps() public view {
        (uint256 perAction, uint256 perDay) = treasury.getCaps(TreasuryManagerV2.ActionType.BuybackWETH);
        assertEq(perAction, 0.5 ether);
        assertEq(perDay, 2 ether);
    }

    function test_constructorRevertsZeroOperator() public {
        vm.expectRevert(TreasuryManagerV2.ZeroAddress.selector);
        new TreasuryManagerV2(owner, address(0), usdcRecipient);
    }

    function test_constructorRevertsZeroUsdcRecipient() public {
        vm.expectRevert(TreasuryManagerV2.ZeroAddress.selector);
        new TreasuryManagerV2(owner, operator, address(0));
    }

    // ─── Access Control Tests ───

    function test_setOperator_onlyOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        treasury.setOperator(alice);
    }

    function test_setOperator_works() public {
        vm.prank(owner);
        treasury.setOperator(alice);
        assertEq(treasury.operator(), alice);
    }

    function test_setOperator_revertsZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert(TreasuryManagerV2.ZeroAddress.selector);
        treasury.setOperator(address(0));
    }

    function test_updateCaps_onlyOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        treasury.updateCaps(TreasuryManagerV2.ActionType.BuybackWETH, 1 ether, 5 ether);
    }

    function test_updateCaps_works() public {
        vm.prank(owner);
        treasury.updateCaps(TreasuryManagerV2.ActionType.BuybackWETH, 1 ether, 5 ether);
        (uint256 perAction, uint256 perDay) = treasury.getCaps(TreasuryManagerV2.ActionType.BuybackWETH);
        assertEq(perAction, 1 ether);
        assertEq(perDay, 5 ether);
    }

    function test_setSlippage_onlyOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        treasury.setSlippage(200);
    }

    function test_setSlippage_works() public {
        vm.prank(owner);
        treasury.setSlippage(200);
        assertEq(treasury.operatorSlippageBps(), 200);
    }

    function test_setSlippage_revertsTooHigh() public {
        vm.prank(owner);
        vm.expectRevert(TreasuryManagerV2.SlippageTooHigh.selector);
        treasury.setSlippage(1500);
    }

    // ─── Operator Access Tests ───

    function test_buybackWithWETH_nonOperatorReverts() public {
        vm.prank(alice);
        vm.expectRevert(TreasuryManagerV2.OnlyOperator.selector);
        treasury.buybackWithWETH(1 ether);
    }

    function test_burn_nonOperatorReverts() public {
        vm.prank(alice);
        vm.expectRevert(TreasuryManagerV2.OnlyOperator.selector);
        treasury.burn(1000 ether);
    }

    // ─── Receive ETH ───

    function test_receiveETH() public {
        vm.deal(address(this), 1 ether);
        (bool success,) = address(treasury).call{value: 1 ether}("");
        assertTrue(success);
        assertEq(address(treasury).balance, 1 ether);
    }

    // ─── View Function Tests ───

    function test_getTokenInfo_default() public view {
        (uint256 totalCostWei, uint256 totalAmount, uint256 highestRoiBps, uint256 roiTierTimestamp) =
            treasury.getTokenInfo(address(0x5));
        assertEq(totalCostWei, 0);
        assertEq(totalAmount, 0);
        assertEq(highestRoiBps, 0);
        assertEq(roiTierTimestamp, 0);
    }

    function test_isPermissionlessAvailable_noROI() public view {
        (bool available, string memory reason) = treasury.isPermissionlessAvailable(address(0x5));
        assertFalse(available);
        assertEq(reason, "ROI below 1000%");
    }

    function test_getRemainingDailyBudget() public view {
        uint256 remaining = treasury.getRemainingDailyBudget(TreasuryManagerV2.ActionType.BuybackWETH);
        assertEq(remaining, 2 ether);
    }

    // ─── Immutable Constants ───

    function test_immutableConstants() public view {
        assertEq(treasury.SLIPPAGE_BPS(), 300);
        assertEq(treasury.PERMISSIONLESS_COOLDOWN(), 4 hours);
        assertEq(treasury.PERMISSIONLESS_MAX_PCT(), 500);
        assertEq(treasury.CIRCUIT_BREAKER_BPS(), 1500);
        assertEq(treasury.OPERATOR_INACTIVITY_PERIOD(), 14 days);
        assertEq(treasury.DEAD_POOL_THRESHOLD(), 90 days);
        assertEq(treasury.OPERATOR_COOLDOWN(), 60 minutes);
        assertEq(treasury.PERMISSIONLESS_PER_ACTION_CAP(), 0.5 ether);
        assertEq(treasury.PERMISSIONLESS_PER_DAY_CAP(), 2 ether);
    }
}
