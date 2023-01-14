import { ethers,  upgrades } from "hardhat"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { TimeUtils } from "../../time_utils"
import { DeployerUtils } from "../../../scripts/utils/DeployerUtils"
import {
  ChainlinkManager,
  BalancerComposableStablePoolAggregator,
} from "../../../typechain"
import { formatUnits } from "ethers/lib/utils"
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

const stMaticBalancerPool = "0x8159462d255C1D24915CB51ec361F700174cD994"
const MaticXBalancerPool = "0xb20fC01D21A50d2C734C4a1262B4404d41fA7BF0"

describe("BalancerComposable Prices tests", function () {
  let snapshotBefore: string
  let snapshot: string

  let owner: SignerWithAddress
  let owner2: SignerWithAddress
  let chainlinkManager: ChainlinkManager
  let balancerComposableStablePoolAggregator: BalancerComposableStablePoolAggregator

  before(async function () {
    snapshotBefore = await TimeUtils.snapshot()
    ;[owner, owner2] = await ethers.getSigners()

    console.log(`\n=============== deploy ChainlinkManager ===============\n`)

    chainlinkManager = (await upgrades.deployProxy(await ethers.getContractFactory("ChainlinkManager"), [], {
      initializer: "initialize",
    })) as ChainlinkManager

    console.log(`\n=============== deploy Balancer Composer Price ===============\n`)
    balancerComposableStablePoolAggregator = (await DeployerUtils.deployContract(
      owner,
      "BalancerComposableStablePoolAggregator",
      chainlinkManager.address
    )) as BalancerComposableStablePoolAggregator

    await chainlinkManager.addAsset(assetMatic.asset, assetMatic.aggregator)
    await chainlinkManager.addAsset(assetStMatic.asset, assetStMatic.aggregator)
    await chainlinkManager.addAsset(assetMaticX.asset, assetMaticX.aggregator)
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
    console.log("Matic price", formatUnits(await chainlinkManager.getUSDPrice(assetMatic.asset), 18))
    console.log("\n")
    console.log("assetStMatic price", formatUnits(await chainlinkManager.getUSDPrice(assetStMatic.asset), 18))
    let [roundId, answer, startedAt, updatedAt, answeredInRound] =
      await balancerComposableStablePoolAggregator.getBptPrice(stMaticBalancerPool)

    console.log("stMatic bpt price", formatUnits(answer, 8))
    console.log("\n")
    ;[roundId, answer, startedAt, updatedAt, answeredInRound] =
      await balancerComposableStablePoolAggregator.getBptPrice(MaticXBalancerPool)

    console.log("assetMaticX price", formatUnits(await chainlinkManager.getUSDPrice(assetMaticX.asset), 18))
    console.log("MaticX bpt price", formatUnits(answer, 8))
  })
})
