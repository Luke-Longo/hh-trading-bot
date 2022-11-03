// import * as dotenv from "dotenv"
// dotenv.config()

// import { DeployFunction } from "hardhat-deploy/types"
// import { network, getChainId } from "hardhat"
// import { developmentChains, UNISWAP, SUSHISWAP } from "../helper-hardhat-config"
// import verify from "../utils/verify"

// const deploy: DeployFunction = async function (hre) {
//     const { deployments, getNamedAccounts } = hre
//     const { deploy, log } = deployments
//     const { deployer } = await getNamedAccounts()
//     const chainId = await getChainId()
//     console.log("chainId", chainId)
//     log("--------------------")

//     const args = [SUSHISWAP.V2_ROUTER_02_ADDRESS, UNISWAP.V2_ROUTER_02_ADDRESS]
//     const deployResult = await deploy("Arbitrage", {
//         from: deployer,
//         args,
//         log: true,
//         waitConfirmations: 1,
//     })
//     if (deployResult.newlyDeployed) {
//         console.log("Contract deployed to:", deployResult.address)
//     }
//     if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
//         log("Verifying contract...")
//         await verify(deployResult.address, args)
//     }
// }

// export default deploy

// deploy.tags = ["all", "arbitrage"]
