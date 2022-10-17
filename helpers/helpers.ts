import * as dotenv from "dotenv"

dotenv.config()

import { ethers } from "hardhat"
import { PROJECT_SETTINGS, SUSHISWAP, UNISWAP } from "../helper-hardhat-config"
import BN from "bn.js"

export let provider: JsonRpcProvider
if (!PROJECT_SETTINGS.isLocal) {
    provider = new ethers.providers.JsonRpcProvider(process.env.ALCHEMY_RPC_URL)
} else {
    // this may or may not work
    provider = new ethers.providers.JsonRpcProvider(PROJECT_SETTINGS.localUrl)
}

import { ChainId, Token } from "@uniswap/sdk"
import UniswapV2Pair from "@uniswap/v2-core/build/IUniswapV2Pair.json"
import UniERC20 from "../artifacts/contracts/interfaces/IUniswapV2ERC20.sol/IUniswapV2ERC20.json"
import {
    IUniswapV2ERC20,
    IUniswapV2Factory,
    IUniswapV2Pair,
    IUniswapV2Router02,
} from "../typechain"
import { JsonRpcProvider } from "@ethersproject/providers"
import { BigNumber } from "ethers"

export async function getTokenAndContract(_token0Address: string, _token1Address: string) {
    const token0Contract: IUniswapV2ERC20 = (await new ethers.Contract(
        _token0Address,
        UniERC20.abi,
        provider
    )) as IUniswapV2ERC20
    const token1Contract: IUniswapV2ERC20 = (await new ethers.Contract(
        _token1Address,
        UniERC20.abi,
        provider
    )) as IUniswapV2ERC20
    const token0 = new Token(
        ChainId.MAINNET,
        _token0Address,
        18,
        await token0Contract.symbol(),
        await token0Contract.name()
    )

    const token1 = new Token(
        ChainId.MAINNET,
        _token1Address,
        18,
        await token1Contract.symbol(),
        await token1Contract.name()
    )

    return { token0Contract, token1Contract, token0, token1 }
}

export async function getPairAddress(
    _V2Factory: IUniswapV2Factory,
    _token0: string,
    _token1: string
) {
    const pairAddress = await _V2Factory.connect(provider).getPair(_token0, _token1)
    return pairAddress
}

export async function getPairContract(
    _V2Factory: IUniswapV2Factory,
    _token0: string,
    _token1: string
) {
    const pairAddress = await getPairAddress(_V2Factory, _token0, _token1)
    const pairContract = (await new ethers.Contract(
        pairAddress,
        UniswapV2Pair.abi,
        provider
    )) as IUniswapV2Pair
    return pairContract
}

export async function getReserves(_pairContract: IUniswapV2Pair) {
    // will get the reserves of the pair
    const reserves = await _pairContract.getReserves()
    return [reserves.reserve0, reserves.reserve1]
}

export async function calculatePrice(_pairContract: IUniswapV2Pair) {
    // you get the reserves on each pair contract and divide the reserves to get the price
    // reserves 0 is shib and reserves 1 is eth
    const [reserve0, reserve1] = await getReserves(_pairContract)
    console.log("reserve0", reserve0.toString()) //shib
    console.log("reserve1", reserve1.toString()) // weth
    const priceBN = new BN(reserve1.toString()).div(new BN(reserve0.toString()))
    console.log("priceBN", priceBN.toString())
    const price = (Number(reserve1.toString()) / Number(reserve0.toString())).toFixed(15)
    console.log("price", price.toString())
    return priceBN
}

export function calculateDifference(uPrice: BN, sPrice: BN) {
    const difference = uPrice.sub(sPrice).div(sPrice).mul(new BN(100))
    console.log("difference", difference.toString())
    return difference.toString()
}

export async function getEstimatedReturn(
    amount: string,
    _routerPath: IUniswapV2Router02[],
    _token0: Token,
    _token1: Token
) {
    const trade1 = await _routerPath[0].getAmountsOut(amount, [_token0.address, _token1.address])
    const trade2 = await _routerPath[1].getAmountsOut(trade1[1], [_token1.address, _token0.address])
    console.log("Available Trades\n")
    console.log("Amount in", trade1[0].toString(), "\n")
    console.log("Amount out", trade2[1].toString(), "\n")
    const amountIn: BigNumber = await trade1[0]
    const amountOut: BigNumber = await trade2[1]
    return { amountIn, amountOut }
}
