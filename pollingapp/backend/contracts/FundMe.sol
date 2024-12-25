// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

//1.import chainlink dependencies
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/tests/MockV3Aggregator.sol";

contract FundMe {

//2. Add Candidate struct
    struct Candidate {
        address candidateAddress;
        string name;
        uint256 fundingAmount; // Total funding in wei
        uint256 dollarAmount;   // Total funding in USD (string for "N/A" or calculated value)
    }

//3. Add properties to smart contracts
    AggregatorV3Interface internal priceFeed; // Mocked Chainlink Price Feed
    mapping(address => Candidate) public candidates;
    address[] public candidateAddresses;
    uint256 public ethUsdPrice; // ETH to USD price (as uint256 for calculations)

//4. Add Modifier to set constraint
    function _isCandidate(address _candidateAddress) internal view returns (bool) {
        return candidates[_candidateAddress].candidateAddress != address(0);
    }

//5. Add events to update UI
    event CandidateFunded(address indexed candidate, uint256 ethAmount);
    event PriceUpdated(uint256 ethUsdPrice);

//6. Add Constructor
    constructor(address _priceFeedAddress) {
        priceFeed = AggregatorV3Interface(_priceFeedAddress); // Pass the mocked price feed address
    }

//7. Write the functions
    function getCandidates() external view returns (Candidate[] memory) {
        Candidate[] memory result = new Candidate[](candidateAddresses.length);
        for (uint256 i = 0; i < candidateAddresses.length; i++) {
            result[i] = candidates[candidateAddresses[i]];
        }
        return result;
    }

    function fundCandidate(address _candidateAddress, string memory _name) external payable {
        require(msg.value > 0, "Funding amount must be greater than 0");

        if (!_isCandidate(_candidateAddress)) {
            candidates[_candidateAddress] = Candidate({
                candidateAddress: _candidateAddress,
                name: _name,
                fundingAmount: 0,
                dollarAmount: 0
            });
            candidateAddresses.push(_candidateAddress);
        }

        candidates[_candidateAddress].fundingAmount += msg.value;

        emit CandidateFunded(_candidateAddress, msg.value);
    }

    function withdrawFunds() external {
        //Ensure the caller is a funded candidate
        require(_isCandidate(msg.sender), "Caller is not a candidate");

        // Get the funded amount
        uint256 amount = candidates[msg.sender].fundingAmount;

        // Ensure the candidate has funds to withdraw
        require(amount > 0, "No funds available to withdraw");

        // Reset the candidate's funding amount before transferring funds
        candidates[msg.sender].fundingAmount = 0;

        // Transfer the funds
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
    }

    function getFundingForCandidate(address _candidateAddress) external view returns (uint256) {
        require(_isCandidate(_candidateAddress), "Address is not a candidate");
        return candidates[_candidateAddress].fundingAmount;
    }

    function updatePrice() public {
        //price feed adjusted to 8 decimals, 3000 -> 3000.00000000
        (, int256 price,,,) = priceFeed.latestRoundData();
        //price feed adjusted to 18 decimals, 3000 -> 3000.000000000000000000
        ethUsdPrice = uint256(price) * 1e10;

        for (uint256 i = 0; i < candidateAddresses.length; i++) {
            Candidate storage candidate = candidates[candidateAddresses[i]];
            if (ethUsdPrice > 0 && candidate.fundingAmount > 0) {
                uint256 usdAmountInt = candidate.fundingAmount * ethUsdPrice;
                candidate.dollarAmount = usdAmountInt;
            }
        }
        emit PriceUpdated(ethUsdPrice);
    }
}
