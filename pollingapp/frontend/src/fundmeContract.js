import { ethers } from "ethers";

const address = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
const abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_priceFeedAddress",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "candidate",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "ethAmount",
        type: "uint256",
      },
    ],
    name: "CandidateFunded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "ethUsdPrice",
        type: "uint256",
      },
    ],
    name: "PriceUpdated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "candidateAddresses",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "candidates",
    outputs: [
      {
        internalType: "address",
        name: "candidateAddress",
        type: "address",
      },
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "fundingAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "dollarAmount",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "ethUsdPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_candidateAddress",
        type: "address",
      },
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
    ],
    name: "fundCandidate",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "getCandidates",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "candidateAddress",
            type: "address",
          },
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "fundingAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "dollarAmount",
            type: "uint256",
          },
        ],
        internalType: "struct FundMe.Candidate[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_candidateAddress",
        type: "address",
      },
    ],
    name: "getFundingForCandidate",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "updatePrice",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "withdrawFunds",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const provider = new ethers.BrowserProvider(window.ethereum);
const rpcProvider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

// Function to get the signer asynchronously
export const getSigner = async () => {
  try {
    const signer = await provider.getSigner();
    console.log("*** Signer fetched successfully: ***", signer);
    return signer;
  } catch (error) {
    console.error("Error fetching signer:", error);
    throw new Error(
      "Could not fetch signer. Please check MetaMask connection."
    );
  }
};

// Function to get the contract instance
export const getContract = async () => {
  try {
    const signer = await getSigner();
    const contract = new ethers.Contract(address, abi, signer);
    return contract;
  } catch (error) {
    console.error("Error creating contract instance:", error);
    throw new Error("Could not create contract instance.");
  }
};

// Function to get contract instance for reading
export const getContractReadOnly = async () => {
  try {
    const contract = new ethers.Contract(address, abi, rpcProvider);
    return contract;
  } catch (error) {
    console.error("Error creating contract instance:", error);
    throw new Error("Could not create contract instance.");
  }
};

export const getFundedCandidates = async () => {
  try {
    const contract = await getContractReadOnly();
    const candidates = await contract.getCandidates();
    return candidates.map((candidate) => ({
      candidateAddress: candidate.candidateAddress,
      name: candidate.name,
      fundingAmount: ethers.formatEther(candidate.fundingAmount), // Convert from wei to ETH
      dollarAmount: candidate.dollarAmount,
    }));
  } catch (error) {
    console.error("Error fetching candidates:", error.message);
    throw new Error("Failed to fetch candidates.");
  }
};

export const getFundingForCandidate = async (candidateAddress) => {
  try {
    const contract = await getContractReadOnly();
    const fundingAmount = await contract.getFundingForCandidate(
      candidateAddress
    );
    return ethers.formatEther(fundingAmount); // Convert from wei to ETH
  } catch (error) {
    console.error("Error fetching funding amount:", error.message);
    throw new Error("Failed to fetch funding amount.");
  }
};

export const fundCandidate = async (
  candidateAddress,
  candiateName,
  ethAmount
) => {
  try {
    const contract = await getContract();
    const signer = await getSigner();
    const walletAddress = await signer.getAddress();
    const nonce = await rpcProvider.getTransactionCount(
      walletAddress,
      "latest"
    );
    const gasLimit = 1000000;

    const value = ethers.parseEther(ethAmount);
    const tx = await contract.fundCandidate(candidateAddress, candiateName, {
      value,
      gasLimit,
      nonce,
    });
    await tx.wait(); // Wait for the transaction to be mined
    console.log("Transaction successful:", tx);
  } catch (error) {
    console.error("Error funding candidate:", error.message);
    throw new Error("Failed to fund the candidate. Please try again.");
  }
};

// Function to update the price using the updatePrice() function
export const updatePrice = async () => {
  try {
    const contract = await getContract();
    const signer = await getSigner();
    const walletAddress = await signer.getAddress();
    const nonce = await rpcProvider.getTransactionCount(
      walletAddress,
      "latest"
    );
    const gasLimit = 2000000;
    const tx = await contract.updatePrice({ gasLimit, nonce }); // Call the updatePrice function
    console.log("Price update transaction sent:", tx.hash);
    await tx.wait(); // Wait for the transaction to be mined
    console.log("Price updated successfully.");
  } catch (error) {
    console.error("Error updating price:", error.message);
    throw new Error("Failed to update the price. Please try again.");
  }
};

export const listenToPriceUpdates = async (onPriceUpdated) => {
  try {
    const contract = await getContractReadOnly();
    contract.on("PriceUpdated", (ethUsdPrice) => {
      console.log("PriceUpdated event received:", ethUsdPrice);
      if (onPriceUpdated) onPriceUpdated(ethUsdPrice); // Trigger the callback with the new price
    });

    /*contract.on("PriceUpdateFailed", (reason) => {
      console.error("Price update failed:", reason);
    });*/
  } catch (error) {
    console.error("Error listening to events:", error.message);
    throw new Error("Failed to listen to events.");
  }
};
