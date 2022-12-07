import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { networkConfig, MIN_DELAY, developmentChains } from "../helper-hardhat-config"
import { network } from "hardhat"
import verify from "../utils/verify"

const deployTimeLock: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    // @ts-ignore
    const { getNamedAccounts, deployments } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    log("Deploying Timelock...")
    log("Deployer address is: ", deployer)

    const args = [MIN_DELAY, [], []]
    const timeLock = await deploy("TimeLock", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
    })

    log(`TimeLock deployed at ${timeLock.address}`)

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(timeLock.address, args)
    }
}

export default deployTimeLock
deployTimeLock.tags = ["all", "timelock"]
