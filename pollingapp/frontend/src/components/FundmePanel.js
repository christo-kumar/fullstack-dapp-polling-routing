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
  const [ethToUsdPrice, setEthToUsdPrice] = useState("");

  useEffect(() => {
    const fetchCandidatesForDropdown = async () => {
      try {
        const candidatesList = await getCandidates();
        setCandidates(candidatesList);
      } catch (error) {
        console.error("Error fetching candidates:", error.message);
        alert("Error fetching candidates.");
      }
    };

    fetchCandidatesForDropdown();
  }, []);

  useEffect(() => {
    const fetchFundedCandidates = async () => {
      try {
        const fundedCandidatesList = await getFundedCandidates();
        setFundedCandidates(fundedCandidatesList);
      } catch (error) {
        console.error("Error fetching funded candidates:", error.message);
      }
    };

    fetchFundedCandidates();
  }, []);

  useEffect(() => {
    const startListeningToPriceUpdates = async () => {
      try {
        await listenToPriceUpdates((newPrice) => {
          setEthToUsdPrice(newPrice);
        });
      } catch (error) {
        console.error("Error listening to price updates:", error.message);
      }
    };

    startListeningToPriceUpdates();
  }, []);

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
      );
      alert(`Successfully funded ${ethAmount} ETH to the candidate.`);

      const updatedFundedCandidates = await getFundedCandidates();
      setFundedCandidates(updatedFundedCandidates);

      setEthAmount("");
    } catch (error) {
      console.error("Error funding candidate:", error.message);
      alert("Error while funding the candidate. Please try again.");
    }
  };

  const handleUpdatePrice = async () => {
    try {
      await updatePrice();
      alert("Price update initiated. Please wait for confirmation.");
    } catch (error) {
      console.error("Error updating price:", error.message);
      alert("Failed to update the price. Please try again.");
    }
  };

  return (
    <div style={styles.panelContainer}>
      <h1 style={styles.title}>Fund Me Panel</h1>

      <div style={styles.section}>
        <label htmlFor="candidate-select" style={styles.label}>
          Select a Candidate:
        </label>
        <select
          id="candidate-select"
          style={styles.select}
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

      <div style={styles.section}>
        <label htmlFor="eth-amount" style={styles.label}>
          Enter ETH Amount:
        </label>
        <input
          id="eth-amount"
          type="number"
          value={ethAmount}
          onChange={(e) => setEthAmount(e.target.value)}
          placeholder="0.1"
          style={styles.input}
        />
      </div>
      <button style={styles.button} onClick={handleFundMe}>
        Fund Me
      </button>

      <div style={styles.section}>
        <h2 style={styles.subtitle}>ETH to USD Price</h2>
        <p style={styles.price}>
          {ethToUsdPrice
            ? `$1 ETH = ${(Number(ethToUsdPrice) / 1e18).toLocaleString(
                "en-US",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )} USD`
            : "Price not available"}
        </p>
        <button style={styles.button} onClick={handleUpdatePrice}>
          Update Price
        </button>
      </div>

      <h2 style={styles.subtitle}>Funded Candidates</h2>
      <ul style={styles.list}>
        {fundedCandidates.map((candidate) => {
          const formattedDollarAmount = Number(candidate.dollarAmount) / 1e36;
          return (
            <li key={candidate.candidateAddress} style={styles.listItem}>
              {candidate.name}: {candidate.fundingAmount} ETH ($
              {formattedDollarAmount.toFixed(2)})
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const styles = {
  panelContainer: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  title: {
    textAlign: "center",
    color: "#333",
  },
  section: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "bold",
    color: "#555",
  },
  select: {
    width: "100%",
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  input: {
    width: "100%",
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  button: {
    display: "block",
    width: "100%",
    padding: "10px",
    marginTop: "10px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  buttonHover: {
    backgroundColor: "#0056b3",
  },
  subtitle: {
    marginBottom: "10px",
    color: "#444",
  },
  price: {
    fontSize: "1.2em",
    color: "#2b8a3e",
    marginBottom: "10px",
  },
  list: {
    listStyle: "none",
    padding: "0",
  },
  listItem: {
    marginBottom: "8px",
    padding: "8px",
    borderBottom: "1px solid #ddd",
  },
};

export default FundmePanel;
