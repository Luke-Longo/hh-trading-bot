// -- HANDLE INITIAL SETUP -- //

import "./helpers/server"
import * as dotenv from "dotenv"

dotenv.config()

import config from "./config.json"

import { IUniswapV2Pair, IUniswapV2ERC20, IUniswapV2Factory, IUniswapV2Router02 } from "./typechain"
import {
    getTokenAndContract,
    getPairContract,
    calculatePrice,
    getEstimatedReturn,
    getReserves,
} from "./helpers/helpers"
import { BigNumber } from "ethers"
import {
    uFactory,
    uRouter,
    sFactory,
    sRouter,
    provider,
    wallet,
    arbitrage,
} from "./helpers/initialization"
import { ethers } from "ethers"
import { Token } from "@uniswap/sdk"

// -- .ENV VALUES HERE -- //

const arbFor = process.env.ARB_FOR! // This is the address of token we are attempting to arbitrage (WETH)
const arbAgainst = process.env.ARB_AGAINST! // SHIB
const units = process.env.UNITS! // Used for price display/reporting
const difference = process.env.PRICE_DIFFERENCE!
const gas = process.env.GAS_LIMIT!
// you could get live gas prices as well
const estimatedGasCost = process.env.GAS_PRICE! // Estimated Gas: 0.008453220000006144 ETH + ~10%
const tickerFor = process.env.TICKER_FOR!

let uPair: IUniswapV2Pair, sPair: IUniswapV2Pair, amount: string
let isExecuting = false

const main = async () => {
    // Fetch token contracts and tokens
    const { token0Contract, token1Contract, token0, token1 } = await getTokenAndContract(
        arbFor!,
        arbAgainst!
    )
    // get the pair contracts for uniswap and on sushiSwap
    uPair = await getPairContract(uFactory, token0.address, token1.address)
    sPair = await getPairContract(sFactory, token0.address, token1.address)

    console.log(`uPair Address: ${uPair.address}`)
    console.log(`sPair Address: ${sPair.address}\n`)
    // listening for events on the uniswap pair contract
    uPair.on("Swap", async () => {
        if (!isExecuting) {
            isExecuting = true

            const priceDifference = await checkPrice("Uniswap", token0, token1)
            const routerPath = await determineDirection(priceDifference)

            if (!routerPath) {
                console.log(`No Arbitrage Currently Available\n`)
                console.log(`-----------------------------------------\n`)
                isExecuting = false
                return
            }

            const isProfitable = await determineProfitability(
                routerPath,
                token0Contract,
                token0,
                token1
            )

            if (!isProfitable) {
                console.log(`No Arbitrage Currently Available\n`)
                console.log(`-----------------------------------------\n`)
                isExecuting = false
                return
            }

            const receipt = await executeTrade(routerPath, token0Contract, token1Contract)

            isExecuting = false
        }
    })

    // listening for events on the sushiSwap pair contract
    sPair.on("Swap", async () => {
        if (!isExecuting) {
            isExecuting = true

            const priceDifference = await checkPrice("Sushiswap", token0, token1)
            const routerPath = await determineDirection(priceDifference)

            if (!routerPath) {
                console.log(`No Arbitrage Currently Available\n`)
                console.log(`-----------------------------------------\n`)
                isExecuting = false
                return
            }

            const isProfitable = await determineProfitability(
                routerPath,
                token0Contract,
                token0,
                token1
            )

            if (!isProfitable) {
                console.log(`No Arbitrage Currently Available\n`)
                console.log(`-----------------------------------------\n`)
                isExecuting = false
                return
            }

            const receipt = await executeTrade(routerPath, token0Contract, token1Contract)

            isExecuting = false
        }
    })

    console.log("Waiting for swap event...")
}

