// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

//we want to wait for a new vote to be executed

//give time to users to "get out" if they dont like the governance proposal

import "@openzeppelin/contracts/governance/TimelockController.sol";

contract TimeLock is TimelockController {
    //minDelay: How long you have to wait before executing
    // proposers is the list of addresses that can propose a proposal
    // executors : woh can execute when a proposal passes
    constructor(
        uint256 minDelay,
        address[] memory proposers,
        address[] memory executers
    ) TimelockController(minDelay, proposers, executers) {}
}
