import { ethers,  upgrades } from "hardhat"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { TimeUtils } from "../../time_utils"
import {
  ChainlinkManager,
  BalancerLpStablePoolPriceOracle,
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

const stMaticBalancerPool = "0x216690738Aac4aa0C4770253CA26a28f0115c595"
const MaticXBalancerPool = "0xb20fC01D21A50d2C734C4a1262B4404d41fA7BF0"

describe("BalancerComposable Prices tests", function () {
  let snapshotBefore: string
  let snapshot: string

  let owner: SignerWithAddress
  let owner2: SignerWithAddress
  let balancerLpStablePoolPriceOracle: BalancerLpStablePoolPriceOracle
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

    balancerLpStablePoolPriceOracle = (await upgrades.deployProxy(await ethers.getContractFactory("BalancerLpStablePoolPriceOracle"), [chainlinkManager.address], {
      initializer: "initialize",
    })) as BalancerLpStablePoolPriceOracle

    console.log(`BalancerLpStablePoolPriceOracle deployed at ${balancerLpStablePoolPriceOracle.address}`)

    await chainlinkManager.addAsset(assetMatic.asset, assetMatic.aggregator)
    await chainlinkManager.addAsset(assetStMatic.asset, assetStMatic.aggregator)
    await chainlinkManager.addAsset(assetMaticX.asset, assetMaticX.aggregator)
    await chainlinkManager.addAsset(assetbbAwMatic.asset, assetbbAwMatic.aggregator)
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

  it("check wMatic prices", async function () {
    // console.log("Matic price", formatUnits(await balancerLpStablePoolPriceOracle.price(stMaticBalancerPool), 18))
    console.log("Matic price", await balancerLpStablePoolPriceOracle.price(stMaticBalancerPool))
  })

  it("check wMatic2 prices", async function () {
    // console.log("Matic price", formatUnits(await balancerLpStablePoolPriceOracle.price(stMaticBalancerPool), 18))
    await balancerLpStablePoolPriceOracle.setBoostedToken(assetbbAwMatic.asset, true)
    console.log("Matic price", await balancerLpStablePoolPriceOracle.price(stMaticBalancerPool))
  })
})
