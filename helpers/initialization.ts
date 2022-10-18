import * as dotenv from "dotenv"
dotenv.config()
import { arbitrageAddress } from "../constants"
import { PROJECT_SETTINGS, UNISWAP, SUSHISWAP } from "../helper-hardhat-config"
import { ethers, Signer, Wallet } from "ethers"
import { JsonRpcProvider } from "@ethersproject/providers"
import { IUniswapV2Factory, IUniswapV2Router02, Arbitrage, IWeth } from "../typechain"

import { abi as ArbitrageABI } from "../artifacts/contracts/Arbitrage.sol/Arbitrage.json"
import { abi as IUniswapV2Router02ABI } from "@uniswap/v2-periphery/build/IUniswapV2Router02.json"
import { abi as IUniswapV2FactoryABI } from "@uniswap/v2-core/build/IUniswapV2Factory.json"

export let provider: JsonRpcProvider, wallet: Wallet, signer: Signer, wallet2: Wallet

if (!PROJECT_SETTINGS.isLocal) {
    provider = new ethers.providers.JsonRpcProvider(process.env.ALCHEMY_RPC_URL)
    wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider)
} else {
    provider = new ethers.providers.JsonRpcProvider(PROJECT_SETTINGS.localUrl)
    console.log("provider: " + provider)
    wallet = new ethers.Wallet(PROJECT_SETTINGS.localPrivateKey, provider)
    wallet2 = new ethers.Wallet(PROJECT_SETTINGS.account2PrivateKey, provider)
}

const getBalance = async () => {
    const balance = ethers.utils.formatEther(await wallet.getBalance())
    console.log("balance: " + balance, "\n")
}

getBalance()

export const uFactory = new ethers.Contract(
    UNISWAP.FACTORY_ADDRESS,
    IUniswapV2FactoryABI,
    provider
) as IUniswapV2Factory // UNISWAP FACTORY CONTRACT

export const uRouter = new ethers.Contract(
    UNISWAP.V2_ROUTER_02_ADDRESS,
    IUniswapV2Router02ABI,
    provider
) as IUniswapV2Router02 // UNISWAP ROUTER CONTRACT

export const sFactory = new ethers.Contract(
    SUSHISWAP.FACTORY_ADDRESS,
    IUniswapV2FactoryABI,
    provider
) as IUniswapV2Factory // SUSHISWAP FACTORY CONTRACT

export const sRouter = new ethers.Contract(
    SUSHISWAP.V2_ROUTER_02_ADDRESS,
    IUniswapV2Router02ABI,
    provider
) as IUniswapV2Router02 // SUSHISWAP ROUTER CONTRACT

export const arbitrage = new ethers.Contract(arbitrageAddress, ArbitrageABI, provider) as Arbitrage
