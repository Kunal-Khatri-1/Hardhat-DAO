// @ts-ignore
import { ethers } from "hardhat"

export interface networkConfigItem {
    ethUsdPriceFeed?: string
    blockConfirmations?: number
}

export interface networkConfigInfo {
    [key: string]: networkConfigItem
}

export const networkConfig: networkConfigInfo = {
    localhost: {},
    hardhat: {},
    goerli: {
        blockConfirmations: 6,
    },
}

export const developmentChains: string[] = ["hardhat", "localhost"]
export const MIN_DELAY = 3600 // 1hr

export const VOTING_PERIOD = 5 // 5 blocks
export const VOTING_DELAY = 1 // 1 block
export const QUORUM_PERCENTAGE = 4 // 4% always need to vote

export const ADDRESS_ZERO = ethers.constants.AddressZero

export const NEW_STORE_VALUE = 77
export const FUNC = "store"
export const PROPOSAL_DESCRIPTION = "Proposal #1, store 77 in the Box"
export const proposalsFile = "proposals.json"
