// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;
pragma experimental ABIEncoderV2;

interface IBalancerComposablePool {
  function totalSupply() external view returns (uint256);

  function getActualSupply() external view returns (uint256);

  function getPoolId() external view returns (bytes32);

  function getVault() external view returns (address);
}
