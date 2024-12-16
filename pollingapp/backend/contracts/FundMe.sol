// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/tests/MockV3Aggregator.sol";

contract FundMe {
    struct Candidate {
        address candidateAddress;
        string name;
        uint256 fundingAmount; // Total funding in wei
        uint256 dollarAmount;   // Total funding in USD (string for "N/A" or calculated value)
    }

    mapping(address => Candidate) public candidates;
    address[] public candidateAddresses;

    AggregatorV3Interface internal priceFeed; // Mocked Chainlink Price Feed
    uint256 public ethUsdPrice; // ETH to USD price (as uint256 for calculations)

    event CandidateFunded(address indexed candidate, uint256 ethAmount);
    event PriceUpdated(uint256 ethUsdPrice);

    constructor(address _priceFeedAddress) {
        priceFeed = AggregatorV3Interface(_priceFeedAddress); // Pass the mocked price feed address
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

    function _isCandidate(address _candidateAddress) internal view returns (bool) {
        return candidates[_candidateAddress].candidateAddress != address(0);
    }

    function getCandidates() external view returns (Candidate[] memory) {
        Candidate[] memory result = new Candidate[](candidateAddresses.length);
        for (uint256 i = 0; i < candidateAddresses.length; i++) {
            result[i] = candidates[candidateAddresses[i]];
        }
        return result;
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
