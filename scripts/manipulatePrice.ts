// -- IMPORT PACKAGES -- //
import * as dotenv from "dotenv"

dotenv.config()
import { ethers } from "hardhat"
import { Token } from "@uniswap/sdk"

import { abi as UniswapV2Router02ABI } from "@uniswap/v2-periphery/build/IUniswapV2Router02.json"
import { abi as UniswapV2FactoryABI } from "@uniswap/v2-core/build/IUniswapV2Factory.json"
import { abi as IERC20ABI } from "@openzeppelin/contracts/build/contracts/ERC20.json"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { IUniswapV2Factory, IUniswapV2Router02, IUniswapV2ERC20, IERC20 } from "../typechain"
// -- SETUP NETWORK & WEB3 -- //

const chainId = 1
// const web3 = new Web3("http://127.0.0.1:7545")
const provider = new ethers.providers.JsonRpcProvider(process.env.ALCHEMY_RPC_URL)

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider)

// -- IMPORT HELPER FUNCTIONS -- //

import { getPairContract, calculatePrice } from "../helpers/helpers"

// -- IMPORT & SETUP UNISWAP/SUSHISWAP CONTRACTS -- //

import config from "../config.json"

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

const ERC20_CONTRACT = new ethers.Contract(ERC20_ADDRESS!, IERC20ABI) as IUniswapV2ERC20

const WETH_CONTRACT = new ethers.Contract(WETH_ADDRESS!, IERC20ABI) as IUniswapV2ERC20

// -- MAIN SCRIPT -- //

const main = async () => {
    const accounts = await ethers.getSigners()
    console.log(accounts)
    const account = accounts[1] // This will be the account to recieve WETH after we perform the swap to manipulate price

    const pairContract = await getPairContract(V2_FACTORY_TO_USE, ERC20_ADDRESS!, WETH_ADDRESS!)

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
    const priceBefore = await calculatePrice(pairContract)

    await manipulatePrice([ERC20_TOKEN, WETH_TOKEN], account)

    // Fetch price of SHIB/WETH after the swap
    const priceAfter = await calculatePrice(pairContract)

    const data = {
        "Price Before": `1 ${WETH_TOKEN.symbol} = ${Number(priceBefore).toFixed(0)} ${
            ERC20_TOKEN.symbol
        }`,
        "Price After": `1 ${WETH_TOKEN.symbol} = ${Number(priceAfter).toFixed(0)} ${
            ERC20_TOKEN.symbol
        }`,
    }

    console.table(data)

    let balance = ethers.utils.formatEther(await WETH_CONTRACT.balanceOf(account.address))
    // balance = web3.utils.fromWei(balance.toString(), "ether")

    console.log(`\nBalance in reciever account: ${balance} WETH\n`)
}

main()

//

async function manipulatePrice(tokens: Token[], account0: SignerWithAddress) {
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

    await ERC20_CONTRACT.connect(account1).approve(V2_ROUTER_TO_USE.address, amountIn)
    // .send({ from: UNLOCKED_ACCOUNT})
    // await ERC20_CONTRACT.transfer(UNLOCKED_ACCOUNT, amountIn)
    await ERC20_CONTRACT.connect(account1).transfer(account1.address, amountIn)

    const receipt = await V2_ROUTER_TO_USE.connect(account1).swapExactTokensForTokens(
        amountIn,
        0,
        path,
        account0.address,
        deadline
    )
    // .send({ from: UNLOCKED_ACCOUNT, gas: GAS })

    console.log(`Swap Complete!\n`)

    return receipt
}
