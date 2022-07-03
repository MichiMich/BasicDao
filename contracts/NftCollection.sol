// contracts/Box.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract NftCollection is Ownable {
    mapping(address => string) private s_collectionMapping;

    // Emitted when the stored value changes
    event ValueChanged(uint256 newValue);

    event NewContractToCollectionAdded(
        address newContractAddress,
        string collectionName
    );

    // Stores a new value in the contract
    function addCollection(
        address newCollectionContractAddress,
        string memory collectionName
    ) public onlyOwner {
        s_collectionMapping[newCollectionContractAddress] = collectionName;
        emit NewContractToCollectionAdded(
            newCollectionContractAddress,
            collectionName
        );
    }

    function getCollectionName(address collectionContractAddress)
        public
        view
        returns (string memory)
    {
        return s_collectionMapping[collectionContractAddress];
    }

    function isPartOfCollection(address collectionContractAddress)
        public
        view
        returns (bool)
    {
        if (bytes(s_collectionMapping[collectionContractAddress]).length != 0) {
            return true;
        }
    }
}
