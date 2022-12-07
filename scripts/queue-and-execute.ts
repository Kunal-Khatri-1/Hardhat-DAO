import {
    developmentChains,
    FUNC,
    MIN_DELAY,
    NEW_STORE_VALUE,
    PROPOSAL_DESCRIPTION,
} from "../helper-hardhat-config"
// @ts-ignore
import { ethers, network } from "hardhat"
import { moveBlocks } from "../utils/move-blocks"
import { moveTime } from "../utils/move-time"

export async function queueAndExecute() {
    // queue function is the GovernorTimeLockController
    const args = [NEW_STORE_VALUE]
    const box = await ethers.getContract("Box")
    const encodedFunctionCall = box.interface.encodeFunctionData(FUNC, args)
    // proposal description will be hashed on chain (propose.ts) and that is what queue-and-execute will be looking for
    const descriptionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(PROPOSAL_DESCRIPTION))

    const governor = await ethers.getContract("GovernorContract")
    console.log("Queueing...")
    // exact same as the proposeTx but descriptionHash instead of string description
    const queueTx = await governor.queue(
        [box.address],
        [0],
        [encodedFunctionCall],
        descriptionHash
    )
    await queueTx.wait(1)
    // we still have to wait that minimum delay
    // can't just execute right away if the proposal is queued up
    // Got to give people time to get out

    // here we have to move both blocks and time
    if (developmentChains.includes(network.name)) {
        await moveTime(MIN_DELAY + 1)
        await moveBlocks(1)
    }

    console.log("Executing...")
    const executeTx = await governor.execute(
        [box.address],
        [0],
        [encodedFunctionCall],
        descriptionHash
    )

    await executeTx.wait(1)

    const boxNewValue = await box.retrieve()
    console.log(`New Box Value: ${boxNewValue.toString()}`)
}

queueAndExecute()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
