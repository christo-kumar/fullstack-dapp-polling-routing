import React, { useEffect, useState } from "react";
import { getCandidates, voteForCandidate } from "../contract";

const VotingPanel = () => {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState("");

  // Style objects
  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      margin: "50px auto",
      padding: "20px",
      maxWidth: "500px",
      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
      borderRadius: "8px",
      backgroundColor: "#ecf0f1",
    },
    title: {
      fontSize: "2rem",
      color: "#2c3e50",
      marginBottom: "20px",
    },
    select: {
      width: "100%",
      padding: "10px",
      fontSize: "1rem",
      borderRadius: "5px",
      border: "1px solid #bdc3c7",
      marginBottom: "20px",
    },
    button: {
      padding: "10px 20px",
      fontSize: "1rem",
      color: "white",
      backgroundColor: "#1abc9c",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      transition: "background-color 0.3s ease",
    },
    buttonHover: {
      backgroundColor: "#16a085",
    },
    error: {
      color: "red",
      marginBottom: "10px",
    },
  };

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const candidatesList = await getCandidates();
        if (Array.isArray(candidatesList) && candidatesList.length === 0) {
          //alert("No candidates found.");
        } else {
          setCandidates(candidatesList);
        }
      } catch (error) {
        console.error(error.message);
        alert("Error fetching candidates.");
      }
    };

    fetchCandidates();
  }, []);

  const handleVote = async () => {
    if (!selectedCandidate) {
      alert("Please select a candidate before voting.");
      return;
    }

    try {
      await voteForCandidate(selectedCandidate);
      alert("Vote successfully cast!");
    } catch (error) {
      console.error(error.message);
      alert("Error casting vote.");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Voting Panel</h1>
      <select
        onChange={(e) => setSelectedCandidate(e.target.value)}
        style={styles.select}
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
      <button
        onClick={handleVote}
        style={styles.button}
        onMouseEnter={(e) =>
          (e.target.style.backgroundColor = styles.buttonHover.backgroundColor)
        }
        onMouseLeave={(e) =>
          (e.target.style.backgroundColor = styles.button.backgroundColor)
        }
      >
        Vote
      </button>
    </div>
  );
};

export default VotingPanel;
