import { expect } from "chai";
import hre from "hardhat";

describe("MemeLaunchpad", function () {
  let factory, token;
  let owner, creator, buyer, treasury;
  let ethers;
  let CREATION_FEE;

  before(async function () {
    const connected = await hre.network.getOrCreate();
    ethers = connected.ethers;
    CREATION_FEE = ethers.parseEther("0.001");
  });

  beforeEach(async function () {
    [owner, creator, buyer, treasury] = await ethers.getSigners();

    const MemeFactory = await ethers.getContractFactory("MemeFactory");
    factory = await MemeFactory.deploy(treasury.address);
    await factory.waitForDeployment();
  });

  describe("Factory", function () {
    it("Should set the correct treasury", async function () {
      expect(await factory.platformTreasury()).to.equal(treasury.address);
    });

    it("Should create a new token and charge fee", async function () {
      const initialTreasuryBalance = await ethers.provider.getBalance(treasury.address);

      const tx = await factory.connect(creator).createToken(
        "Meme Coin",
        "MEME",
        "The best meme coin",
        "https://example.com/image.png",
        { value: CREATION_FEE }
      );
      
      await expect(tx).to.emit(factory, "TokenCreated");

      const finalTreasuryBalance = await ethers.provider.getBalance(treasury.address);
      expect(finalTreasuryBalance - initialTreasuryBalance).to.equal(CREATION_FEE);
      
      expect(await factory.getTokenCount()).to.equal(1);
    });
  });

  describe("MemeToken", function () {
    beforeEach(async function () {
      const tx = await factory.connect(creator).createToken(
        "Meme Coin",
        "MEME",
        "The best meme coin",
        "https://example.com/image.png",
        { value: CREATION_FEE }
      );
      const receipt = await tx.wait();
      
      // In Hardhat 3/ethers v6, event parsing is slightly different
      const event = receipt.logs.find(log => {
        try {
          return factory.interface.parseLog(log).name === "TokenCreated";
        } catch (e) {
          return false;
        }
      });
      
      const tokenAddress = factory.interface.parseLog(event).args.tokenAddress;
      token = await ethers.getContractAt("MemeToken", tokenAddress);
    });

    it("Should have correct metadata", async function () {
      expect(await token.name()).to.equal("Meme Coin");
      expect(await token.symbol()).to.equal("MEME");
      expect(await token.description()).to.equal("The best meme coin");
      expect(await token.creator()).to.equal(creator.address);
    });

    it("Should allow buying tokens", async function () {
      const buyAmount = ethers.parseEther("0.001");
      const initialTreasuryBalance = await ethers.provider.getBalance(treasury.address);

      await expect(token.connect(buyer).buy(0, { value: buyAmount }))
        .to.emit(token, "TokensPurchased");

      const finalTreasuryBalance = await ethers.provider.getBalance(treasury.address);
      const expectedFee = buyAmount / 100n;
      expect(finalTreasuryBalance - initialTreasuryBalance).to.equal(expectedFee);

      const buyerBalance = await token.balanceOf(buyer.address);
      expect(buyerBalance).to.be.gt(0);
      expect(await token.tokensSold()).to.equal(buyerBalance);
    });

    it("Should allow selling tokens", async function () {
      const buyAmount = ethers.parseEther("0.001");
      await token.connect(buyer).buy(0, { value: buyAmount });
      
      const tokensToSell = (await token.balanceOf(buyer.address)) / 2n;
      const initialBuyerEth = await ethers.provider.getBalance(buyer.address);

      await expect(token.connect(buyer).sell(tokensToSell, 0))
        .to.emit(token, "TokensSold");

      const finalBuyerEth = await ethers.provider.getBalance(buyer.address);
      expect(finalBuyerEth).to.be.gt(initialBuyerEth);
      expect(await token.balanceOf(buyer.address)).to.be.gt(0);
    });
  });
});