const checkPrice = async (exchange: string, token0: Token, token1: Token) => {
    isExecuting = true

    console.log(`Swap Initiated on ${exchange}, Checking Price...\n`)

    const currentBlock = await provider.getBlockNumber()

    const uPrice = await calculatePrice(uPair)
    const sPrice = await calculatePrice(sPair)

    const uFPrice = Number(Number(uPrice).toFixed(2))
    const sFPrice = Number(Number(sPrice).toFixed(2))
    const priceDifference = (((uFPrice - sFPrice) / sFPrice) * 100).toFixed(2)

    console.log(`Current Block: ${currentBlock}`)
    console.log(`-----------------------------------------`)
    console.log(`UNISWAP   | ${token1.symbol}/${token0.symbol}\t | ${uFPrice}`)
    console.log(`SUSHISWAP | ${token1.symbol}/${token0.symbol}\t | ${sFPrice}\n`)
    console.log(`Percentage Difference: ${priceDifference}%\n`)

    return priceDifference
}

const determineDirection = async (priceDifference: string) => {
    console.log(`Determining Direction...\n`)

    if (Number(priceDifference) >= Number(difference!)) {
        console.log(`Potential Arbitrage Direction:\n`)
        console.log(`Buy\t -->\t Uniswap`)
        console.log(`Sell\t -->\t Sushiswap\n`)
        return [uRouter, sRouter]
    } else if (Number(priceDifference) <= -Number(difference!)) {
        console.log(`Potential Arbitrage Direction:\n`)
        console.log(`Buy\t -->\t Sushiswap`)
        console.log(`Sell\t -->\t Uniswap\n`)
        return [sRouter, uRouter]
    } else {
        return null
    }
}

const determineProfitability = async (
    _routerPath: IUniswapV2Router02[],
    _token0Contract: IUniswapV2ERC20,
    _token0: Token,
    _token1: Token
) => {
    console.log(`Determining Profitability...\n`)

    // This is where you can customize your conditions on whether a profitable trade is possible.
    // This is a basic example of trading WETH/SHIB...

    let reserves: BigNumber[], exchangeToBuy: string, exchangeToSell: string
    // checking to see which path is being used
    if (_routerPath[0].address == uRouter.address) {
        reserves = await getReserves(sPair)
        exchangeToBuy = "Uniswap"
        exchangeToSell = "Sushiswap"
    } else {
        reserves = await getReserves(uPair)
        exchangeToBuy = "Sushiswap"
        exchangeToSell = "Uniswap"
    }

    console.log(`Reserves on ${_routerPath[1].address}`)
    console.log(
        `${tickerFor}: ${Number(ethers.utils.parseUnits(reserves[0].toString(), "ether")).toFixed(
            0
        )}`
    )
    console.log(`WETH: ${ethers.utils.parseUnits(reserves[1].toString(), "ether")}\n`)

    try {
        // This returns the amount of WETH needed
        console.log("Getting amounts in")
        console.log(`ROUTER PATH: ${_routerPath}\n`)
        console.log(`Router Path 0: ${_routerPath[0]}\n`)
        console.log(`Router Path 1: ${_routerPath[1]}\n`)
        let result = await _routerPath[0].getAmountsIn(reserves[0], [
            _token0.address,
            _token1.address,
        ])

        const token0In: string = result[0].toString() // WETH
        const token1In: string = result[1].toString() // SHIB

        console.log(`Token 0 (WETH) in ${token0In}\n`)
        console.log(`Token 1 (SHIB) in ${token1In}\n`)

        // get amounts out factors in the slippage
        result = await _routerPath[1].getAmountsOut(token1In, [_token1.address, _token0.address])

        console.log(`Amounts out result: ${result}`)

        console.log(
            `Estimated amount of WETH needed to buy enough ${tickerFor} on ${exchangeToBuy}\t\t| ${ethers.utils.parseUnits(
                token0In,
                "ether"
            )}`
        )
        console.log(
            `Estimated amount of WETH returned after swapping ${tickerFor} on ${exchangeToSell}\t| ${ethers.utils.parseUnits(
                result[1].toString(),
                "ether"
            )}\n`
        )

        const { amountIn, amountOut } = await getEstimatedReturn(
            token0In,
            _routerPath,
            _token0,
            _token1
        )

        // Fetch account
        const account = await wallet.getAddress()

        let ethBalanceBefore = await provider.getBalance(account)
        console.log(`ETH Balance Before: ${ethers.utils.formatEther(ethBalanceBefore)}\n`)
        console.log("Estimated Gas Cost", estimatedGasCost)
        const ethBalanceAfter = ethBalanceBefore.sub(ethers.utils.parseEther(estimatedGasCost))
        console.log(`ETH Balance After Transaction: ${ethers.utils.formatEther(ethBalanceAfter)}\n`)

        const amountDifference = amountOut.sub(amountIn)
        let wethBalanceBefore = await _token0Contract.balanceOf(account)
        wethBalanceBefore = ethers.utils.parseUnits(wethBalanceBefore.toString(), "ether")

        const wethBalanceAfter = amountDifference.add(wethBalanceBefore)
        const wethBalanceDifference = wethBalanceAfter.sub(wethBalanceBefore)

        const totalGained = wethBalanceDifference.sub(estimatedGasCost)

        const data = {
            "ETH Balance Before": ethBalanceBefore,
            "ETH Balance After": ethBalanceAfter,
            "ETH Spent (gas)": estimatedGasCost,
            "-": {},
            "WETH Balance BEFORE": wethBalanceBefore,
            "WETH Balance AFTER": wethBalanceAfter,
            "WETH Gained/Lost": wethBalanceDifference,
            _: {},
            "Total Gained/Lost": totalGained,
        }

        console.table(data)
        console.log()

        if (amountOut < amountIn) {
            return false
        }

        amount = token0In
        return true
    } catch (error) {
        console.log(error)
        console.log(`\nError occured while trying to determine profitability...\n`)
        console.log(
            `This can typically happen because an issue with reserves, see README for more information.\n`
        )
        return false
    }
}

