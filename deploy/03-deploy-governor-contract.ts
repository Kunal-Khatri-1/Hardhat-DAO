import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import {
    VOTING_DELAY,
    VOTING_PERIOD,
    QUORUM_PERCENTAGE,
    developmentChains,
    networkConfig,
} from "../helper-hardhat-config"
import verify from "../utils/verify"

const deployGovernorContract: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    // @ts-ignore
    const { getNamedAccounts, deployments, network } = hre
    const { log, deploy, get } = deployments
    const { deployer } = await getNamedAccounts()
    const governanceToken = await get("GovernanceToken")
    const timeLock = await get("TimeLock")
    log("Deploying Governor...")

    const args = [
        governanceToken.address,
        timeLock.address,
        VOTING_DELAY,
        VOTING_PERIOD,
        QUORUM_PERCENTAGE,
    ]
    const governorContract = await deploy("GovernorContract", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
    })

    log(`governorContract deployed at ${governorContract.address}`)

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        verify(governorContract.address, args)
    }
}

export default deployGovernorContract
deployGovernorContract.tags = ["all", "governor"]
