// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./MemeToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MemeFactory
 * @dev Factory contract to create new MemeTokens.
 */
contract MemeFactory is Ownable {
    uint256 public creationFee = 0.001 ether;
    address public platformTreasury;
    address[] public allTokens;

    event TokenCreated(
        address indexed tokenAddress,
        string name,
        string symbol,
        string description,
        string imageUrl,
        address creator
    );

    constructor(address _platformTreasury) Ownable(msg.sender) {
        platformTreasury = _platformTreasury;
    }

    /**
     * @dev Create a new MemeToken.
     * @param name Name of the token.
     * @param symbol Symbol of the token.
     * @param description Description of the project.
     * @param imageUrl URL for the token image.
     */
    function createToken(
        string memory name,
        string memory symbol,
        string memory description,
        string memory imageUrl
    ) external payable returns (address) {
        require(msg.value >= creationFee, "Insufficient creation fee");

        // Transfer ONLY creation fee to treasury
        (bool success, ) = platformTreasury.call{value: creationFee}("");
        require(success, "Fee transfer failed");

        MemeToken newToken = new MemeToken(
            name,
            symbol,
            description,
            imageUrl,
            msg.sender,
            platformTreasury
        );

        allTokens.push(address(newToken));

        // Initial Buy logic: If dev sends more than creation fee, buy tokens for them
        uint256 buyAmount = msg.value - creationFee;
        if (buyAmount > 0) {
            newToken.buy{value: buyAmount}(0);
            // Transfer bought tokens from Factory to the actual creator
            uint256 boughtAmount = newToken.balanceOf(address(this));
            newToken.transfer(msg.sender, boughtAmount);
        }

        emit TokenCreated(
            address(newToken),
            name,
            symbol,
            description,
            imageUrl,
            msg.sender
        );

        return address(newToken);
    }

    /**
     * @dev Set a new creation fee.
     */
    function setCreationFee(uint256 _newFee) external onlyOwner {
        creationFee = _newFee;
    }

    /**
     * @dev Set a new treasury address.
     */
    function setPlatformTreasury(address _newTreasury) external onlyOwner {
        platformTreasury = _newTreasury;
    }

    /**
     * @dev Returns the total number of tokens created.
     */
    function getTokenCount() external view returns (uint256) {
        return allTokens.length;
    }
}
