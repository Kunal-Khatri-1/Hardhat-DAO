// SPDX-License-Identifier: MIT

/* additional contract that is actually the owner of the box contract
we want to wait for a new vote to be "executed"
    say some proposal goes through that is bad like =>
    Everyone who holds the governance token has to pay 5 tokens
All of these governance tokens give time to users to "get out" if they don't like a governance update
*/

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/governance/TimelockController.sol";

contract TimeLock is TimelockController {
    // minDelay => how long you have to wait after the proposal passes or before executing
    // proposers => is the list of the address that can propose (which will be everyone in this case)
    // executors => who can execute when a proposal passes (which will be everyone in this case)
    constructor(
        uint256 minDelay,
        address[] memory proposers,
        address[] memory executors
    ) TimelockController(minDelay, proposers, executors, msg.sender) {}
}
