// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title MemeToken
 * @dev Implementation of the MemeToken with a bonding curve based on Pump.fun (x * y = k)
 * Target: 6,900,000 MON to graduate 700M tokens
 */
contract MemeToken is ERC20, ReentrancyGuard, Pausable, Ownable {
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18;
    uint256 public constant MAX_BONDING_SUPPLY = 700_000_000 * 10**18;
    uint256 public constant GRADUATION_TARGET = 6900000 ether;
    
    // Virtual Reserves for 6,900,000 MON target raise
    uint256 public virtualMonReserve = 2957143 ether;
    uint256 public virtualTokenReserve = 1000000000 * 10**18;
    
    // We calculate K dynamically to avoid constant overflow issues in some compilers, 
    // but we'll use a local K in functions.

    uint256 public tokensSold;
    uint256 public reserveMon;
    bool public isGraduated;

    string public description;
    string public imageUrl;
    address public creator;
    address public platformTreasury;
    uint256 public createdAt;

    event TokensPurchased(address indexed buyer, uint256 monIn, uint256 tokensOut, uint256 newPrice);
    event TokensSold(address indexed seller, uint256 tokensIn, uint256 monOut, uint256 newPrice);
    event Graduated(address indexed tokenAddress, address uniswapPool);

    constructor(
        string memory name,
        string memory symbol,
        string memory _description,
        string memory _imageUrl,
        address _creator,
        address _platformTreasury
    ) ERC20(name, symbol) Ownable(_creator) {
        description = _description;
        imageUrl = _imageUrl;
        creator = _creator;
        platformTreasury = _platformTreasury;
        createdAt = block.timestamp;
        
        _mint(address(this), TOTAL_SUPPLY);
    }

    function buy(uint256 minTokensOut) external payable nonReentrant {
        require(!isGraduated, "Token already graduated");
        require(msg.value > 0, "Must send MON");

        uint256 fee = (msg.value * 1) / 100; // 1% fee
        uint256 monAfterFee = msg.value - fee;
        
        // Transfer fee
        (bool feeSuccess, ) = platformTreasury.call{value: fee}("");
        require(feeSuccess, "Fee transfer failed");

        // x * y = k logic
        uint256 k = virtualMonReserve * virtualTokenReserve;
        uint256 newVirtualMonReserve = virtualMonReserve + monAfterFee;
        uint256 newVirtualTokenReserve = k / newVirtualMonReserve;
        uint256 tokensToEmit = virtualTokenReserve - newVirtualTokenReserve;

        require(tokensToEmit > 0, "Amount too small");
        
        // Check bonding curve limit
        if (tokensSold + tokensToEmit > MAX_BONDING_SUPPLY) {
            tokensToEmit = MAX_BONDING_SUPPLY - tokensSold;
        }

        require(tokensToEmit >= minTokensOut, "Slippage too high");

        tokensSold += tokensToEmit;
        reserveMon += monAfterFee;
        virtualMonReserve = newVirtualMonReserve;
        virtualTokenReserve = newVirtualTokenReserve;

        _transfer(address(this), msg.sender, tokensToEmit);

        emit TokensPurchased(msg.sender, monAfterFee, tokensToEmit, getCurrentPrice());

        if (tokensSold >= MAX_BONDING_SUPPLY || reserveMon >= GRADUATION_TARGET) {
            graduate();
        }
    }

    function sell(uint256 tokenAmount, uint256 minMonOut) external nonReentrant {
        require(!isGraduated, "Token already graduated");
        require(tokenAmount > 0, "Must sell tokens");
        require(balanceOf(msg.sender) >= tokenAmount, "Insufficient balance");

        // x * y = k logic
        uint256 k = virtualMonReserve * virtualTokenReserve;
        uint256 newVirtualTokenReserve = virtualTokenReserve + tokenAmount;
        uint256 newVirtualMonReserve = k / newVirtualTokenReserve;
        uint256 monToReturn = virtualMonReserve - newVirtualMonReserve;

        uint256 fee = (monToReturn * 1) / 100;
        uint256 monAfterFee = monToReturn - fee;

        require(monAfterFee >= minMonOut, "Slippage too high");

        virtualTokenReserve = newVirtualTokenReserve;
        virtualMonReserve = newVirtualMonReserve;
        tokensSold -= tokenAmount;
        reserveMon -= monToReturn;

        _transfer(msg.sender, address(this), tokenAmount);
        
        // Transfer fee
        (bool feeSuccess, ) = platformTreasury.call{value: fee}("");
        require(feeSuccess, "Fee transfer failed");

        // Return MON
        (bool success, ) = msg.sender.call{value: monAfterFee}("");
        require(success, "MON transfer failed");

        emit TokensSold(msg.sender, tokenAmount, monAfterFee, getCurrentPrice());
    }

    function getCurrentPrice() public view returns (uint256) {
        // Price = (virtualMonReserve * 1e18) / virtualTokenReserve
        // virtualMonReserve is in wei (10^18), virtualTokenReserve is in 10^18.
        // Result is in wei per token.
        return (virtualMonReserve * 1e18) / virtualTokenReserve;
    }

    function graduate() internal {
        isGraduated = true;
        emit Graduated(address(this), address(0));
    }
}
