// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import "./interfaces/IBasePriceOracle.sol";
import "./interfaces/IUniswapCalculator.sol";
import "./interfaces/ISmartVault.sol";
import "./interfaces/IChainlinkManager.sol";
import "./interfaces/IERC20Decimals.sol";
import "hardhat/console.sol";

/**
 * @title DysonSmartVaultPriceOracle
 * @author Simsala
 * @notice DysonSmartVaultPriceOracle is a price oracle for Dyson Smart Vault tokens.
 */
contract DysonSmartVaultPriceOracle is OwnableUpgradeable, IBasePriceOracle {
  address public chainlinkManager;

  function initialize(address _chainlinkManager) public initializer {
    __Ownable_init();
    chainlinkManager = _chainlinkManager;
  }

  /**
   * @notice Get the LP token price price for an underlying token address.
   * @param underlying The underlying token address for which to get the price (set to zero address for ETH).
   * @return Price denominated in ETH (scaled by 1e18).
   */
  function getPrice(address underlying) external view returns (uint256) {
    return _price(underlying);
  }

  function _price(address _smartVault) internal view virtual returns (uint256) {
    ISmartVault _dysonSmartVault = ISmartVault(_smartVault);
    console.log("smartVault: %s", address(_dysonSmartVault));
    address _underlying = _dysonSmartVault.underlying();
    uint256 _amount = _dysonSmartVault.underlyingBalanceWithInvestment();
    console.log("underlying: %s", address(_underlying));
    uint256 _tokenTvl = (_amount * _getWantPrice(_underlying)) / (10 ** IERC20Decimals(_underlying).decimals());

    return _tokenTvl;
  }

  function _getWantPrice(address want) internal view returns (uint256) {
    return IChainlinkManager(chainlinkManager).getUSDPrice(want);
  }
}
