// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

/**
 * @title BasePriceOracle
 * @notice Returns prices of underlying tokens directly without the caller having to specify a cToken address.
 * @dev Implements the `PriceOracle` interface.
 * @author David Lucid <david@rari.capital> (https://github.com/davidlucid)
 */
interface BasePriceOracle {
    /**
     * @notice Get the price of an underlying asset.
   * @param underlying The underlying asset to get the price of.
   * @return The underlying asset price in ETH as a mantissa (scaled by 1e18).
   * Zero means the price is unavailable.
   */
    function price(address underlying) external view returns (uint256);
}
