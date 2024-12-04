import { ethers } from "ethers";

const address = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
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
      {
        internalType: "string",
        name: "_party",
        type: "string",
      },
    ],
    name: "addCandidate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_voterAddress",
        type: "address",
      },
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "_age",
        type: "uint256",
      },
    ],
    name: "addVoter",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "admin",
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
        internalType: "string",
        name: "_name",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "_startDate",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_endDate",
        type: "uint256",
      },
    ],
    name: "createElection",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "election",
    outputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "startDate",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "endDate",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "started",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "finalized",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "endElection",
    outputs: [],
    stateMutability: "nonpayable",
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
            internalType: "string",
            name: "party",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "voteCount",
            type: "uint256",
          },
        ],
        internalType: "struct SingleElectionVoting.Candidate[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getElectionName",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getVoters",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "voterAddress",
            type: "address",
          },
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "age",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "hasVoted",
            type: "bool",
          },
        ],
        internalType: "struct SingleElectionVoting.Voter[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getWinner",
    outputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "party",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "voteCount",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "hasElectionFinalized",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "hasElectionStarted",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "startElection",
    outputs: [],
    stateMutability: "nonpayable",
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
    name: "vote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const provider = new ethers.BrowserProvider(window.ethereum);

// Function to connect to MetaMask
export const connectMetaMask = async () => {
  try {
    await provider.send("eth_requestAccounts", []);
    console.log("MetaMask connected successfully.");
  } catch (error) {
    console.error("Error connecting to MetaMask:", error);
    throw new Error("Failed to connect to MetaMask. Please try again.");
  }
};

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
    const contract = new ethers.Contract(address, abi, provider);
    return contract;
  } catch (error) {
    console.error("Error creating contract instance:", error);
    throw new Error("Could not create contract instance.");
  }
};

// Function to create an election
export const createElection = async (name, startDate, endDate) => {
  try {
    const contract = await getContract();
    const signer = await getSigner();
    const walletAddress = await signer.getAddress();
    const nonce = await provider.getTransactionCount(walletAddress);

    const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
    const endTimestamp = Math.floor(new Date(endDate).getTime() / 1000);

    const tx = await contract.createElection(
      name,
      startTimestamp,
      endTimestamp,
      {
        gasLimit: 1000000, // Optional: Set gas limit
        nonce, // Explicitly set the nonce
      }
    );
    console.log("Transaction sent:", tx.hash);
    await tx.wait();
    console.log("Election created successfully!");
  } catch (error) {
    console.error("Error creating election:", error.message || error);
    throw new Error("Failed to create election.");
  }
};

export const startElection = async () => {
  try {
    const contract = await getContract();
    const signer = await getSigner();
    const walletAddress = await signer.getAddress();
    const nonce = await provider.getTransactionCount(walletAddress);

    // Call the startElection function
    const tx = await contract.startElection({
      gasLimit: 1000000, // Optional: Adjust based on contract requirements
      nonce,
    });

    console.log("Transaction sent to start election:", tx.hash);

    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    console.log("Election started successfully:", receipt);
  } catch (error) {
    console.error("Error starting election:", error.message || error);
    throw new Error(
      "Failed to start the election. Please check the election's start time and other conditions."
    );
  }
};

export const endElection = async () => {
  try {
    const contract = await getContract(); // Get the contract instance

    // Call the endElection function
    const tx = await contract.endElection({
      gasLimit: 1000000, // Optional: Adjust based on contract requirements
    });

    console.log("Transaction sent to end election:", tx.hash);

    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    console.log("Election ended successfully:", receipt);
  } catch (error) {
    console.error("Error ending election:", error.message || error);
    throw new Error(
      "Failed to end the election. Please check the election's end time and other conditions."
    );
  }
};

export const addCandidate = async (candidateAddress, name, party) => {
  try {
    const contract = await getContract();
    const signer = await getSigner();
    const walletAddress = await signer.getAddress();
    const nonce = await provider.getTransactionCount(walletAddress);
    const tx = await contract.addCandidate(candidateAddress, name, party, {
      gasLimit: 1000000,
      nonce,
    });
    console.log("Transaction sent:", tx.hash);
    await tx.wait(); // Wait for the transaction to be mined
    console.log("Candidate added successfully!");
  } catch (error) {
    console.error("Error adding candidate:", error.message || error);
    throw new Error("Failed to add candidate.");
  }
};

export const addVoter = async (voterAddress, name, age) => {
  try {
    const contract = await getContract();
    const signer = await getSigner();
    const walletAddress = await signer.getAddress();
    const nonce = await provider.getTransactionCount(walletAddress);
    const tx = await contract.addVoter(voterAddress, name, age, {
      gasLimit: 1000000,
      nonce,
    });
    console.log("Transaction sent:", tx.hash);
    await tx.wait();
    console.log("Voter added successfully!");
  } catch (error) {
    console.error("Error adding voter:", error.message || error);
    throw new Error("Failed to add voter.");
  }
};

// Function to fetch candidates
export const getCandidates = async () => {
  try {
    const contract = await getContractReadOnly();
    const candidates = await contract.getCandidates();
    console.log("Candidates fetched:", candidates);
    return candidates;
  } catch (error) {
    console.error("Error fetching candidates:", error.message || error);
    throw new Error("Failed to fetch candidates.");
  }
};

export const getVoters = async () => {
  try {
    const contract = await getContractReadOnly();
    const voters = await contract.getVoters();
    console.log("Voters fetched:", voters);
    return voters;
  } catch (error) {
    console.error("Error fetching voters: ", error.message || error);
    throw new Error("Failed to fetch voters.");
  }
};

export const getElectionName = async () => {
  try {
    const contract = await getContractReadOnly();
    const electionName = await contract.getElectionName();
    console.log("Election Name fetched:", electionName);
    return electionName;
  } catch (error) {
    console.error("Error fetching election name:", error.message || error);
    throw new Error("Failed to fetch election name.");
  }
};

export const hasElectionStartedFromContract = async () => {
  try {
    const contract = await getContractReadOnly();
    const hasElectionStarted = await contract.hasElectionStarted();
    return hasElectionStarted;
  } catch (error) {
    console.error("Error fetching election status:", error.message || error);
    throw new Error("Failed to fetch election status.");
  }
};

export const hasElectionFinalizedFromContract = async () => {
  try {
    const contract = await getContractReadOnly();
    const hasElectionFinalized = await contract.hasElectionFinalized();
    return hasElectionFinalized;
  } catch (error) {
    console.error(
      "Error fetching election finalized status:",
      error.message || error
    );
    throw new Error("Failed to fetch election finalized status.");
  }
};

// Function to vote for a candidate
export const voteForCandidate = async (candidateAddress) => {
  try {
    const contract = await getContract();
    const signer = await getSigner();
    const walletAddress = await signer.getAddress();
    const nonce = await provider.getTransactionCount(walletAddress);

    const tx = await contract.vote(candidateAddress, {
      gasLimit: 1000000,
      nonce,
    });
    console.log("Vote transaction sent:", tx.hash);
    await tx.wait();
    console.log("Vote successfully cast!");
  } catch (error) {
    console.error("Error voting:", error.message || error);
    throw new Error("Failed to cast vote.");
  }
};

// Function to fetch the winner
export const getWinner = async () => {
  try {
    const contract = await getContractReadOnly();
    const winner = await contract.getWinner();
    console.log("Election winner:", winner);
    return winner;
  } catch (error) {
    console.error("Error fetching winner:", error.message || error);
    throw new Error("Failed to fetch winner.");
  }
};
