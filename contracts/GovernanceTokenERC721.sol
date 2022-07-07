// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/draft-ERC721Votes.sol";

import "@openzeppelin/contracts/utils/Counters.sol";

contract GovernanceTokenERC721 is
    ERC721,
    ERC721Burnable,
    Ownable,
    EIP712,
    ERC721Votes
{
    using Counters for Counters.Counter;

    Counters.Counter private tokensAlreadyMinted;

    uint256 constant s_maxSupply = 1000;

    constructor()
        ERC721("GovernanceTokenERC721", "GNF")
        EIP712("MyToken", "1")
    {}

    /*
    function safeMint(address to, uint256 tokenId) public onlyOwner {
        _safeMint(to, tokenId);
    }
*/

    //todo: add reentrance control
    function mint() public payable {
        require(tokensAlreadyMinted.current() < s_maxSupply, "Minted out");
        require(balanceOf(msg.sender) == 0, "One mint per wallet allowed");
        _safeMint(msg.sender, tokensAlreadyMinted.current());
        tokensAlreadyMinted.increment();
    }

    // The following functions are overrides required by Solidity.
    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(_exists(tokenId), "ERC721: invalid token ID");
        return (
            "https://bafybeib4vosgm6izri2wkscdga6hjrnua7thdjzw3k73geapluasmcjrhq.ipfs.dweb.link/metadata.json"
        );
    }

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Votes) {
        super._afterTokenTransfer(from, to, tokenId);
    }
}
