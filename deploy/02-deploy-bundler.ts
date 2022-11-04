import * as dotenv from "dotenv"
dotenv.config()

import { DeployFunction } from "hardhat-deploy/types"
import { network, getChainId } from "hardhat"
import { developmentChains } from "../helper-hardhat-config"
import verify from "../utils/verify"

const deploy: DeployFunction = async function (hre) {
    const { deployments, getNamedAccounts } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = await getChainId()
    console.log("chainId", chainId)
    log("--------------------")
    const args = ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"]
    const deployResult = await deploy("FlashBotsMultiCall", {
        from: deployer,
        args,
        log: true,
        waitConfirmations: 1,
    })
}

export default deploy

deploy.tags = ["all", "bundler", "executor"]
