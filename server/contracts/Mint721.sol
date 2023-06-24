// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract MintNFT721 is ERC721URIStorage, Ownable {
    address public collectionOwner;
    address public collectionMinter;

    constructor(
        string memory _name,
        string memory _symbol,
        address _owner,
        address _collectionMinter
    ) ERC721(_name, _symbol) {
        collectionOwner = _owner;
        collectionMinter = _collectionMinter;
    }

    using Strings for uint256;

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    function mint(address to, string memory _uri) external {
        require(msg.sender == collectionOwner, "Not a owner!");

        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(to, newItemId);
        _setTokenURI(newItemId, _uri);
    }

    function burn(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Caller is not the owner!");
        super._burn(tokenId);
    }
}

contract ERC721Factory is Ownable {
    address public operator;

    constructor(address _operator) {
        operator = _operator;
    }

    event CollectionCreation(
        address indexed collectionAddress,
        address indexed collector
    );

    mapping(address => address) public collectionRecords;

    function createCollection(
        address collector,
        string memory _name,
        string memory _sybmol
    ) external {
        require(
            collector != address(0),
            "Collector address should not be zero!"
        );
        MintNFT721 collection = new MintNFT721(
            _name,
            _sybmol,
            collector,
            address(this)
        );
        collectionRecords[collector] = address(collection);
        emit CollectionCreation(address(collection), collector);
    }

    function mintUnderCollection(
        address collection,
        address to,
        string memory _uri
    ) external {
        if (
            msg.sender == operator ||
            collectionRecords[msg.sender] == address(collection)
        ) {
            MintNFT721(collection).mint(to, _uri);
        } else {
            revert("Not allowed to mint under this contract!");
        }
    }
}
