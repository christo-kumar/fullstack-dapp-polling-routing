const { ethers } = require("hardhat");
const fs = require("fs/promises");

async function main() {
  const helloContract = await ethers.deployContract("SingleElectionVoting");

  const artifact = await hre.artifacts.readArtifact("SingleElectionVoting");

  await writeDeploymentInfo(
    helloContract,
    artifact,
    "SingleElectionVoting.json"
  );
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
