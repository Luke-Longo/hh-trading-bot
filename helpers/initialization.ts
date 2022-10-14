import * as dotenv from "dotenv"
dotenv.config()
import { arbitrageAddress } from "../constants"
import config from "../config.json"

import { ethers, Signer, Wallet } from "ethers"
import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers"
import { IUniswapV2Factory, IUniswapV2Router02, Arbitrage } from "../typechain"

import { abi as ArbitrageABI } from "../artifacts/contracts/Arbitrage.sol/Arbitrage.json"
import { abi as IUniswapV2Router02ABI } from "@uniswap/v2-periphery/build/IUniswapV2Router02.json"
import { abi as IUniswapV2FactoryABI } from "@uniswap/v2-core/build/IUniswapV2Factory.json"

export let provider: JsonRpcProvider, wallet: Wallet, signer: Signer

if (!config.PROJECT_SETTINGS.isLocal) {
    provider = new ethers.providers.JsonRpcProvider(process.env.ALCHEMY_RPC_URL)
    console.log("provider not local", provider)
    wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider)
    console.log("wallet not local", wallet)
} else {
    // this may or may not work
    provider = new ethers.providers.JsonRpcProvider("http://localhost:8545")
    console.log("provider", provider)
    wallet = new ethers.Wallet(process.env.PRIVATE_KEY!).connect(provider)
    console.log(wallet)
}

export const uFactory = new ethers.Contract(
    config.UNISWAP.FACTORY_ADDRESS,
    IUniswapV2FactoryABI,
    provider
) as IUniswapV2Factory // UNISWAP FACTORY CONTRACT

export const uRouter = new ethers.Contract(
    config.UNISWAP.V2_ROUTER_02_ADDRESS,
    IUniswapV2Router02ABI,
    provider
) as IUniswapV2Router02 // UNISWAP ROUTER CONTRACT

export const sFactory = new ethers.Contract(
    config.SUSHISWAP.FACTORY_ADDRESS,
    IUniswapV2FactoryABI,
    provider
) as IUniswapV2Factory // SUSHISWAP FACTORY CONTRACT

export const sRouter = new ethers.Contract(
    config.SUSHISWAP.V2_ROUTER_02_ADDRESS,
    IUniswapV2Router02ABI,
    provider
) as IUniswapV2Router02 // SUSHISWAP ROUTER CONTRACT

export const arbitrage = new ethers.Contract(arbitrageAddress, ArbitrageABI, provider) as Arbitrage

console.log("arbitrage", arbitrage)
