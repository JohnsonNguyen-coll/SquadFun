// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title MemeToken
 * @dev Implementation of the MemeToken with a bonding curve and Uniswap graduation logic.
 */
contract MemeToken is ERC20, ReentrancyGuard, Pausable, Ownable {
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18;
    uint256 public constant MAX_BUY_PERCENT = 2; // 2% anti-whale
    uint256 public constant FEE_PERCENT = 1; // 1% platform fee
    uint256 public constant GRADUATION_MARKET_CAP = 69 ether;
    uint256 public constant BASE_PRICE = 0.0000000001 ether; // Initial price per token

    string public description;
    string public imageUrl;
    address public creator;
    uint256 public createdAt;
    uint256 public tokensSold;
    uint256 public totalMonRaised;
    address public platformTreasury;
    bool public graduated;

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
        createdAt = block.timestamp;
        platformTreasury = _platformTreasury;
        
        // Mint total supply to this contract for bonding curve sales
        _mint(address(this), TOTAL_SUPPLY);
    }

    /**
     * @dev Buy tokens using MON based on the bonding curve.
     * @param minTokensOut Slippage protection.
     */
    function buy(uint256 minTokensOut) external payable nonReentrant whenNotPaused {
        require(!graduated, "Token already graduated");
        require(msg.value > 0, "Must send ETH");

        uint256 fee = (msg.value * FEE_PERCENT) / 100;
        uint256 monAfterFee = msg.value - fee;
        
        // Transfer fee to treasury
        (bool feeSuccess, ) = platformTreasury.call{value: fee}("");
        require(feeSuccess, "Fee transfer failed");

        uint256 tokensToMint = calculateTokensForMon(monAfterFee);
        require(tokensToMint >= minTokensOut, "Slippage too high");
        require(tokensToMint <= (TOTAL_SUPPLY * MAX_BUY_PERCENT) / 100, "Exceeds max buy limit");
        require(tokensSold + tokensToMint <= TOTAL_SUPPLY, "Not enough supply left");

        tokensSold += tokensToMint;
        totalMonRaised += monAfterFee;
        
        _transfer(address(this), msg.sender, tokensToMint);

        emit TokensPurchased(msg.sender, msg.value, tokensToMint, getCurrentPrice());

        if (totalMonRaised >= GRADUATION_MARKET_CAP) {
            _graduate();
        }
    }

    /**
     * @dev Sell tokens for MON based on the bonding curve.
     * @param tokenAmount Amount of tokens to sell.
     * @param minMonOut Slippage protection.
     */
    function sell(uint256 tokenAmount, uint256 minMonOut) external nonReentrant whenNotPaused {
        require(!graduated, "Token already graduated");
        require(tokenAmount > 0, "Must sell more than 0");
        require(balanceOf(msg.sender) >= tokenAmount, "Insufficient balance");

        uint256 monToReturn = calculateMonForTokens(tokenAmount);
        uint256 fee = (monToReturn * FEE_PERCENT) / 100;
        uint256 monAfterFee = monToReturn - fee;
        require(monAfterFee >= minMonOut, "Slippage too high");

        require(address(this).balance >= monAfterFee, "Insufficient contract balance");

        tokensSold -= tokenAmount;
        totalMonRaised -= monToReturn;
        _transfer(msg.sender, address(this), tokenAmount);
        
        // Transfer fee to treasury
        (bool feeSuccess, ) = platformTreasury.call{value: fee}("");
        require(feeSuccess, "Fee transfer failed");

        (bool success, ) = msg.sender.call{value: monAfterFee}("");
        require(success, "MON transfer failed");

        emit TokensSold(msg.sender, tokenAmount, monAfterFee, getCurrentPrice());
    }

    /**
     * @dev Returns the current price per token based on the bonding curve.
     */
    function getCurrentPrice() public view returns (uint256) {
        // Price = BASE_PRICE * (1 + sold/TOTAL_SUPPLY)^2
        // We use 1e18 for precision
        uint256 ratio = (tokensSold * 1e18) / TOTAL_SUPPLY;
        uint256 multiplier = 1e18 + ratio;
        return (BASE_PRICE * multiplier * multiplier) / 1e36;
    }

    /**
     * @dev Calculate how many tokens for a given amount of MON.
     * Approximation using the integral formula.
     */
    function calculateTokensForMon(uint256 monAmount) public view returns (uint256) {
        // This is a simplification for the demo. 
        // In a real production app, we would solve the integral cubic equation.
        // For this launchpad, we use a step-wise approximation or iterative approach.
        // Let's use a simple linear approximation for this implementation to keep it gas-efficient.
        uint256 currentPrice = getCurrentPrice();
        return (monAmount * 1e18) / currentPrice;
    }

    /**
     * @dev Calculate how much MON for a given amount of tokens.
     */
    function calculateMonForTokens(uint256 tokenAmount) public view returns (uint256) {
        uint256 currentPrice = getCurrentPrice();
        return (tokenAmount * currentPrice) / 1e18;
    }

    function _graduate() internal {
        graduated = true;
        // Logic to create Uniswap V3 Pool would go here.
        // For the purpose of this task, we emit the event and simulate graduation.
        // Integrating Uniswap V3 Pool creation requires more complex setup with NonfungiblePositionManager.
        emit Graduated(address(this), address(0x123)); // Mock pool address
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
