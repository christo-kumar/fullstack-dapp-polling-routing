const { ethers } = require("hardhat");
const fs = require("fs/promises");

async function main() {
  // Deploy the FundMe contract
  const fundMeContract = await ethers.deployContract("FundMe");

  // Retrieve the FundMe contract's artifact
  const artifact = await hre.artifacts.readArtifact("FundMe");

  // Write the deployment info to a JSON file
  await writeDeploymentInfo(fundMeContract, artifact, "FundMe.json");

  console.log("FundMe contract deployed to:", fundMeContract.target);
}

async function writeDeploymentInfo(contract, artifact, filename = "") {
  const data = {
    contract: {
      address: contract.target,
      signerAddress: contract.runner.address,
      abi: artifact.abi,
    },
  };

  const content = JSON.stringify(data, null, 2);
  await fs.writeFile(filename, content, { encoding: "utf-8" });
}

main().catch((error) => {
  console.error("Error during deployment:", error);
  process.exitCode = 1;
});
