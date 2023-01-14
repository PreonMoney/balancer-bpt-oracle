// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.2;
pragma abicoder v2;

import "./interfaces/IAggregatorV3Interface.sol";
import "./interfaces/balancer/IBalancerComposablePool.sol";
import "./interfaces/balancer/IBalancerV2Vault.sol";
import "./interfaces/IERC20Extended.sol";
import "./utils/BalancerLib.sol";
import "./interfaces/IChainlinkManager.sol";

contract BalancerComposableStablePoolAggregator {
  address public chainlinkManager;

  constructor(address _chainlinkManager) {
    require(_chainlinkManager != address(0), "_chainlinkManager address cannot be 0");

    chainlinkManager = _chainlinkManager;
  }

  function getBptPrice(IBalancerComposablePool _pool)
    public
    view
    returns (
      uint80 roundId,
      int256 answer,
      uint256 startedAt,
      uint256 updatedAt,
      uint80 answeredInRound
    )
  {
    IBalancerV2Vault _vault = IBalancerV2Vault(_pool.getVault());
    bytes32 _poolId = _pool.getPoolId();
    (address[] memory _tokens, , ) = IBalancerV2Vault(_vault).getPoolTokens(_poolId);
    uint8[] memory _tokenDecimals = new uint8[](_tokens.length);

    for (uint256 i = 0; i < _tokens.length; i++) {
      _tokenDecimals[i] = IERC20Extended(_tokens[i]).decimals();
    }

    (roundId, answer, startedAt, updatedAt, answeredInRound) = _latestRoundData(
      _pool,
      _tokens,
      _tokenDecimals,
      _poolId,
      _vault
    );
  }

  function _latestRoundData(
    IBalancerComposablePool _pool,
    address[] memory _tokens,
    uint8[] memory _tokenDecimals,
    bytes32 _poolId,
    IBalancerV2Vault _vault
  )
    internal
    view
    returns (
      uint80,
      int256,
      uint256,
      uint256,
      uint80
    )
  {
    uint256 answer = 0;
    uint256[] memory usdTotals = _getUSDBalances(_pool, _tokenDecimals, _tokens, _poolId, _vault);

    answer = _getArithmeticMean(usdTotals, _pool, _tokens); // 18 decimals

    return (0, int256(answer / (10**10)), 0, block.timestamp, 0); // answer in 8 decimals
  }

  /* ========== VIEWS ========== */

  function decimals() public pure returns (uint8) {
    return 8;
  }

  /* ========== INTERNAL ========== */

  function _getTokenPrice(address token) internal view returns (uint256) {
    return IChainlinkManager(chainlinkManager).getUSDPrice(token);
  }

  /**
   * @notice Get USD balances for each tokens of the pool.
   * @return usdBalances Balance of each token in usd. (in 18 decimals)
   */
  function _getUSDBalances(
    IBalancerComposablePool _pool,
    uint8[] memory _tokenDecimals,
    address[] memory _tokens,
    bytes32 _poolId,
    IBalancerV2Vault _vault
  ) internal view returns (uint256[] memory usdBalances) {
    usdBalances = new uint256[](_tokens.length);
    (, uint256[] memory balances, ) = _vault.getPoolTokens(_poolId);

    for (uint256 index = 0; index < _tokens.length; index++) {
      // Composable pool, ignore the Balancer pool token
      if (_tokens[index] != address(_pool)) {
        usdBalances[index] = (_getTokenPrice(_tokens[index]) * (balances[index])) / (10**_tokenDecimals[index]);
      }
    }
  }

  /**
   * Calculates the price of the pool token using the formula of weighted arithmetic mean.
   * @param usdTotals Balance of each token in usd.
   */
  function _getArithmeticMean(
    uint256[] memory usdTotals,
    IBalancerComposablePool _pool,
    address[] memory _tokens
  ) internal view returns (uint256) {
    uint256 totalUsd = 0;
    for (uint256 i = 0; i < _tokens.length; i++) {
      totalUsd = totalUsd + (usdTotals[i]);
    }
    return (totalUsd * (10**18)) / (_pool.getActualSupply());
  }
}
