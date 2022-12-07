// SPDX-License-Identifier: MIT

// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

pragma solidity ^0.8.7;

/* ours is'nt a normal ERC20 token
Imagine =>
    Someone knows a cool proposal is coming up
    so they buy a ton of tokens, and then they dump it after the voting is over
Solution =>
    snapshot of how many tokens people have at a certain block
    we want to make sure that once a proposal goes through we pick a snapshot from the past that we want to use => incentivizes people to not just jump in when it's a proposal and jump out
*/

contract GovernanceToken is ERC20Votes {
    // 1M tokens
    uint256 public s_maxSupply = 1000000000000000000000000;

    constructor() ERC20("GovernanceToken", "GOAT") ERC20Permit("GovernanceToken") {
        // mint all the tokens to the person who deploys the contract
        _mint(msg.sender, s_maxSupply);
    }

    // anytime we do a token transfer
    // we want to make sure we call _afterTokenTransfer of ERC20Vots => snapshots are updated
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20Votes) {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount) internal override(ERC20Votes) {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount) internal override(ERC20Votes) {
        super._burn(account, amount);
    }
}
