import React, { useEffect, useState } from "react";
import { getCandidates } from "../contract";
import { fundCandidate, getFundingForCandidate } from "../fundmeContract";

const FundmePanel = () => {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [ethAmount, setEthAmount] = useState("");
  const [fundingData, setFundingData] = useState({}); // For storing funding details

  // Fetch the list of candidates from the main contract
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const candidatesList = await getCandidates();
        if (Array.isArray(candidatesList) && candidatesList.length === 0) {
          console.warn("No candidates found.");
        } else {
          setCandidates(candidatesList);
        }
      } catch (error) {
        console.error("Error fetching candidates:", error.message);
        alert("Error fetching candidates.");
      }
    };

    fetchCandidates();
  }, []);

  // Fetch funding details for candidates
  useEffect(() => {
    const fetchFundingDetails = async () => {
      try {
        const fundingDetails = {};
        for (const candidate of candidates) {
          const funding = await getFundingForCandidate(
            candidate.candidateAddress
          );
          fundingDetails[candidate.candidateAddress] = funding;
        }
        setFundingData(fundingDetails);
      } catch (error) {
        console.error("Error fetching funding details:", error.message);
      }
    };

    if (candidates.length > 0) {
      fetchFundingDetails();
    }
  }, [candidates]);

  const handleFundMe = async () => {
    if (!selectedCandidate || !ethAmount) {
      alert("Please select a candidate and enter an ETH amount.");
      return;
    }

    try {
      // Fund the candidate and let the smart contract handle addition if needed
      await fundCandidate(selectedCandidate, ethAmount);
      alert(`Successfully funded ${ethAmount} ETH to the candidate.`);

      // Update funding data
      const updatedFunding = await getFundingForCandidate(selectedCandidate);
      setFundingData((prevData) => ({
        ...prevData,
        [selectedCandidate]: updatedFunding,
      }));

      setEthAmount(""); // Reset input field
    } catch (error) {
      console.error("Error funding candidate:", error.message);
      alert("Error while funding the candidate. Please try again.");
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

      <h2>Funding Details</h2>
      <ul>
        {candidates.map((candidate) => (
          <li key={candidate.candidateAddress}>
            {candidate.name}: {fundingData[candidate.candidateAddress] || "0"}{" "}
            ETH
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FundmePanel;
