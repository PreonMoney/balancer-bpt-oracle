// SPDX-License-Identifier: MIT

pragma solidity ^0.8.2;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./interfaces/IChainlinkManager.sol";
import "./interfaces/IAggregatorV3Interface.sol";

contract ChainlinkManager is OwnableUpgradeable, IChainlinkManager {
  uint256 public chainlinkTimeout;

  // Asset Mappings
  mapping(address => uint16) public override assetTypes;
  mapping(address => address) public override priceAggregators;

  event SetChainlinkTimeout(uint256 _chainlinkTimeout);

  function initialize() external initializer {
    __Ownable_init();

    chainlinkTimeout = 90000; // 25 hours
  }

  /* ========== VIEWS ========== */

  /**
   * @notice Currenly only use chainlink price feed.
   * @dev Calculate the USD price of a given asset.
   * @param asset the asset address
   * @return price Returns the latest price of a given asset (decimal: 18)
   */
  function getUSDPrice(address asset) external view override returns (uint256 price) {
    address aggregator = priceAggregators[asset];

    require(aggregator != address(0), "Price aggregator not found");

    try IAggregatorV3Interface(aggregator).latestRoundData() returns (
      uint80,
      int256 _price,
      uint256,
      uint256 updatedAt,
      uint80
    ) {
      // check chainlink price updated within 25 hours
      require(updatedAt + (chainlinkTimeout) >= block.timestamp, "Chainlink price expired");

      if (_price > 0) {
        price = uint256(_price) * (10**10); // convert Chainlink decimals 8 -> 18
      }
    } catch {
      revert("Price get failed");
    }

    require(price > 0, "Price not available");
  }

  /* ========== MUTATIVE FUNCTIONS ========== */

  /* ---------- From Owner ---------- */

  /// @dev Setting the timeout for the Chainlink price feed
  /// @param newTimeoutPeriod A new time in seconds for the timeout
  function setChainlinkTimeout(uint256 newTimeoutPeriod) external onlyOwner {
    chainlinkTimeout = newTimeoutPeriod;
    emit SetChainlinkTimeout(newTimeoutPeriod);
  }

  /// @dev Add valid asset with price aggregator
  /// @param asset Address of the asset to add
  /// @param aggregator Address of the aggregator
  function addAsset(address asset, address aggregator) public override onlyOwner {
    require(asset != address(0), "asset address cannot be 0");
    require(aggregator != address(0), "aggregator address cannot be 0");

    priceAggregators[asset] = aggregator;

    emit AddedAsset(asset, aggregator);
  }

  /// @dev Add valid assets with price aggregator
  /// @param assets An array of assets to add
  function addAssets(Asset[] memory assets) public override onlyOwner {
    for (uint8 i = 0; i < assets.length; i++) {
      addAsset(assets[i].asset, assets[i].aggregator);
    }
  }

  /// @dev Remove valid asset
  /// @param asset Address of the asset to remove
  function removeAsset(address asset) external override onlyOwner {
    priceAggregators[asset] = address(0);

    emit RemovedAsset(asset);
  }
}
