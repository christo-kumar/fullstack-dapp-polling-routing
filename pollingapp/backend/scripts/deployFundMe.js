const { ethers, network } = require("hardhat");
const fs = require("fs/promises");
const DECIMALS = "8";
const INITIAL_PRICE = "200000000000"; // 2000

async function main() {
  // Deploy the MockV3Aggregator
  const accounts = await ethers.getSigners();
  const deployer = accounts[0];

  const mockPriceFeedFactory = await ethers.getContractFactory(
    "MockV3Aggregator"
  );

  // Deploy MockV3Aggregator
  const mockPriceFeed = await mockPriceFeedFactory
    .connect(deployer)
    .deploy(DECIMALS, INITIAL_PRICE);

  // Wait for deployment
  await mockPriceFeed.waitForDeployment();

  console.log(
    "MockV3Aggregator deployed to:",
    await mockPriceFeed.getAddress()
  );

  // Deploy the FundMe contract with the mock price feed address
  const fundMeFactory = await ethers.getContractFactory("FundMe");
  const fundMe = await fundMeFactory
    .connect(deployer)
    .deploy(await mockPriceFeed.getAddress());

  // Wait for deployment
  await fundMe.waitForDeployment();

  console.log("FundMe contract deployed to:", await fundMe.getAddress());

  // Save deployment information
  await writeDeploymentInfo(mockPriceFeed, fundMe);
}

async function writeDeploymentInfo(mockPriceFeed, fundMe) {
  const deploymentInfo = {
    MockV3Aggregator: {
      address: await mockPriceFeed.getAddress(),
    },
    FundMe: {
      address: await fundMe.getAddress(),
      abi: (await hre.artifacts.readArtifact("FundMe")).abi,
    },
  };

  const content = JSON.stringify(deploymentInfo, null, 2);
  await fs.writeFile("FundMe.json", content, { encoding: "utf-8" });
  console.log("Deployment information saved to FundMe.json");
}

main().catch((error) => {
  console.error("Error during deployment:", error);
  process.exitCode = 1;
});
