import React, { useEffect, useState } from "react";
import { getCandidates } from "../contract";
import {
  fundCandidate,
  getFundedCandidates,
  updatePrice,
  listenToPriceUpdates,
} from "../fundmeContract";

const FundmePanel = () => {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [ethAmount, setEthAmount] = useState("");
  const [fundedCandidates, setFundedCandidates] = useState([]);
  const [ethToUsdPrice, setEthToUsdPrice] = useState(""); // For storing the latest ETH-to-USD price

  // Fetch candidates for the dropdown
  useEffect(() => {
    const fetchCandidatesForDropdown = async () => {
      try {
        const candidatesList = await getCandidates(); // Fetch from contract.js
        setCandidates(candidatesList);
      } catch (error) {
        console.error("Error fetching candidates:", error.message);
        alert("Error fetching candidates.");
      }
    };

    fetchCandidatesForDropdown();
  }, []);

  // Fetch funded candidates
  useEffect(() => {
    const fetchFundedCandidates = async () => {
      try {
        const fundedCandidatesList = await getFundedCandidates(); // Fetch directly from fundmeContract.js
        setFundedCandidates(fundedCandidatesList);
      } catch (error) {
        console.error("Error fetching funded candidates:", error.message);
      }
    };

    fetchFundedCandidates();
  }, []); // Fetch once on component mount

  // Listen to price updates
  useEffect(() => {
    const startListeningToPriceUpdates = async () => {
      try {
        await listenToPriceUpdates((newPrice) => {
          setEthToUsdPrice(newPrice); // Update the ETH-to-USD price when PriceUpdated event is triggered
        });
      } catch (error) {
        console.error("Error listening to price updates:", error.message);
      }
    };

    startListeningToPriceUpdates();
  }, []);

  // Handle funding a candidate
  const handleFundMe = async () => {
    if (!selectedCandidate || !ethAmount) {
      alert("Please select a candidate and enter an ETH amount.");
      return;
    }

    try {
      const selectedCandidateData = candidates.find(
        (candidate) => candidate.candidateAddress === selectedCandidate
      );
      await fundCandidate(
        selectedCandidate,
        selectedCandidateData.name,
        ethAmount
      ); // Fund the candidate
      alert(`Successfully funded ${ethAmount} ETH to the candidate.`);

      // Refetch funded candidates list after funding
      const updatedFundedCandidates = await getFundedCandidates();
      setFundedCandidates(updatedFundedCandidates);

      setEthAmount(""); // Reset input
    } catch (error) {
      console.error("Error funding candidate:", error.message);
      alert("Error while funding the candidate. Please try again.");
    }
  };

  // Handle price update
  const handleUpdatePrice = async () => {
    try {
      await updatePrice(); // Call updatePrice from the contract
      alert("Price update initiated. Please wait for confirmation.");
    } catch (error) {
      console.error("Error updating price:", error.message);
      alert("Failed to update the price. Please try again.");
    }
  };

  return (
    <div>
      <h1>Fund Me Panel</h1>
      <div>
        <label htmlFor="candidate-select">Select a Candidate:</label>
        <select
          id="candidate-select"
          onChange={(e) => setSelectedCandidate(e.target.value)}
        >
          <option value="">Select a Candidate</option>
          {candidates.map((candidate) => (
            <option
              key={candidate.candidateAddress}
              value={candidate.candidateAddress}
            >
              {candidate.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="eth-amount">Enter ETH Amount:</label>
        <input
          id="eth-amount"
          type="number"
          value={ethAmount}
          onChange={(e) => setEthAmount(e.target.value)}
          placeholder="0.1"
        />
      </div>
      <button onClick={handleFundMe}>Fund Me</button>

      <div>
        <h2>ETH to USD Price</h2>
        <p>
          {ethToUsdPrice
            ? `$1 ETH = ${ethToUsdPrice} USD`
            : "Price not available"}
        </p>
        <button onClick={handleUpdatePrice}>Update Price</button>
      </div>

      <h2>Funded Candidates</h2>
      <ul>
        {fundedCandidates.map((candidate) => (
          <li key={candidate.candidateAddress}>
            {candidate.name}: {candidate.fundingAmount} ETH ( $
            {candidate.dollarAmount})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FundmePanel;
