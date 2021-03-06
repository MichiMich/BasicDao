// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

//this token will be used to vote

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract GovernanceTokenERC20 is ERC20Votes {
    uint256 public s_maxSupply = 10000;

    constructor()
        ERC20("GovernanceTokenERC20", "GT")
        ERC20Permit("GovernanceTokenERC20")
    {
        //_mint(msg.sender, s_maxSupply); //contract mints all tokens, which can be get via getTokensPerVote
    }

    //reduce tokens to 1 per wallet
    function mint() public {
        //reantrancy?
        require(balanceOf(msg.sender) == 0, "One mint per wallet allowed");
        _mint(msg.sender, 1);
    }

    function mintAndDelegate(address _delegateTo) public {
        require(balanceOf(msg.sender) == 0, "One mint per wallet allowed");
        _mint(msg.sender, 1);
        delegate(_delegateTo);
    }

    //the functions below are overrides required by solidity
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

    function _burn(address account, uint256 amount)
        internal
        override(ERC20Votes)
    {
        super._burn(account, amount);
    }
}
