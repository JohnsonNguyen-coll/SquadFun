const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Use deployer address as platform treasury for demo purposes
  const platformTreasury = deployer.address;

  const MemeFactory = await hre.ethers.getContractFactory("MemeFactory");
  const factory = await MemeFactory.deploy(platformTreasury);

  await factory.waitForDeployment();

  console.log("MemeFactory deployed to:", await factory.getAddress());
  console.log("Platform Treasury set to:", platformTreasury);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
