const { ethers, network } = require("hardhat");
const fs = require("fs/promises");
const DECIMALS = "8";
const INITIAL_PRICE = "200000000000"; // 2000

async function main() {
  //1. Get the signer/deployer
  const accounts = await ethers.getSigners();
  const deployer = accounts[0];

  //2. Get Contract Factory For MockV3Aggregator
  const mockPriceFeedFactory = await ethers.getContractFactory(
    "MockV3Aggregator"
  );

  //3. Deploy MockV3Aggregator with help of Deployer to get priceFeed
  const mockPriceFeed = await mockPriceFeedFactory
    .connect(deployer)
    .deploy(DECIMALS, INITIAL_PRICE);

  //4. Wait for deployment of priceFeed
  await mockPriceFeed.waitForDeployment();

  console.log(
    "MockV3Aggregator deployed to:",
    await mockPriceFeed.getAddress()
  );

  //5. Get Contract Factory for FundMe
  const fundMeFactory = await ethers.getContractFactory("FundMe");

  //6. Deploy the fund me with deployer and priceFeed's address
  const fundMe = await fundMeFactory
    .connect(deployer)
    .deploy(await mockPriceFeed.getAddress());

  //7. Wait for deployment of fundme
  await fundMe.waitForDeployment();

  console.log("FundMe contract deployed to:", await fundMe.getAddress());

  //At Last: Save deployment information abi interfaces and address to FundMe.json
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
