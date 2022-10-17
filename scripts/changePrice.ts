// -- IMPORT PACKAGES -- //
import * as dotenv from "dotenv"

dotenv.config()
import { ethers, getNamedAccounts, network } from "hardhat"
import { Token } from "@uniswap/sdk"

import { abi as IERC20ABI } from "@openzeppelin/contracts/build/contracts/ERC20.json"
import { abi as IWETHABI } from "../artifacts/contracts/interfaces/IWETH.sol/IWETH.json"
import { IUniswapV2ERC20, IWeth } from "../typechain"
import {
    provider,
    uFactory,
    sFactory,
    uRouter,
    sRouter,
    wallet,
    wallet2,
} from "../helpers/initialization"
import { PROJECT_SETTINGS, UNISWAP, SUSHISWAP } from "../helper-hardhat-config"
// -- SETUP NETWORK & WEB3 -- //

const chainId = 1

// -- IMPORT HELPER FUNCTIONS -- //

import { getPairContract, calculatePrice } from "../helpers/helpers"

// -- IMPORT & SETUP UNISWAP/SUSHISWAP CONTRACTS -- //

import { Wallet } from "ethers"

// -- CONFIGURE VALUES HERE -- //

const V2_FACTORY_TO_USE = uFactory
const V2_ROUTER_TO_USE = uRouter

// const UNLOCKED_ACCOUNT = "0xdEAD000000000000000042069420694206942069" // SHIB Unlocked Account
const ERC20_ADDRESS = process.env.ARB_AGAINST

const WETH_ADDRESS = process.env.ARB_FOR

const AMOUNT = "40500000000000" // 40,500,000,000,000 SHIB -- Tokens will automatically be converted to wei

const GAS = 450000

// -- SETUP ERC20 CONTRACT & TOKEN -- //

const ERC20_CONTRACT = new ethers.Contract(ERC20_ADDRESS!, IERC20ABI, provider) as IUniswapV2ERC20

const WETH_CONTRACT = new ethers.Contract(WETH_ADDRESS!, IWETHABI, provider) as IWeth

// -- MAIN SCRIPT -- //

const main = async () => {
    const accounts = await getNamedAccounts()
    // accounts[1] This will be the account to recieve WETH after we perform the swap to manipulate price
    const pairContract = await getPairContract(V2_FACTORY_TO_USE, ERC20_ADDRESS!, WETH_ADDRESS!)
    console.log(`Received pair contract\n`)

    const ERC20_TOKEN = new Token(
        chainId,
        ERC20_ADDRESS!,
        18,
        (await ERC20_CONTRACT.symbol()) || "ERC20",
        (await ERC20_CONTRACT.name()) || "ERC20 Contract"
    )

    const WETH_TOKEN = new Token(
        chainId,
        WETH_ADDRESS!,
        18,
        (await WETH_CONTRACT.symbol()) || "WETH",
        (await WETH_CONTRACT.name()) || "Wrapped Ether"
    )

    // Fetch price of SHIB/WETH before we execute the swap
    console.log(`Fetching price of ${ERC20_TOKEN.symbol}/${WETH_TOKEN.symbol} before swap...`)
    const priceBefore = await calculatePrice(pairContract)
    console.log(`Price before swap: ${priceBefore}\n`)

    await manipulatePrice([ERC20_TOKEN, WETH_TOKEN], wallet)

    // Fetch price of SHIB/WETH after the swap
    const priceAfter = await calculatePrice(pairContract)
    console.log("priceAfter", priceAfter)

    const data = {
        "Price Before": `1 ${WETH_TOKEN.symbol} = ${Number(priceBefore).toFixed(0)} ${
            ERC20_TOKEN.symbol
        }`,
        "Price After": `1 ${WETH_TOKEN.symbol} = ${Number(priceAfter).toFixed(0)} ${
            ERC20_TOKEN.symbol
        }`,
    }

    console.log("data calculated")

    console.table(data)

    let balance = ethers.utils.formatEther(await WETH_CONTRACT.balanceOf(wallet.address))
    // balance = web3.utils.fromWei(balance.toString(), "ether")

    console.log(`\nBalance in reciever account: ${balance} WETH\n`)
}

main()

//

async function manipulatePrice(tokens: Token[], account0: Wallet) {
    console.log(`\nBeginning Swap...\n`)
    console.log(`Input Token: ${tokens[0].symbol}\n`)
    console.log(`Output Token: ${tokens[1].symbol}\n`)
    const account2 = wallet2 // this will be the account to swap shib to weth

    // const amountIn = new web3.utils.BN(web3.utils.toWei(AMOUNT, "ether"))
    const amountIn = await ethers.utils.parseEther("900")

    console.log(`Amount In: ${amountIn.toString()}\n`)

    const path = [tokens[0].address, tokens[1].address]

    const deadline = Math.floor(Date.now() / 1000) + 60 * 20 // 20 minutes

    await ERC20_CONTRACT.connect(account2).approve(V2_ROUTER_TO_USE.address, amountIn, {
        gasLimit: GAS,
    })
    await WETH_CONTRACT.connect(account2).approve(V2_ROUTER_TO_USE.address, amountIn, {
        gasLimit: GAS,
    })

    console.log(`Approved ${tokens[0].symbol} for swap\n`)
    console.log(`Approved ${tokens[1].symbol} for swap\n`)

    // need to swap tokens to make sure there is enough SHIB in wallet to transfer to account0

    const tx = await WETH_CONTRACT.connect(account2).deposit({
        value: amountIn,
        gasLimit: GAS,
    })

    await tx.wait(1)

    const wethBalance = await WETH_CONTRACT.balanceOf(account2.address)

    console.log("wethBalance", wethBalance.toString(), "\n")

    console.log(`Swapping ${amountIn.toString()} ${tokens[1].symbol} for ${tokens[0].symbol}... \n`)

    const reversePath = [tokens[1].address, tokens[0].address]

    const trade1Receipt = await V2_ROUTER_TO_USE.connect(account2).swapExactTokensForTokens(
        wethBalance,
        0,
        reversePath,
        account2.address,
        deadline,
        {
            gasLimit: GAS,
        }
    )

    await trade1Receipt.wait(1)

    const againstBalance = await ERC20_CONTRACT.balanceOf(account2.address)

    console.log("wethBalance", wethBalance.toString(), "\n")
    console.log("againstBalance", againstBalance.toString(), "\n")

    await ERC20_CONTRACT.connect(account2).transfer(account2.address, amountIn, {
        gasLimit: GAS,
    })

    console.log(`Transferred ${tokens[0].symbol} to account 1\n`)

    const receipt = await V2_ROUTER_TO_USE.connect(account2).swapExactTokensForTokens(
        amountIn,
        0,
        path,
        account0.address,
        deadline,
        {
            gasLimit: GAS,
        }
    )
    // .send({ from: UNLOCKED_ACCOUNT, gas: GAS })

    console.log(`Swap Complete!\n`)

    return receipt
}
