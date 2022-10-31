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

    mapping (address => bool) public mintedAddresses;

    modifier onlyWhenNotPaused() {
        require(!isPaused, "Can not process the request. Contract is currently paused.");
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

    function presaleMint() public payable onlyWhenNotPaused{
        require(presaleStarted, "Presale is yet to be started. Please try again after sometime.");
        require(block.timestamp <= ( presaleStartTime + 5 minutes), "Presale mint time has ended." );
        require(mintedTokensIDs < maxTokensIDs, "All the tokens are already minted.");
        require(iWhitelist.whitelist(msg.sender), "Sender address is not whitelisted to participate in Presale mint.");
        require(!mintedAddresses[msg.sender], "Only one token is allowed. Sender address has already minted the token.");
        require(msg.value >= tokenPrice, "Not enough ethers sent.");

        mintedTokensIDs++;

        _safeMint(msg.sender, mintedTokensIDs);
        mintedAddresses[msg.sender] = true;
    }

    function publicMint() public payable onlyWhenNotPaused{
        require(presaleStarted && block.timestamp > ( presaleStartTime + 5 minutes), "Public mint is yet to be started." );
        require(mintedTokensIDs < maxTokensIDs, "All the tokens are already minted.");
        require(!mintedAddresses[msg.sender], "Only one token is allowed. Sender address has already minted the token.");
        require(msg.value >= tokenPrice, "Not enough ethers sent.");

        mintedTokensIDs++;
        _safeMint(msg.sender, mintedTokensIDs);
        mintedAddresses[msg.sender] = true;
    }

    function isPresaleEnded() public view onlyWhenNotPaused returns(bool){
        return  (presaleStarted && block.timestamp > ( presaleStartTime + 5 minutes));
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenURI;
    } 
    function pauseContract() public onlyOwner {
        isPaused = true;            
    }

    function withdraw() public onlyOwner {
        address _owner = owner();
        uint256 _amount =  address(this).balance;
        (bool sent, ) = _owner.call{value:_amount}("");
        require(sent, "Failed to withdraw ether");
    }

    receive() external payable  {}

    fallback() external payable {}

}


/*

CryptoDev contract deployed address is 0x00dB25D34e94180b3793a48FFcbfE1D6E75A485F (WORKING....)

*/

/*
Current gas price: 38797350445
Estimated gas: 3904183
Deployer balance:  1.928164444122466288
Deployment price:  0.151471956052411435
CryptoDev contract deployed address is 0x41DF0f4af0f450AcE46AfD740D0e1248ac2A3a5f
*/