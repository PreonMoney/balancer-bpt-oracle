import { ethers, network } from "hardhat"
import "dotenv/config"

export async function forkToBsc(block?: number) {
  await network.provider.request({
    method: "hardhat_reset",
    params: [
      {
        forking: {
          jsonRpcUrl: process.env.BSC_RPC,
          blockNumber: block,
        },
      },
    ],
  })
}

export async function forkToHeco(block?: number) {
  await network.provider.request({
    method: "hardhat_reset",
    params: [
      {
        forking: {
          jsonRpcUrl: process.env.HECO_RPC,
          blockNumber: block,
        },
      },
    ],
  })
}

export async function forkToAvax(block?: number) {
  await network.provider.request({
    method: "hardhat_reset",
    params: [
      {
        forking: {
          jsonRpcUrl: process.env.AVAX_RPC,
          blockNumber: block,
        },
      },
    ],
  })
}

export async function forkToMatic(block?: number) {
  await network.provider.request({
    method: "hardhat_reset",
    params: [
      {
        forking: {
          jsonRpcUrl: process.env.POLYGON_RPC,
          blockNumber: block,
        },
      },
    ],
  })
}

export async function forkToOptimism(block?: number) {
  await network.provider.request({
    method: "hardhat_reset",
    params: [
      {
        forking: {
          jsonRpcUrl: process.env.OPTIMISM_RPC,
          blockNumber: block,
        },
      },
    ],
  })
}

export async function forkToMetis(block?: number) {
  await network.provider.request({
    method: "hardhat_reset",
    params: [
      {
        forking: {
          jsonRpcUrl: process.env.METIS_RPC,
          blockNumber: block,
        },
      },
    ],
  })
}

export async function forkToKava(block?: number) {
  await network.provider.request({
    method: "hardhat_reset",
    params: [
      {
        forking: {
          jsonRpcUrl: process.env.KAVA_RPC,
          blockNumber: block,
        },
      },
    ],
  })
}

export async function forkToArbitrum(block?: number) {
  await network.provider.request({
    method: "hardhat_reset",
    params: [
      {
        forking: {
          jsonRpcUrl: process.env.ARBITRUM_RPC,
          blockNumber: block,
        },
      },
    ],
  })
}
