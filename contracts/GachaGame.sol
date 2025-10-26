// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract GachaGame is ERC721, Ownable {
    using Strings for uint256;

    // Rarity tiers
    enum Rarity { COMMON, RARE, EPIC, LEGENDARY }

    // Character struct
    struct Character {
        uint256 id;
        Rarity rarity;
        uint256 power;
        string name;
        uint256 rolledAt;
    }

    // State variables
    uint256 private _tokenIdCounter;
    uint256 public rollPrice = 0.01 ether;

    // Mappings
    mapping(uint256 => Character) public characters;
    mapping(address => uint256[]) public userCharacters;

    // Rarity probabilities (out of 10000 for precision)
    uint256 public constant LEGENDARY_CHANCE = 100;    // 1%
    uint256 public constant EPIC_CHANCE = 500;         // 5%
    uint256 public constant RARE_CHANCE = 2000;        // 20%
    // COMMON_CHANCE = 7400 (74%)

    // Events
    event CharacterRolled(address indexed player, uint256 tokenId, Rarity rarity, uint256 power, string name);
    event RollPriceUpdated(uint256 newPrice);

    constructor() ERC721("GachaCharacter", "GACHA") Ownable(msg.sender) {
        _tokenIdCounter = 1;
    }

    // Roll a character
    function roll() external payable returns (uint256) {
        require(msg.value >= rollPrice, "Insufficient payment");

        uint256 tokenId = _tokenIdCounter++;
        _safeMint(msg.sender, tokenId);

        // Generate pseudo-random rarity
        Rarity rarity = _determineRarity(tokenId);

        // Generate power based on rarity
        uint256 power = _generatePower(rarity, tokenId);

        // Generate name
        string memory name = _generateName(rarity, tokenId);

        // Create character
        Character memory newCharacter = Character({
            id: tokenId,
            rarity: rarity,
            power: power,
            name: name,
            rolledAt: block.timestamp
        });

        characters[tokenId] = newCharacter;
        userCharacters[msg.sender].push(tokenId);

        emit CharacterRolled(msg.sender, tokenId, rarity, power, name);

        return tokenId;
    }

    // Determine rarity based on pseudo-random number
    function _determineRarity(uint256 seed) private view returns (Rarity) {
        uint256 random = _getRandomNumber(seed) % 10000;

        if (random < LEGENDARY_CHANCE) {
            return Rarity.LEGENDARY;
        } else if (random < LEGENDARY_CHANCE + EPIC_CHANCE) {
            return Rarity.EPIC;
        } else if (random < LEGENDARY_CHANCE + EPIC_CHANCE + RARE_CHANCE) {
            return Rarity.RARE;
        } else {
            return Rarity.COMMON;
        }
    }

    // Generate power based on rarity
    function _generatePower(Rarity rarity, uint256 seed) private view returns (uint256) {
        uint256 baseRandom = _getRandomNumber(seed + 1);

        if (rarity == Rarity.LEGENDARY) {
            return 800 + (baseRandom % 201); // 800-1000
        } else if (rarity == Rarity.EPIC) {
            return 500 + (baseRandom % 301); // 500-800
        } else if (rarity == Rarity.RARE) {
            return 200 + (baseRandom % 301); // 200-500
        } else {
            return 50 + (baseRandom % 151);  // 50-200
        }
    }

    // Generate character name
    function _generateName(Rarity rarity, uint256 seed) private view returns (string memory) {
        string[4] memory prefixes = ["Shadow", "Fire", "Ice", "Thunder"];
        string[4] memory suffixes = ["Warrior", "Mage", "Assassin", "Knight"];

        uint256 prefixIndex = _getRandomNumber(seed + 2) % 4;
        uint256 suffixIndex = _getRandomNumber(seed + 3) % 4;

        string memory rarityPrefix = "";
        if (rarity == Rarity.LEGENDARY) {
            rarityPrefix = "Legendary ";
        } else if (rarity == Rarity.EPIC) {
            rarityPrefix = "Epic ";
        } else if (rarity == Rarity.RARE) {
            rarityPrefix = "Rare ";
        }

        return string(abi.encodePacked(
            rarityPrefix,
            prefixes[prefixIndex],
            " ",
            suffixes[suffixIndex]
        ));
    }

    // Pseudo-random number generator (NOT secure for production)
    function _getRandomNumber(uint256 seed) private view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            seed,
            _tokenIdCounter
        )));
    }

    // Get user's characters
    function getUserCharacters(address user) external view returns (uint256[] memory) {
        return userCharacters[user];
    }

    // Get character details
    function getCharacter(uint256 tokenId) external view returns (Character memory) {
        require(_ownerOf(tokenId) != address(0), "Character does not exist");
        return characters[tokenId];
    }

    // Get rarity name
    function getRarityName(Rarity rarity) public pure returns (string memory) {
        if (rarity == Rarity.LEGENDARY) return "LEGENDARY";
        if (rarity == Rarity.EPIC) return "EPIC";
        if (rarity == Rarity.RARE) return "RARE";
        return "COMMON";
    }

    // Update roll price (only owner)
    function setRollPrice(uint256 newPrice) external onlyOwner {
        rollPrice = newPrice;
        emit RollPriceUpdated(newPrice);
    }

    // Withdraw contract balance (only owner)
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }

    // Get total characters minted
    function getTotalCharacters() external view returns (uint256) {
        return _tokenIdCounter - 1;
    }

    // Override tokenURI to return metadata
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");

        Character memory character = characters[tokenId];

        // In production, this would return actual metadata URI
        // For now, return a simple JSON-like string
        return string(abi.encodePacked(
            "data:application/json;base64,",
            _encodeMetadata(character)
        ));
    }

    function _encodeMetadata(Character memory character) private pure returns (string memory) {
        // Simplified metadata - in production you'd use proper base64 encoding
        return string(abi.encodePacked(
            '{"name":"',
            character.name,
            '","rarity":"',
            getRarityName(character.rarity),
            '","power":"',
            character.power.toString(),
            '"}'
        ));
    }
}
