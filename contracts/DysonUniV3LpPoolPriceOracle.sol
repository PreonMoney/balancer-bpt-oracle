// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import "./interfaces/IBasePriceOracle.sol";
import "./interfaces/IDysonUniV3Vault.sol";
import "./interfaces/IUniswapCalculator.sol";
import "./interfaces/IStrategyRebalanceStakerUniV3.sol";
import "./interfaces/IChainlinkManager.sol";
import "./interfaces/IERC20Decimals.sol";

/**
 * @title DysonUniV3LpPoolPriceOracle
 * @author Simsala
 * @notice DysonUniV3LpPoolPriceOracle is a price oracle for Dyson LP tokens.
 */
contract DysonUniV3LpPoolPriceOracle is OwnableUpgradeable, IBasePriceOracle {
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

  function _price(address underlying) internal view virtual returns (uint256) {
    IDysonUniV3Vault _dysonVault = IDysonUniV3Vault(underlying);
    IStrategyRebalanceStakerUniV3 _strategy = IStrategyRebalanceStakerUniV3(_dysonVault.strategy());
    IERC20Upgradeable _token0 = IERC20Upgradeable(_dysonVault.token0());
    IERC20Upgradeable _token1 = IERC20Upgradeable(_dysonVault.token1());
    uint256 _amount0Held = _token0.balanceOf(address(_strategy));
    uint256 _amount1Held = _token1.balanceOf(address(_strategy));
    IUniswapCalculator _uniswapCalculator = IUniswapCalculator(_dysonVault.uniswapCalculator());
    (uint256 _amount0, uint256 _amount1) = _getCollateralAmount(_dysonVault, _uniswapCalculator);
    uint256 _token0Tvl = ((_amount0 + _amount0Held) * _getWantPrice(address(_token0))) / (10 ** IERC20Decimals(address(_token0)).decimals());
    uint256 _token1Tvl = ((_amount1 + _amount1Held) * _getWantPrice(address(_token1))) / (10 ** IERC20Decimals(address(_token1)).decimals());
    uint256 _tokenTvl = _token0Tvl + _token1Tvl;

    return _tokenTvl;
  }

  function _getCollateralAmount(
    IDysonUniV3Vault _dysonVault,
    IUniswapCalculator _uniswapCalculator
  ) internal view returns (uint256, uint256) {
    (uint256 _amount0, uint256 _amount1) = _uniswapCalculator.getLiquidity(address(_dysonVault));
    return (_amount0, _amount1);
  }

  function _getWantPrice(address want) internal view returns (uint256) {
    return IChainlinkManager(chainlinkManager).getUSDPrice(want);
  }
}
