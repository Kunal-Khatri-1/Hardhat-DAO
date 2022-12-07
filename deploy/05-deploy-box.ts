// deploying the contract we want to govern over => Box.sol
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { developmentChains, networkConfig } from "../helper-hardhat-config"
import { network } from "hardhat"
import verify from "../utils/verify"
// @ts-ignore
import { ethers } from "hardhat"

const deployBox: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    // @ts-ignore
    const { getNamedAccounts, deployments } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    log("Deploying Box...")

    const args = []
    // this is box deployment object => does not have contract functoins
    const box = await deploy("Box", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
    })

    // right now deployer has deployed this, not timeLock
    // we want to give the box ownership over to governance process
    const timeLock = await ethers.getContract("TimeLock")

    // getting the box contract object
    const boxContract = await ethers.getContractAt("Box", box.address)
    const transferOwnerTx = await boxContract.transferOwnership(timeLock.address)
    await transferOwnerTx.wait(1)

    log("!!!DONE!!!")

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        verify(box.address, args)
    }
}

export default deployBox
deployBox.tags = ["all", "box"]
