// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/tests/MockV3Aggregator.sol";

contract FundMe {
    struct Candidate {
        address candidateAddress;
        string name;
        uint256 fundingAmount; // Total funding in wei
        string dollarAmount;   // Total funding in USD (string for "N/A" or calculated value)
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
                dollarAmount: "N/A"
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
        (, int256 price,,,) = priceFeed.latestRoundData();
        ethUsdPrice = uint256(price) * 1e10; // Convert price to 18 decimals

        for (uint256 i = 0; i < candidateAddresses.length; i++) {
            Candidate storage candidate = candidates[candidateAddresses[i]];
            if (ethUsdPrice > 0 && candidate.fundingAmount > 0) {
                uint256 usdAmountInt = (candidate.fundingAmount * ethUsdPrice) / 1e18;
                candidate.dollarAmount = _uintToString(usdAmountInt);
            }
        }

        emit PriceUpdated(ethUsdPrice);
    }

    function _uintToString(uint256 _value) internal pure returns (string memory) {
        if (_value == 0) return "0";
        uint256 temp = _value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (_value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(_value % 10)));
            _value /= 10;
        }
        return string(buffer);
    }
}
