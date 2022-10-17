// -- HANDLE INITIAL SETUP -- //
import "./helpers/server"
import * as dotenv from "dotenv"
dotenv.config()
import { PROJECT_SETTINGS } from "./helper-hardhat-config"
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
            // Error occurs since sushiswap has less reserves than uniswap so if
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

    const uFPrice = BigNumber.from(uPrice)
    const sFPrice = BigNumber.from(sPrice)
    const priceDifference = uFPrice.sub(sFPrice).div(sFPrice).mul(100).toNumber().toFixed(4)

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
    console.log(`${tickerFor}: ${reserves[0].toString()}`)
    console.log(`WETH: ${ethers.utils.parseUnits(reserves[1].toString(), "ether")}\n`)

    try {
        // This returns the amount of WETH needed
        console.log("Getting amounts in")

        console.log(`reserves string ${reserves[0].toString()} \n`)
        console.log(`reserves string ${reserves[1].toString()} \n`)

        let result = await _routerPath[0].getAmountsIn(reserves[0].toString(), [
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

        let weiBalanceBefore = await provider.getBalance(account)
        console.log(` Balance Before: ${ethers.utils.formatEther(weiBalanceBefore)}\n`)
        console.log("Estimated Gas Cost", estimatedGasCost)
        const weiBalanceAfter = weiBalanceBefore.sub(ethers.utils.parseEther(estimatedGasCost))

        console.log(`WEI Balance After Transaction: ${weiBalanceAfter}\n`)

        const amountDifference = amountOut.sub(amountIn)
        let wethBalanceBefore = await _token0Contract.balanceOf(account)
        console.log("amountDifference string", amountDifference.toString())
        const wethBalanceAfter = amountDifference.add(wethBalanceBefore)
        const wethBalanceDifference = wethBalanceAfter.sub(wethBalanceBefore)

        const totalGained = wethBalanceDifference.sub(ethers.utils.parseEther(estimatedGasCost))

        const data = {
            "ETH Balance Before": ethers.utils.formatEther(weiBalanceBefore.toString()).toString(),
            "ETH Balance After": ethers.utils.formatEther(weiBalanceAfter.toString()).toString(),
            "ETH Spent (gas)": estimatedGasCost.toString(),
            "-": {},
            "WETH Balance BEFORE": ethers.utils.parseEther(wethBalanceBefore.toString()).toString(),
            "WETH Balance AFTER": wethBalanceAfter.toString(),
            "WETH Gained/Lost": ethers.utils
                .formatEther(wethBalanceDifference.toString())
                .toString(),
            "--": {},
            "Total Gained/Lost": ethers.utils.formatEther(totalGained.toString()).toString(),
        }

        console.table(data)

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

    if (PROJECT_SETTINGS.isDeployed) {
        await arbitrage
            .connect(wallet)
            .executeTrade(startOnUniswap, _token0Contract.address, _token1Contract.address, amount)
        // .send({ from: account, gas: gas })
    }

    console.log(`Trade Complete:\n`)

    // Fetch token balance after
    // have to use the erc20 contract to get the balance of the token
    // track what is wei and what is eth
    const balanceAfter = await _token0Contract.balanceOf(account)
    const ethBalanceAfter = await provider.getBalance(account)

    const balanceDifference = balanceAfter.sub(balanceBefore)
    const totalSpent = ethBalanceBefore.sub(ethBalanceAfter)
    const data = {
        "ETH Balance Before": ethers.utils.formatEther(ethBalanceBefore.toString()),
        "ETH Balance After": ethers.utils.formatEther(ethBalanceAfter.toString()),
        "ETH Spent (gas)": ethers.utils.formatEther(
            ethBalanceBefore.sub(ethBalanceAfter).toString()
        ),
        "-": {},
        "WETH Balance BEFORE": ethers.utils.formatEther(balanceBefore.toString()),
        "WETH Balance AFTER": ethers.utils.formatEther(balanceAfter.toString()),
        "WETH Gained/Lost": ethers.utils.formatEther(balanceDifference.toString()),
        "--": {},
        "Total Gained/Lost": `${ethers.utils.formatEther(
            balanceDifference.sub(totalSpent).toString()
        )} ETH`,
    }

    console.table(data)
}

main()
