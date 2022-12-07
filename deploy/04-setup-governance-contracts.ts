import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
// @ts-ignore
import { ethers } from "hardhat"
import { ADDRESS_ZERO } from "../helper-hardhat-config"

const setupContracts: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    // right now deployer is timelock admin => centralized => bad. We don't want anyone to be a timelock admin
    // Initially TimeLock has no proposers and no executors
    // we want to only allow the proposer to be the governor (governor contract should be the only contract that prposes things to the timelock)
    // executors => anybody (anybody can execute)

    // governor contract => everyone votes and once the vote passes
    // timelock contract => governor contract as proposer asks timelock to propose, timelock proposes but have to wait for minDelay
    // once the delay happens, anybody can execute

    // @ts-ignore
    const { getNamedAccounts, deployments } = hre
    const { log } = deployments
    const { deployer } = await getNamedAccounts()

    const timeLock = await ethers.getContract("TimeLock", deployer)
    const governor = await ethers.getContract("GovernorContract", deployer)

    log("Setting up roles...")
    const proposerRole = await timeLock.PROPOSER_ROLE()
    const executorRole = await timeLock.EXECUTOR_ROLE()
    const adminRole = await timeLock.TIMELOCK_ADMIN_ROLE()
    console.log("proposerRole, executorRole, adminRole", proposerRole, executorRole, adminRole)

    // right now deployer account owns the timeLock controller. that is why we are able to do proposerTx ad executorTx
    // governor is the only one that can propose the transaction
    log("adding governor as proposer", deployer)
    const proposerTx = await timeLock.grantRole(proposerRole, governor.address)
    await proposerTx.wait(1)
    log("adding address(0) as executor role")
    // giving executor role to address(0) => giving this role to everybody
    const executorTx = await timeLock.grantRole(executorRole, ADDRESS_ZERO)
    await executorTx.wait(1)
    log("revoking adminRole of the deployer")
    // now we have given everybody access we want to revoke deployer's role
    const revokeTx = await timeLock.revokeRole(adminRole, deployer)
    await revokeTx.wait(1)
    // now nothing can happen without governance being done because nobody owns the timelock contract
}

export default setupContracts
setupContracts.tags = ["all", "setup"]
