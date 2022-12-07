import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { networkConfig, developmentChains } from "../helper-hardhat-config"
import verify from "../utils/verify"
// @ts-ignore
import { ethers } from "hardhat"

const deployGovernanceToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    // @ts-ignore
    const { getNamedAccounts, deployments, network } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    log("Deploying governance token...")

    const governanceToken = await deploy("GovernanceToken", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
    })

    log(`GovernanceToken deployed at ${governanceToken.address}`)

    await delegate(governanceToken.address, deployer)
    log("Delegated")

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(governanceToken.address, [])
    }
}

// adding delgate function
// because when we deploy the contract no body has the voting power
// the reason is that nobody has token delegated to them
// we want to delegate the tokens to our deployer
// take my votes and vote however you want
const delegate = async (governanaceTokenAddress: string, delegatedAccount: string) => {
    const governanceToken = await ethers.getContractAt("GovernanceToken", governanaceTokenAddress)
    const tx = await governanceToken.delegate(delegatedAccount)
    await tx.wait(1)
    console.log(`Checkpoints ${await governanceToken.numCheckpoints(delegatedAccount)}`)
}

export default deployGovernanceToken
deployGovernanceToken.tags = ["all", "governor"]
