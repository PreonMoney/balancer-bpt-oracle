import { ethers, web3 } from "hardhat"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { ContractFactory, utils } from "ethers"
import { Misc } from "./Misc"
import logSettings from "../../log_settings"
import { Logger } from "tslog"
import { Libraries } from "hardhat-deploy/dist/types"
import { VerifyUtils } from "./VerifyUtils"

// tslint:disable-next-line:no-var-requires
const hre = require("hardhat")
const log: Logger<unknown> = new Logger(logSettings)

const libraries = new Map<string, string>([["", ""]])
const libraries2 = new Map<string, string>([["", ""]])

export class DeployerUtils {
  // ************ CONTRACT DEPLOY **************************

  public static async deployContract<T extends ContractFactory>(
    signer: SignerWithAddress,
    name: string,
    // tslint:disable-next-line:no-any
    ...args: any[]
  ) {
    log.info(`Deploying ${name}`)
    log.info("Account balance: " + utils.formatUnits(await signer.getBalance(), 18))

    const gasPrice = await web3.eth.getGasPrice()
    log.info("Gas price: " + gasPrice)
    const lib: string | undefined = libraries.get(name)
    const lib2: string | undefined = libraries2.get(name)
    let _factory
    if (lib) {
      log.info("DEPLOY LIBRARY", lib, "for", name)
      const libAddress = (await DeployerUtils.deployContract(signer, lib)).address
      const librariesObj: Libraries = {}
      librariesObj[lib] = libAddress

      if (lib2) {
        await Misc.wait(5)
        log.info("DEPLOY 2nd LIBRARY", lib2, "for", name)
        librariesObj[lib2] = (await DeployerUtils.deployContract(signer, lib2)).address
      }

      _factory = (await ethers.getContractFactory(name, {
        signer,
        libraries: librariesObj,
      })) as T
    } else {
      _factory = (await ethers.getContractFactory(name, signer)) as T
    }

    log.info("Got factory..")
    let gas = 19_000_000
    if (hre.network.name === "hardhat") {
      gas = 999_999_999
    } else if (hre.network.name === "mumbai") {
      gas = 5_000_000
    }
    // const instance = await _factory.deploy(...args, {gasLimit: gas, gasPrice: +gasPrice * 5});
    const instance = await _factory.deploy(...args, { gasPrice: +gasPrice * 5 })
    log.info("Deploy tx:", instance.deployTransaction.hash)
    await instance.deployed()

    const receipt = await ethers.provider.getTransactionReceipt(instance.deployTransaction.hash)
    console.log("DEPLOYED: ", name, receipt.contractAddress)

    if (hre.network.name !== "hardhat") {
      await Misc.wait(2)
      if (args.length === 0) {
        await VerifyUtils.verify(receipt.contractAddress)
      } else {
        await VerifyUtils.verifyWithArgs(receipt.contractAddress, args)
        if (name === "ProxyControlled") {
          await VerifyUtils.verifyProxy(receipt.contractAddress)
        }
      }
    }
    return _factory.attach(receipt.contractAddress)
  }

  public static async getContractFactory<T extends ContractFactory>(
    signer: SignerWithAddress,
    name: string,
    // tslint:disable-next-line:no-any
    ...args: any[]
  ) {
    log.info(`Deploying ${name}`)
    log.info("Account balance: " + utils.formatUnits(await signer.getBalance(), 18))

    const gasPrice = await web3.eth.getGasPrice()
    log.info("Gas price: " + gasPrice)
    const lib: string | undefined = libraries.get(name)
    const lib2: string | undefined = libraries2.get(name)
    let _factory
    if (lib) {
      log.info("DEPLOY LIBRARY", lib, "for", name)
      const libAddress = (await DeployerUtils.deployContract(signer, lib)).address
      const librariesObj: Libraries = {}
      librariesObj[lib] = libAddress

      if (lib2) {
        await Misc.wait(5)
        log.info("DEPLOY 2nd LIBRARY", lib2, "for", name)
        librariesObj[lib2] = (await DeployerUtils.deployContract(signer, lib2)).address
      }

      _factory = (await ethers.getContractFactory(name, {
        signer,
        libraries: librariesObj,
      })) as T
    } else {
      _factory = (await ethers.getContractFactory(name, signer)) as T
    }
    let gas = 19_000_000
    if (hre.network.name === "hardhat") {
      gas = 999_999_999
    } else if (hre.network.name === "mumbai") {
      gas = 5_000_000
    }
    return _factory
  }
}
