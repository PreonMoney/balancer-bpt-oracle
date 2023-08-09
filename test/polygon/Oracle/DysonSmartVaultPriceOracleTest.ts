import { ethers,  upgrades } from "hardhat"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { TimeUtils } from "../../time_utils"
import {
  ChainlinkManager,
  BalancerLpStablePoolPriceOracle, IDysonUniV3Vault, DysonUniV3LpPoolPriceOracle, DysonSmartVaultPriceOracle,
} from "../../../typechain"
import { PromiseOrValue } from "../../../typechain/common"

export type AssetStruct = {
  asset: PromiseOrValue<string>
  aggregator: PromiseOrValue<string>
}

const assetMatic: AssetStruct = {
  asset: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
  aggregator: "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0",
}

const assetStMatic: AssetStruct = {
  asset: "0x3A58a54C066FdC0f2D55FC9C89F0415C92eBf3C4",
  aggregator: "0x97371dF4492605486e23Da797fA68e55Fc38a13f",
}

const assetMaticX: AssetStruct = {
  asset: "0xfa68FB4628DFF1028CFEc22b4162FCcd0d45efb6",
  aggregator: "0x5d37E4b374E6907de8Fc7fb33EE3b0af403C7403",
}

const assetbbAwMatic: AssetStruct = {
  asset: "0xE4885Ed2818Cc9E840A25f94F9b2A28169D1AEA7",
  aggregator: "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0",
}

const assetWeth: AssetStruct = {
  asset: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
  aggregator: "0xf9680d99d6c9589e2a93a78a04a279e509205945",
}

const assetUsdc: AssetStruct = {
  asset: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
  aggregator: "0xfE4A8cc5b5B2366C1B58Bea3858e81843581b2F7",
}

const dysonSmartVaultStrategy = "0xeE3B4Ce32A6229ae15903CDa0A5Da92E739685f7"

describe("USDC Smart Vault Prices tests", function () {
  let snapshotBefore: string
  let snapshot: string

  let owner: SignerWithAddress
  let owner2: SignerWithAddress
  let dysonSmartVaultPriceOracle: DysonSmartVaultPriceOracle
  let chainlinkManager: ChainlinkManager

  before(async function () {
    snapshotBefore = await TimeUtils.snapshot()
    ;[owner, owner2] = await ethers.getSigners()

    console.log(`\n=============== deploy ChainlinkManager ===============\n`)

    chainlinkManager = (await upgrades.deployProxy(await ethers.getContractFactory("ChainlinkManager"), [], {
      initializer: "initialize",
    })) as ChainlinkManager

    console.log(`ChainlinkManager deployed at ${chainlinkManager.address}`)

    console.log(`\n=============== deploy BalancerLpStablePoolPriceOracle ===============\n`)

    dysonSmartVaultPriceOracle = (await upgrades.deployProxy(await ethers.getContractFactory("DysonSmartVaultPriceOracle"), [chainlinkManager.address], {
      initializer: "initialize",
    })) as DysonSmartVaultPriceOracle

    console.log(`BalancerLpStablePoolPriceOracle deployed at ${dysonSmartVaultPriceOracle.address}`)

    await chainlinkManager.addAsset(assetMatic.asset, assetMatic.aggregator)
    await chainlinkManager.addAsset(assetStMatic.asset, assetStMatic.aggregator)
    await chainlinkManager.addAsset(assetMaticX.asset, assetMaticX.aggregator)
    await chainlinkManager.addAsset(assetbbAwMatic.asset, assetbbAwMatic.aggregator)
    await chainlinkManager.addAsset(assetWeth.asset, assetWeth.aggregator)
    await chainlinkManager.addAsset(assetUsdc.asset, assetUsdc.aggregator)
  })

  after(async function () {
    await TimeUtils.rollback(snapshotBefore)
  })

  beforeEach(async function () {
    snapshot = await TimeUtils.snapshot()
  })

  afterEach(async function () {
    await TimeUtils.rollback(snapshot)
  })

  it("check dyson smart vault oracle prices", async function () {
    console.log("usdc price", await chainlinkManager.getUSDPrice(assetUsdc.asset))
    const price = await dysonSmartVaultPriceOracle.getPrice(dysonSmartVaultStrategy);
    console.log("price", price)
  })
})
