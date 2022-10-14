// -- IMPORT PACKAGES -- //
import * as dotenv from "dotenv"

dotenv.config()
import { ethers } from "hardhat"
import { Token } from "@uniswap/sdk"

import { abi as UniswapV2Router02ABI } from "@uniswap/v2-periphery/build/IUniswapV2Router02.json"
import { abi as UniswapV2FactoryABI } from "@uniswap/v2-core/build/IUniswapV2Factory.json"
import { abi as IERC20ABI } from "@openzeppelin/contracts/build/contracts/ERC20.json"
import { abi as IWETHABI } from "../artifacts/contracts/interfaces/IWETH.sol/IWETH.json"
import { IUniswapV2Factory, IUniswapV2Router02, IUniswapV2ERC20, IERC20, IWeth } from "../typechain"
// -- SETUP NETWORK & WEB3 -- //

const chainId = 1

const provider = new ethers.providers.JsonRpcProvider(process.env.ALCHEMY_RPC_URL)

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider)

// -- IMPORT HELPER FUNCTIONS -- //

import { getPairContract, calculatePrice } from "../helpers/helpers"

// -- IMPORT & SETUP UNISWAP/SUSHISWAP CONTRACTS -- //

import config from "../config.json"
import { Wallet } from "ethers"

const uFactory = new ethers.Contract(
    config.UNISWAP.FACTORY_ADDRESS,
    UniswapV2FactoryABI,
    provider
) as IUniswapV2Factory // UNISWAP FACTORY CONTRACT

const sFactory = new ethers.Contract(
    config.SUSHISWAP.FACTORY_ADDRESS,
    UniswapV2FactoryABI,
    provider
) as IUniswapV2Factory // SUSHISWAP FACTORY CONTRACT

const uRouter = new ethers.Contract(
    config.UNISWAP.V2_ROUTER_02_ADDRESS,
    UniswapV2Router02ABI,
    provider
) as IUniswapV2Router02 // UNISWAP ROUTER CONTRACT

const sRouter = new ethers.Contract(
    config.SUSHISWAP.V2_ROUTER_02_ADDRESS,
    UniswapV2Router02ABI,
    provider
) as IUniswapV2Router02 // UNISWAP ROUTER CONTRACT

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
    const accounts = await ethers.getSigners()
    const account = wallet // accounts[1] This will be the account to recieve WETH after we perform the swap to manipulate price

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

    await manipulatePrice([ERC20_TOKEN, WETH_TOKEN], account)

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

    let balance = ethers.utils.formatEther(await WETH_CONTRACT.balanceOf(account.address))
    // balance = web3.utils.fromWei(balance.toString(), "ether")

    console.log(`\nBalance in reciever account: ${balance} WETH\n`)
}

main()

//

async function manipulatePrice(tokens: Token[], account0: Wallet) {
    console.log(`\nBeginning Swap...\n`)

    console.log(`Input Token: ${tokens[0].symbol}`)
    console.log(`Output Token: ${tokens[1].symbol}\n`)
    const accounts = await ethers.getSigners()
    const account1 = accounts[1]

    // const amountIn = new web3.utils.BN(web3.utils.toWei(AMOUNT, "ether"))
    const amountIn = await ethers.utils.parseUnits(AMOUNT, "ether")
    console.log(`Amount In: ${amountIn.toString()}\n`)

    const path = [tokens[0].address, tokens[1].address]
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20 // 20 minutes

    await ERC20_CONTRACT.connect(account1).approve(V2_ROUTER_TO_USE.address, amountIn, {
        gasLimit: GAS,
    })

    console.log(`Approved ${tokens[0].symbol} for swap\n`)
    // .send({ from: UNLOCKED_ACCOUNT})
    // await ERC20_CONTRACT.transfer(UNLOCKED_ACCOUNT, amountIn)
    // need to swap tokens to make sure there is enough SHIB in wallet to transfer to account0

    // deposit weth into WETH contract
    const tx = await WETH_CONTRACT.connect(account1).deposit({
        value: ethers.utils.parseEther("10"),
        gasLimit: GAS,
    })
    await tx.wait(1)

    const againstBalance = await ERC20_CONTRACT.balanceOf(account1.address)
    const wethBalance = await WETH_CONTRACT.balanceOf(account1.address)

    console.log("wethBalance", wethBalance.toString())
    console.log("againstBalance", againstBalance.toString())

    await ERC20_CONTRACT.connect(account1).transfer(account1.address, amountIn, {
        gasLimit: GAS,
    })
    console.log(`Transferred ${tokens[0].symbol} to account 1\n`)

    const receipt = await V2_ROUTER_TO_USE.connect(account1).swapExactTokensForTokens(
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
