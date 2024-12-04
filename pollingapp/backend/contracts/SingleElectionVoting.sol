// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.27;

import "hardhat/console.sol";

contract SingleElectionVoting {

    struct Voter {
        address voterAddress;
        string name;
        uint256 age;
        bool hasVoted;
    }

    struct Candidate {
        address candidateAddress;
        string name;
        string party;
        uint256 voteCount;
    }

    struct Election {
        string name;
        uint256 startDate; // Timestamp for voting start
        uint256 endDate; // Timestamp for voting end
        address[] candidateAddresses; // List of candidate addresses
        address[] voterAddresses;
        mapping(address => Voter) voterList; // Map voter addresses to voter data
        mapping(address => Candidate) candidateList; // Map candidate addresses to candidate data
        bool started;
        bool finalized;
    }

    Election public election;

    address public admin;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action.");
        _;
    }

    modifier onlyBefore(uint256 _timestamp) {
        require(block.timestamp < _timestamp, "Action not allowed after this time.");
        _;
    }

    modifier onlyDuring(uint256 _start, uint256 _end) {
        require(block.timestamp >= _start && block.timestamp <= _end, "Action only allowed during the election.");
        _;
    }

    modifier onlyAfter(uint256 _timestamp) {
        require(block.timestamp > _timestamp, "Action only allowed after this time.");
        _;
    }

    constructor() {
        console.log("Owner contract deployed by:", msg.sender);
        admin = msg.sender;
    }

    // Admin functions
    function createElection(string memory _name, uint256 _startDate, uint256 _endDate) 
        external 
        onlyAdmin 
    {
        console.log("Sender trying to create the election:", msg.sender);
        require(bytes(election.name).length == 0, "Election already created.");
        require(_startDate > block.timestamp, "Start date must be in the future.");
        require(_endDate > _startDate, "End date must be after start date.");
        
        election.name = _name;
        election.startDate = _startDate;
        election.endDate = _endDate;
        election.finalized = false;
        election.started = false;
    }

    function getElectionName() external view returns (string memory) {
        return election.name;
    }

    // Admin Function-2
    function addCandidate(address _candidateAddress, string memory _name, string memory _party) 
        external 
        onlyAdmin
        onlyBefore(election.startDate - 1 days) 
    {
        require(election.candidateList[_candidateAddress].candidateAddress == address(0), "Candidate already added.");
        election.candidateList[_candidateAddress] = Candidate(_candidateAddress, _name, _party, 0);
        election.candidateAddresses.push(_candidateAddress);
    }

    function addVoter(address _voterAddress, string memory _name, uint256 _age) 
        external 
        onlyAdmin 
        onlyBefore(election.startDate) 
    {
        require(election.voterList[_voterAddress].voterAddress == address(0), "Voter already added.");
        election.voterList[_voterAddress] = Voter(_voterAddress, _name, _age, false);
        election.voterAddresses.push(_voterAddress);
    }

    function startElection() external onlyAdmin {
        //require(block.timestamp >= election.startDate, "Start time not reached.");
        //require(block.timestamp < election.endDate, "End time already passed.");
        //require(!election.finalized, "Election already finalized.");
        election.started = true;
    }

    function endElection() external onlyAdmin {
        //require(block.timestamp > election.endDate, "End time not reached.");
        election.finalized = true;
    }

    function hasElectionStarted() external view returns (bool) {
        return election.started;
    }

    function hasElectionFinalized() external view returns (bool) {
        return election.finalized;
    }

    function getWinner() external view returns (string memory name, string memory party, uint256 voteCount) {
        require(election.candidateAddresses.length > 0, "No candidates in the election.");
        require(election.finalized, "Election has not been finalized.");

        uint256 maxVotes = 0;
        address winnerAddress = address(0);
        for (uint256 i = 0; i < election.candidateAddresses.length; i++) {
            address candidateAddress = election.candidateAddresses[i];
            Candidate storage candidate = election.candidateList[candidateAddress];
            if (candidate.voteCount > maxVotes) {
                maxVotes = candidate.voteCount;
                winnerAddress = candidateAddress;
            }
        }

        if (winnerAddress != address(0)) {
            Candidate storage winner = election.candidateList[winnerAddress];
            return (winner.name, winner.party, winner.voteCount);
        } else {
            return ("No winner", "", 0);
        }
    }

    // Voter functions
    function vote(address _candidateAddress) 
        external 
    {
        Voter storage voter = election.voterList[msg.sender];
        console.log("Voter Address:", voter.voterAddress);
        console.log("Sender Address:", msg.sender);
        require(election.started);
        require(voter.voterAddress != address(0), "You are not eligible to vote.");
        require(!voter.hasVoted, "You have already voted.");
        require(election.candidateList[_candidateAddress].candidateAddress != address(0), "Invalid candidate.");

        voter.hasVoted = true;
        election.candidateList[_candidateAddress].voteCount++;
    }

    function getCandidates() external view returns (Candidate[] memory) {
        uint256 numCandidates = election.candidateAddresses.length;

        Candidate[] memory candidates = new Candidate[](numCandidates);
        for (uint256 i = 0; i < numCandidates; i++) {
            candidates[i] = election.candidateList[election.candidateAddresses[i]];
        }

        return candidates;
    }

    function getVoters() external view returns (Voter[] memory) {
        uint256 numVoters = election.voterAddresses.length;
        
        Voter[] memory voters = new Voter[](numVoters);
        for(uint256 i = 0; i < numVoters; i++) {
            voters[i] = election.voterList[election.voterAddresses[i]];
        }
        return voters;
    }
}


