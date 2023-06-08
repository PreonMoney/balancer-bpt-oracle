// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

pragma experimental ABIEncoderV2;

interface IERC4626LinearPool {
    function getRate() external view returns (uint256);
}
