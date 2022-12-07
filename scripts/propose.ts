// @ts-ignore
import { ethers, network } from "hardhat"
import {
    NEW_STORE_VALUE,
    FUNC,
    PROPOSAL_DESCRIPTION,
    developmentChains,
    VOTING_DELAY,
    proposalsFile,
} from "../helper-hardhat-config"
import { moveBlocks } from "../utils/move-blocks"
import * as fs from "fs"

export async function propose(args: any[], functionToCall: string, proposalDescription: string) {
    const governor = await ethers.getContract("GovernorContract")
    const box = await ethers.getContract("Box")

    // see the propse function in the GovernorContract
    const encodedFunctionCall = box.interface.encodeFunctionData(functionToCall, args)

    console.log(
        `encodedFunctionCall: ${encodedFunctionCall}, decodedFunctionCall: ${box.interface.decodeFunctionData(
            functionToCall,
            encodedFunctionCall
        )}`
    )

    console.log(`proposing ${functionToCall} on ${box.address} with ${args}`)
    console.log(`Proposal Description: \n ${proposalDescription}`)

    const proposeTx = await governor.propose(
        [box.address],
        [0],
        [encodedFunctionCall],
        proposalDescription
    )
    const proposeReceipt = await proposeTx.wait(1)

    if (developmentChains.includes(network.name)) {
        await moveBlocks(VOTING_DELAY + 1)
    }

    const proposalId = proposeReceipt.events[0].args.proposalId
    console.log(`Proposed with proposal ID: \n ${proposalId}}`)

    const proposalState = await governor.state(proposalId)
    const proposalSnapShot = await governor.proposalSnapshot(proposalId)
    const proposalDeadline = await governor.proposalDeadline(proposalId)

    let proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf-8"))
    proposals[network.config.chainId!.toString()].push(proposalId.toString())
    fs.writeFileSync(proposalsFile, JSON.stringify(proposals))

    console.log(`Current state of proposal State: ${proposalState}`)
    // block number the proposal was snapshot
    console.log(`Current state of Snapshot: ${proposalSnapShot}`)
    // block number the proposal voting expires
    console.log(`Current Proposal Deadline: ${proposalDeadline}`)
}

propose([NEW_STORE_VALUE], FUNC, PROPOSAL_DESCRIPTION)
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
