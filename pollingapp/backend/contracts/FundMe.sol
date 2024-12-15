// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "./provableAPI.sol";

contract FundMe is usingProvable {
    struct Candidate {
        address candidateAddress;
        string name;
        uint256 fundingAmount; // Total funding in wei
        string dollarAmount;   // Total funding in USD (string for "N/A" or calculated value)
    }

    mapping(address => Candidate) public candidates;
    address[] public candidateAddresses;

    string public ethUsdPrice; // ETH to USD price (as string for simplicity)

    event CandidateFunded(address indexed candidate, uint256 ethAmount);
    event PriceUpdated(string ethUsdPrice);
    event PriceUpdateFailed(string reason);

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


    function updatePrice() external {
        provable_query("URL", "json(https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd).ethereum.usd");
    }

    function __callback(string memory _result) public {
        require(msg.sender == provable_cbAddress(), "Caller is not the provable callback address");

        ethUsdPrice = _result;

        for (uint256 i = 0; i < candidateAddresses.length; i++) {
            Candidate storage candidate = candidates[candidateAddresses[i]];
            if (bytes(ethUsdPrice).length > 0 && candidate.fundingAmount > 0) {
                uint256 ethUsdRate = _parsePrice(ethUsdPrice);
                uint256 usdAmountInt = (candidate.fundingAmount * ethUsdRate) / 1e18;
                candidate.dollarAmount = _uintToString(usdAmountInt);
            }
        }

        emit PriceUpdated(_result);
    }

    function __fallback() public payable {
        emit PriceUpdateFailed("Price fetch failed or invalid response");
    }

    function _parsePrice(string memory _price) internal pure returns (uint256) {
        bytes memory b = bytes(_price);
        uint256 result = 0;
        uint256 decimalFactor = 1;
        bool hasDecimals = false;

        for (uint256 i = 0; i < b.length; i++) {
            if (b[i] == ".") {
                hasDecimals = true;
                decimalFactor = 100;
            } else {
                result = result * 10 + (uint8(b[i]) - 48);
                if (hasDecimals) decimalFactor /= 10;
            }
        }

        return result * decimalFactor;
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
