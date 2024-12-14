// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;
import "hardhat/console.sol";

contract FundMe {
    struct Candidate {
        address candidateAddress;
        string name;
        uint256 fundingAmount;
    }

    mapping(address => Candidate) public candidates;
    address[] public candidateAddresses;

    event CandidateFunded(address indexed candidate, uint256 amount);

    /**
     * @dev Check if a candidate exists
     */
    function _isCandidate(address _candidateAddress) internal view returns (bool) {
        return candidates[_candidateAddress].candidateAddress != address(0);
    }

    /**
     * @dev Fund a candidate. If the candidate is not already added, they are automatically added.
     * @param _candidateAddress The address of the candidate to fund
     * @param _name The name of the candidate (used only if adding a new candidate)
     */
    function fundCandidate(address _candidateAddress, string memory _name) external payable {
        require(msg.value > 0, "Funding amount must be greater than 0");

        if (!_isCandidate(_candidateAddress)) {
            // Add candidate if they don't exist
            candidates[_candidateAddress] = Candidate({
                candidateAddress: _candidateAddress,
                name: _name,
                fundingAmount: 0
            });
            candidateAddresses.push(_candidateAddress);
        }

        // Update funding amount
        candidates[_candidateAddress].fundingAmount += msg.value;

        emit CandidateFunded(_candidateAddress, msg.value);
    }

    /**
     * @dev Get the total funding for a specific candidate
     * @param _candidateAddress The address of the candidate
     */
    function getFundingForCandidate(address _candidateAddress) external view returns (uint256) {
        require(_isCandidate(_candidateAddress), "Candidate does not exist");
        return candidates[_candidateAddress].fundingAmount;
    }

    /**
     * @dev Get the list of all candidates
     */
    function getCandidates() external view returns (Candidate[] memory) {
        Candidate[] memory result = new Candidate[](candidateAddresses.length);
        for (uint256 i = 0; i < candidateAddresses.length; i++) {
            result[i] = candidates[candidateAddresses[i]];
        }
        return result;
    }
}