const executeTrade = async (
    _routerPath: IUniswapV2Router02[],
    _token0Contract: IUniswapV2ERC20,
    _token1Contract: IUniswapV2ERC20
) => {
    console.log(`Attempting Arbitrage...\n`)

    let startOnUniswap: boolean

    if (_routerPath[0].address == uRouter.address) {
        startOnUniswap = true
    } else {
        startOnUniswap = false
    }

    // Fetch account
    const account = await wallet.address

    // Fetch token balance before
    const balanceBefore = await _token0Contract.balanceOf(account)
    const ethBalanceBefore = await provider.getBalance(account)

    if (config.PROJECT_SETTINGS.isDeployed) {
        await arbitrage
            .connect(wallet)
            .executeTrade(startOnUniswap, _token0Contract.address, _token1Contract.address, amount)
        // .send({ from: account, gas: gas })
    }

    console.log(`Trade Complete:\n`)

    // Fetch token balance after
    // have to use the erc20 contract to get the balance of the token
    const balanceAfter = await _token0Contract.balanceOf(account)
    const ethBalanceAfter = await provider.getBalance(account)

    const balanceDifference = balanceAfter.toNumber() - balanceBefore.toNumber()
    const totalSpent = ethBalanceBefore.toNumber() - ethBalanceAfter.toNumber()

    const data = {
        "ETH Balance Before": ethers.utils.parseUnits(ethBalanceBefore.toString(), "ether"),
        "ETH Balance After": ethers.utils.parseUnits(ethBalanceAfter.toString(), "ether"),
        "ETH Spent (gas)": ethers.utils.parseUnits(
            (ethBalanceBefore.toNumber() - ethBalanceAfter.toNumber()).toString(),
            "ether"
        ),
        "-": {},
        "WETH Balance BEFORE": ethers.utils.parseUnits(balanceBefore.toString(), "ether"),
        "WETH Balance AFTER": ethers.utils.parseUnits(balanceAfter.toString(), "ether"),
        "WETH Gained/Lost": ethers.utils.parseUnits(balanceDifference.toString(), "ether"),
        _: {},
        "Total Gained/Lost": `${ethers.utils.parseUnits(
            (balanceDifference - totalSpent).toString(),
            "ether"
        )} ETH`,
    }

    console.table(data)
}

main()
