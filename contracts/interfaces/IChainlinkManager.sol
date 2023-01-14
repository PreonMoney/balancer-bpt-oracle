// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

pragma experimental ABIEncoderV2;

interface IChainlinkManager {
    event AddedAsset(address asset, address aggregator);
    event RemovedAsset(address asset);

    struct Asset {
        address asset;
        address aggregator;
    }

    function addAsset(address asset, address aggregator) external;

    function addAssets(Asset[] memory assets) external;

    function removeAsset(address asset) external;

    function priceAggregators(address asset) external view returns (address);

    function assetTypes(address asset) external view returns (uint16);

    function getUSDPrice(address asset) external view returns (uint256);
}
