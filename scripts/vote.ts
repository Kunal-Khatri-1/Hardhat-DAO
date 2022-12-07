import * as fs from "fs"
// @ts-ignore
import { network, ethers } from "hardhat"
import { developmentChains, proposalsFile, VOTING_PERIOD } from "../helper-hardhat-config"
import { moveBlocks } from "../utils/move-blocks"

const index = 0

async function main(proposalIndex: number) {
    const proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf-8"))
    const proposalId = proposals[network.config.chainId!][proposalIndex]
    // voting: 0 => Against, 1 => For, 2 => Abstain
    const voteWay = 1
    const reason = "Meri marzi"
    const governor = await ethers.getContract("GovernorContract")
    // explore different voting functions: castVote, cateVoteWithReason, castVoteWithSignature
    const voteTxResponse = await governor.castVoteWithReason(proposalId, voteWay, reason)
    const voteTxReceipt = await voteTxResponse.wait(1)
    console.log(voteTxReceipt.events[0].args.reason)
    const proposalState = await governor.state(proposalId)
    console.log(`Current proposal state: ${proposalState}`)
    // getting at the end of the voting period
    if (developmentChains.includes(network.name)) {
        await moveBlocks(VOTING_PERIOD + 1)
    }
    console.log("!!!Voted!!!")
    // run the governor.state in hardhat console 4 => Succeeded
    // check for the ProposalState on IGovernor contract
}

main(index)
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
