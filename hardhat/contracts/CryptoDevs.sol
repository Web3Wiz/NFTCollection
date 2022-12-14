// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IWhitelist.sol";

contract CryptoDevs is ERC721Enumerable, Ownable {
    string baseTokenURI;
    IWhitelist iWhitelist;

    uint8 public maxTokensIDs = 20;
    uint8 public mintedTokensIDs;

    uint256 public presaleStartTime;
    bool public presaleStarted;

    uint256 public tokenPrice = 1 wei;
    bool public isPaused;

    mapping(address => bool) public mintedAddresses;

    modifier onlyWhenNotPaused() {
        require(
            !isPaused,
            "Can not process the request. Contract is currently paused."
        );
        _;
    }

    constructor(string memory baseURI, address whitelistContract)
        ERC721("CryptoDev", "CD")
    {
        baseTokenURI = baseURI;
        iWhitelist = IWhitelist(whitelistContract);
    }

    function startPresale() public onlyOwner onlyWhenNotPaused {
        presaleStartTime = block.timestamp;
        presaleStarted = true;
    }

    function presaleMint() public payable onlyWhenNotPaused {
        require(
            presaleStarted,
            "Presale is yet to be started. Please try again after sometime."
        );
        require(
            block.timestamp <= (presaleStartTime + 5 minutes),
            "Presale mint time has ended."
        );
        require(
            mintedTokensIDs < maxTokensIDs,
            "All the tokens are already minted."
        );
        require(
            iWhitelist.whitelist(msg.sender),
            "Sender address is not whitelisted to participate in Presale mint."
        );
        require(
            !mintedAddresses[msg.sender],
            "Only one token is allowed. Sender address has already minted the token."
        );
        require(msg.value >= tokenPrice, "Not enough ethers sent.");

        mintedTokensIDs++;

        _safeMint(msg.sender, mintedTokensIDs);
        mintedAddresses[msg.sender] = true;
    }

    function publicMint() public payable onlyWhenNotPaused {
        require(
            presaleStarted && block.timestamp > (presaleStartTime + 5 minutes),
            "Public mint is yet to be started."
        );
        require(
            mintedTokensIDs < maxTokensIDs,
            "All the tokens are already minted."
        );
        require(
            !mintedAddresses[msg.sender],
            "Only one token is allowed. Sender address has already minted the token."
        );
        require(msg.value >= tokenPrice, "Not enough ethers sent.");

        mintedTokensIDs++;
        _safeMint(msg.sender, mintedTokensIDs);
        mintedAddresses[msg.sender] = true;
    }

    function isPresaleEnded() public view onlyWhenNotPaused returns (bool) {
        return (presaleStarted &&
            block.timestamp > (presaleStartTime + 5 minutes));
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenURI;
    }

    function pauseContract() public onlyOwner {
        isPaused = true;
    }

    function withdraw() public onlyOwner {
        address _owner = owner();
        uint256 _amount = address(this).balance;
        (bool sent, ) = _owner.call{value: _amount}("");
        require(sent, "Failed to withdraw ether");
    }

    receive() external payable {}

    fallback() external payable {}
}

/*
Current gas price: 12195676713
Estimated gas: 3904339
Deployer balance:  1.928164444122466288
Deployment price:  0.047616056221957707
CryptoDev contract deployed address is 0x371bD1497467eA3E482a2b88837E2E7840A69d90 (tested)
*/

/*
Current gas price: 8086197758
Estimated gas: 3904135
Deployer balance:  5.297397320245390221
Deployment price:  0.03156960768392933
CryptoDev contract deployed address is 0x4f0439a1E89C7981A4B79Dc8750DEA71b056E6e5 (Working on OpenSea)
*/
