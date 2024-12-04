import React, { useEffect, useState } from "react";
import { getCandidates, voteForCandidate } from "../contract";

const VotingPanel = () => {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState("");

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const candidatesList = await getCandidates();
        setCandidates(candidatesList);
      } catch (error) {
        console.error(error.message);
        alert("Error fetching candidates.");
      }
    };

    fetchCandidates();
  }, []);

  const handleVote = async () => {
    try {
      await voteForCandidate(selectedCandidate);
      alert("Vote successfully cast!");
    } catch (error) {
      console.error(error.message);
      alert("Error casting vote.");
    }
  };
  return (
    <div>
      <h1>Voting Panel</h1>
      <select onChange={(e) => setSelectedCandidate(e.target.value)}>
        <option>Select a Candidate</option>
        {candidates.map((candidate) => (
          <option
            key={candidate.candidateAddress}
            value={candidate.candidateAddress}
          >
            {candidate.name}
          </option>
        ))}
      </select>
      <button onClick={handleVote}>Vote</button>
    </div>
  );
  /*return (
    <div>
      <p>Voting Panel</p>
    </div>
  );*/
};

export default VotingPanel;
