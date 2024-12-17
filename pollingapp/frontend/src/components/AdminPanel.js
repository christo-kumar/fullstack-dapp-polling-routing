import React, { useState, useEffect } from "react";
import {
  createElection,
  addCandidate,
  addVoter,
  getCandidates, // Assuming you have a function to get candidates
  getVoters,
  getElectionName,
  hasElectionStartedFromContract,
  startElection,
  endElection,
  hasElectionFinalizedFromContract,
  getWinner,
} from "../contract"; // Ensure these functions are imported correctly
import { PINATA_JWT } from "../config";
import placeholderImage from "../Loading.png";

const AdminPanel = () => {
  const [electionName, setElectionName] = useState("");
  const [winnerName, setWinnerName] = useState("");
  const [addElectionName, setAddElectionName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [candidateAddress, setCandidateAddress] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [candidateParty, setCandidateParty] = useState("");
  const [candidates, setCandidates] = useState([]);

  const [voterAddress, setVoterAddress] = useState("");
  const [voterName, setVoterName] = useState("");
  const [voterAge, setVoterAge] = useState("");
  const [voters, setVoters] = useState([]);
  const [hasElectionStarted, setElectionStarted] = useState(false);
  const [hasElectionFinalized, setHasElectionFinalized] = useState(false);
  const [candidateImage, setCandidateImage] = useState(null);
  const [candidateImageHash, setCandidateImageHash] = useState("");
  const [mapCandidateImages, setmapCandidateImages] = useState({});

  const getFileFromIPFS = async (cid) => {
    try {
      if (!cid) {
        throw new Error("CID is required to fetch the image.");
      }

      const url = `https://ipfs.io/ipfs/${cid}`;
      const request = await fetch(url);
      const response = await request.blob();
      return response;
    } catch (error) {
      console.error("Error fetching image from IPFS:", error);
    }
  };

  const pinFileToIPFS = async (file) => {
    try {
      // Ensure the file is provided
      if (!file) {
        throw new Error("No file selected.");
      }

      const formData = new FormData();
      formData.append("file", file);

      const uploadRequest = new Request(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${PINATA_JWT}`,
          },
          body: formData,
        }
      );

      const response = await fetch(uploadRequest);

      if (!response.ok) {
        throw new Error("Failed to upload file to IPFS via Pinata.");
      }

      const data = await response.json();
      console.log("File uploaded to Pinata IPFS:", data);
      return data;
    } catch (error) {
      console.error("Error uploading file to IPFS:", error);
    }
  };

  // Fetch candidates when the component mounts
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
        //alert("Error fetching candidates.");
      }
    };

    const fetchElectionName = async () => {
      try {
        const electionName = await getElectionName();
        if (!electionName || electionName.trim() === "") {
          //alert("Election name is empty.");
        } else {
          setElectionName(electionName);
        }
      } catch (error) {
        console.error(error.message);
        //alert("Error Fetching election name.");
      }
    };
    const fetchWinner = async () => {
      try {
        const winner = await getWinner();
        if (!winner || winner.name.trim() === "") {
          //alert("Election name is empty.");
        } else {
          setWinnerName(winner.name);
        }
      } catch (error) {
        console.error(error.message);
        //alert("Error Fetching election winner.");
      }
    };

    const fetchVoters = async () => {
      try {
        const voters = await getVoters();
        if (Array.isArray(voters) && voters.length === 0) {
          //alert("No candidates found.");
        } else {
          setVoters(voters);
        }
      } catch (error) {
        console.error(error.message);
        //alert("Error Fetching voters.");
      }
    };

    const fetchElectionState = async () => {
      try {
        const electionState = await hasElectionStartedFromContract();
        setElectionStarted(electionState);
      } catch (error) {
        console.error(error.message);
        //alert("Error Fetching election start state.");
      }
    };

    const fetchElectionFinalizedState = async () => {
      try {
        const electionFinalizedState = await hasElectionFinalizedFromContract();
        setHasElectionFinalized(electionFinalizedState);
      } catch (error) {
        console.error(error.message);
        //alert("Error Fetching election finalized state.");
      }
    };

    fetchCandidates();
    fetchElectionName();
    fetchVoters();
    fetchElectionState();
    fetchElectionFinalizedState();
    fetchWinner();
  }, []); // Empty dependency array to run only once when the component mounts

  useEffect(() => {
    if (candidates.length === 0) return; // Do nothing if there are no candidates
    const fetchCandidateImages = async () => {
      const images = {};
      for (const candidate of candidates) {
        try {
          const imageBlob = await getFileFromIPFS(candidate.image);
          images[candidate.candidateAddress] = URL.createObjectURL(imageBlob);
        } catch (error) {
          console.error(
            `Error fetching image for candidate ${candidate.name}:`,
            error
          );
        }
      }
      setmapCandidateImages(images);
    };
    fetchCandidateImages();
  }, [candidates]);

  // Function to handle election creation
  const handleCreateElection = async () => {
    try {
      await createElection(addElectionName, startDate, endDate);
      setElectionName(addElectionName);
      alert("Election created successfully!");
    } catch (error) {
      alert(`Error creating election: ${error.message}`);
    }
  };

  // Function to handle adding a candidate
  const handleAddCandidate = async () => {
    try {
      await addCandidate(
        candidateAddress,
        candidateName,
        candidateParty,
        candidateImageHash
      );
      setCandidates((prev) => [
        ...prev,
        {
          address: candidateAddress,
          name: candidateName,
          party: candidateParty,
        },
      ]);
      alert("Candidate added successfully!");
      setCandidateAddress("");
      setCandidateName("");
      setCandidateParty("");
      setCandidateImageHash("");
    } catch (error) {
      alert(`Error adding candidate: ${error.message}`);
    }
  };

  // Function to handle adding a voter
  const handleAddVoter = async () => {
    try {
      await addVoter(voterAddress, voterName, voterAge);
      setVoters((prev) => [
        ...prev,
        { address: voterAddress, name: voterName, age: voterAge },
      ]);
      alert("Voter added successfully!");
      setVoterAddress("");
      setVoterName("");
      setVoterAge("");
    } catch (error) {
      alert(`Error adding voter: ${error.message}`);
    }
  };

  const handleEndElection = async () => {
    try {
      await endElection();
      alert("Election Finalized successfully!");
      //setFinalized
    } catch (error) {
      alert(`Error adding voter: ${error.message}`);
    }
  };

  const handleStartElection = async () => {
    try {
      await startElection();
      alert("Election Started successfully!");
      setElectionStarted(true);
    } catch (error) {
      alert(`Error adding voter: ${error.message}`);
    }
  };

  const handleUploadToIPFS = async () => {
    if (!candidateImage) {
      alert("Please select an image file first.");
      return;
    }

    try {
      const response = await pinFileToIPFS(candidateImage);
      console.log("Image uploaded to IPFS:", response);
      alert(`File uploaded to IPFS with CID: ${response.IpfsHash}`);
      setCandidateImageHash(response.IpfsHash);
    } catch (error) {
      console.error("Error uploading file to IPFS:", error);
      alert("Failed to upload file to IPFS.");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Admin Panel</h1>

      {/* Section to create election */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Election Details</h2>
        {electionName ? (
          <h2>Election Name: {electionName}</h2>
        ) : (
          <>
            <h2>Create Election</h2>
            <input
              style={styles.input}
              type="text"
              placeholder="Election Name"
              value={addElectionName}
              onChange={(e) => setAddElectionName(e.target.value)}
            />
            <input
              style={styles.input}
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input
              style={styles.input}
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <button onClick={handleCreateElection} style={styles.button}>
              Create Election
            </button>
          </>
        )}
      </div>
      <div>{winnerName ? <h3>Winner Name: {winnerName}</h3> : <></>}</div>

      {/* Section to manage candidates */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Manage Candidates</h2>
        <input
          style={styles.input}
          type="text"
          placeholder="Candidate Address"
          value={candidateAddress}
          onChange={(e) => setCandidateAddress(e.target.value)}
        />
        <input
          style={styles.input}
          type="text"
          placeholder="Candidate Name"
          value={candidateName}
          onChange={(e) => setCandidateName(e.target.value)}
        />
        <input
          style={styles.input}
          type="text"
          placeholder="Candidate Party"
          value={candidateParty}
          onChange={(e) => setCandidateParty(e.target.value)}
        />
        <input
          style={styles.input}
          type="file"
          accept="image/*"
          onChange={(e) => setCandidateImage(e.target.files[0])}
        />

        <button style={styles.button} onClick={handleAddCandidate}>
          Add Candidate
        </button>

        <button style={styles.button} onClick={handleUploadToIPFS}>
          Upload Image
        </button>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Candidate List</h2>
        <ul style={styles.list}>
          {candidates.length === 0 ? (
            <li>No candidates available.</li>
          ) : (
            candidates.map((candidate, index) => {
              const candidateImage =
                mapCandidateImages[candidate.candidateAddress];

              return (
                <li
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "20px",
                    borderBottom: "1px solid #ddd",
                    paddingBottom: "10px",
                  }}
                >
                  {/* Candidate Image */}
                  <img
                    src={candidateImage || placeholderImage}
                    alt={`${candidate.name}`}
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%", // Makes the image circular
                      objectFit: "cover",
                      marginRight: "20px",
                    }}
                    onLoad={(e) => {
                      if (e.target.src === placeholderImage && candidateImage) {
                        e.target.src = candidateImage; // Switch to actual image if loaded
                      }
                    }}
                    onError={(e) => {
                      e.target.src = placeholderImage; // Fallback to placeholder if an error occurs
                    }}
                  />
                  {/* Candidate Details */}
                  <div>
                    <p style={{ margin: 0 }}>
                      <strong>Name:</strong> {candidate.name}
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>Party:</strong> {candidate.party}
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>Address:</strong> {candidate.candidateAddress}
                    </p>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>

      {/* Section to manage voters */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Manage Voters</h2>
        <input
          style={styles.input}
          type="text"
          placeholder="Voter Address"
          value={voterAddress}
          onChange={(e) => setVoterAddress(e.target.value)}
        />
        <input
          style={styles.input}
          type="text"
          placeholder="Voter Name"
          value={voterName}
          onChange={(e) => setVoterName(e.target.value)}
        />
        <input
          style={styles.input}
          type="number"
          placeholder="Voter Age"
          value={voterAge}
          onChange={(e) => setVoterAge(e.target.value)}
        />
        <button style={styles.button} onClick={handleAddVoter}>
          Add Voter
        </button>
        <ul>
          {voters.length === 0 ? (
            <li>No voters available.</li>
          ) : (
            voters.map((voter, index) => (
              <li key={index}>
                <strong>Name:</strong> {voter.name}
                <strong> Address:</strong> {voter.voterAddress}
              </li>
            ))
          )}
        </ul>
      </div>
      {hasElectionStarted ? (
        hasElectionFinalized ? (
          <></>
        ) : (
          <button onClick={handleEndElection}>End Election</button>
        )
      ) : hasElectionFinalized ? (
        <></>
      ) : (
        <button onClick={handleStartElection}>Start Election</button>
      )}
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    maxWidth: "800px",
    margin: "20px auto",
    padding: "20px",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  header: {
    textAlign: "center",
    color: "#333",
    marginBottom: "20px",
  },
  section: {
    marginBottom: "30px",
  },
  input: {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    border: "1px solid #ddd",
    borderRadius: "4px",
    boxSizing: "border-box",
  },
  button: {
    padding: "10px 15px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginRight: "10px",
  },
  buttonSecondary: {
    backgroundColor: "#6c757d",
  },
  list: {
    listStyle: "none",
    padding: 0,
  },
  listItem: {
    display: "flex",
    alignItems: "center",
    marginBottom: "15px",
    borderBottom: "1px solid #ddd",
    paddingBottom: "10px",
  },
  candidateImage: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    objectFit: "cover",
    marginRight: "15px",
  },
  sectionTitle: {
    fontSize: "20px",
    color: "#333",
    borderBottom: "2px solid #007BFF",
    paddingBottom: "5px",
  },
};

export default AdminPanel;
