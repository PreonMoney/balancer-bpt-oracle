import { ethers,  upgrades } from "hardhat"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { TimeUtils } from "../../time_utils"
import {
  ChainlinkManager,
  BalancerLpStablePoolPriceOracle,
} from "../../../typechain"
import { PromiseOrValue } from "../../../typechain/common"
import {forkToArbitrum} from "../../chain_fork";

export type AssetStruct = {
  asset: PromiseOrValue<string>
  aggregator: PromiseOrValue<string>
}

const assetEth: AssetStruct = {
  asset: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
  aggregator: "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612",
}

const assetStEth: AssetStruct = {
  asset: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
  aggregator: "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612",
}

const balancerPool = "0x36bf227d6BaC96e2aB1EbB5492ECec69C691943f"

describe("BalancerComposable Prices tests", function () {
  let snapshotBefore: string
  let snapshot: string

  let owner: SignerWithAddress
  let owner2: SignerWithAddress
  let balancerLpStablePoolPriceOracle: BalancerLpStablePoolPriceOracle
  let chainlinkManager: ChainlinkManager

  before(async function () {
    await forkToArbitrum()
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

    await chainlinkManager.addAsset(assetEth.asset, assetEth.aggregator)
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
    // console.log("Matic price", formatUnits(await balancerLpStablePoolPriceOracle.price(balancerPool), 18))
    console.log("Matic price", await balancerLpStablePoolPriceOracle.price(balancerPool))
  })

  it("check wMatic2 prices", async function () {
    // console.log("Matic price", formatUnits(await balancerLpStablePoolPriceOracle.price(balancerPool), 18))
    // await balancerLpStablePoolPriceOracle.setBoostedToken(assetbbAwMatic.asset, true)
    console.log("Matic price", await balancerLpStablePoolPriceOracle.price(balancerPool))
  })
})
