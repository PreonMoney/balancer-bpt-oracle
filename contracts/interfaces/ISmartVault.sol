// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

interface ISmartVault {

    function getPricePerFullShare() external view returns (uint256);

    function underlying() external view returns (address);

    function underlyingBalanceWithInvestment() external view returns (uint256);

}