import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useState, useEffect, useRef } from 'react';

import { providers, Contract, utils } from 'ethers';
import Web3Modal from 'web3modal';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../constants';



export default function Home() {

  const [tokenIdsMinted, setTokenIdsMinted] = useState("0");
  const [walletConnected, setWlletConnected] = useState(false);
  const [alreadyMinted, setAlreadyMinted] = useState(false);
  const [isPresaleStarted, setIsPresaleStarted] = useState(false);
  const [isPresaleEnded, setIsPresaleEnded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  const web3ModalRef = useRef();


  useEffect(() => {

    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: 'goerli',
        providerOptions: {},
        disabledInjectedProvider: false
      });
    }
    connectWallet();
    getMintedTokensIDs();

    if (IsPresaleStarted())
      IsPresaleEnded();


    const periodicCalls = setInterval(async () => {
      const _isPresaleStarted = await IsPresaleStarted();
      if (_isPresaleStarted) {
        const _isPresaleEnded = await IsPresaleEnded();
        if (_isPresaleEnded)
          clearInterval(periodicCalls);
      }
    }, 5000);
    setInterval(async () => {
      getMintedTokensIDs();
    }, 5000);


    if (isContractOwner())
      renderWithdrawButton();

    hasAddressAlreadyMinted();

  }, [walletConnected])

  useEffect(() => {
    renderNFTButton();
  }, [alreadyMinted, isPresaleStarted, isPresaleEnded, isLoading, alreadyMinted])


  const connectWallet = async () => {

    try {

      setIsLoading(true);

      const provider = await getProviderOrSigner();
      if (provider) {
        setWlletConnected(true);
      }


      setIsLoading(false);

    } catch (error) {
      setIsLoading(false);
      console.error(error);
    }


  }

  const startPresale = async () => {

    try {
      const signer = await getProviderOrSigner(true);
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      setIsLoading(true);
      const tx = await contract.startPresale();
      await tx.wait();
      setIsLoading(false);
      setIsPresaleStarted(true);

    } catch (error) {
      setIsLoading(false);
      console.error(error);
    }

  }
  const IsPresaleStarted = async () => {

    try {
      const provider = await getProviderOrSigner();
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const _isPresaleStarted = await contract.presaleStarted();
      setIsPresaleStarted(_isPresaleStarted);

    } catch (error) {
      console.error(error);
    }

  }
  const IsPresaleEnded = async () => {

    try {
      const provider = await getProviderOrSigner();
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const _isPresaleEnded = await contract.isPresaleEnded();
      setIsPresaleEnded(_isPresaleEnded);

    } catch (error) {
      console.error(error);
    }

  }


  const presaleMint = async () => {
    try {

      if (hasAddressAlreadyMinted()) {
        window.alert("Sender address has already minted the token.");
        return false;
      }

      const signer = await getProviderOrSigner(true);
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      setIsLoading(true);
      const tx = await contract.presaleMint({ value: 1 });
      await tx.wait();
      setIsLoading(false);
      const _tokenIdsMinted = await contract.mintedTokensIDs();
      setTokenIdsMinted(_tokenIdsMinted);
      window.alert("You've sucessfully minted CryptoDev NFT in Presale");
    } catch (error) {
      setIsLoading(false);
      console.error(error);
    }
  }
  const publicMint = async () => {
    try {

      if (hasAddressAlreadyMinted()) {
        window.alert("Sender address has already minted the token.");
        return false;
      }
      const signer = await getProviderOrSigner(true);
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      setIsLoading(true);
      const tx = await contract.publicMint({ value: 1 });
      await tx.wait();
      const _tokenIdsMinted = await contract.mintedTokensIDs();
      setTokenIdsMinted(_tokenIdsMinted);
      setIsLoading(false);

      window.alert("You've sucessfully minted CryptoDev NFT in Public sale.");
    } catch (error) {
      setIsLoading(false);
      console.error(error);
    }
  }
  const getMintedTokensIDs = async () => {

    try {
      const provider = await getProviderOrSigner();
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const _tokenIdsMinted = await contract.mintedTokensIDs();
      setTokenIdsMinted(_tokenIdsMinted.toString());

    } catch (error) {
      console.error(error);
    }

  }

  const hasAddressAlreadyMinted = async () => {

    try {
      const signer = await getProviderOrSigner(true);
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const providerAddress = await signer.getAddress();
      const _alreadyMinted = await contract.mintedAddresses(providerAddress);
      setAlreadyMinted(_alreadyMinted);
      return _alreadyMinted;
    } catch (error) {
      console.error(error);
    }

  }

  const getProviderOrSigner = async (needSigner = false) => {
    try {
      const currentProvider = await web3ModalRef.current.connect();
      const web3Provider = new providers.Web3Provider(currentProvider);


      const { chainId } = await web3Provider.getNetwork();
      console.log("getProviderOrSigner --> Chain ID is", chainId);
      if (chainId !== 5) {
        //window.alert("Please change the network to Goerli");
        throw new Error("Please change the network to Goerli");
      }

      if (needSigner) {
        return web3Provider.getSigner();
      }
      
      return web3Provider;

    } catch (error) {
      console.error(error);
    }

  }


  const isContractOwner = async () => {
    try {
      const provider = await getProviderOrSigner();
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const contractOwnerAddress = await contract.owner();

      const signer = await getProviderOrSigner(true);
      const currentUserAddress = await signer.getAddress();

      setIsOwner(currentUserAddress.toLowerCase() === contractOwnerAddress.toLowerCase());

    } catch (error) {
      console.error(error);
    }
  }
  const contractHasAmount = async () => {
    try {
      const provider = await getProviderOrSigner();
      const contractBalance = await provider.getBalance(CONTRACT_ADDRESS);
      return contractBalance.gt(0); //BigNumber
    } catch (error) {
      console.error(error);
    }

  }

  const withdrawAmount = async () => {
    try {
      const hasAmount = await contractHasAmount();
      if (hasAmount) {
        const signer = await getProviderOrSigner(true);
        const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        await contract.withdraw();
        window.alert("Contract amount withdrawn successfully and moved to the owner's wallet");
      }
      else {
        window.alert("Contract's balance is empty. There is no amount to be withdrawn");
      }


    } catch (error) {
      console.error(error);
    }
  }
  const renderWithdrawButton = () => {

    if (isOwner)
      return (

        <button className={styles.button} onClick={withdrawAmount}>Withdraw Contract Amount 💰 </button>

      );
  }
  const renderNFTButton = () => {

    if (walletConnected) {

      if (alreadyMinted) {
        return (
          <div className={styles.description}>
            Thanks for minting the CryptoDev NFT.
          </div>
        );
      }
      else if (isLoading) {
        return (
          <button className={styles.button}>Loading ...</button>
        );
      }
      else {
        if (!isPresaleStarted) {
          if (isOwner)
            return (
              <button className={styles.button} onClick={startPresale}>Start Presale</button>
            );
          else
            return (
              <div className={styles.description}>
                Presale hasnt started. Please check back soon!
              </div>
            );
        }
        else {

          if (!isPresaleEnded) {
            return (
              <div>
                <div className={styles.description}>
                  Presale has started!!! If your address is whitelisted, Mint a Crypto Dev 🥳
                </div>
                <button className={styles.button} onClick={presaleMint}>Presale mint 🚀</button>
              </div>
            );
          }
          else {
            return (
              <button className={styles.button} onClick={publicMint}>Public mint 🚀</button>
            );
          }
        }
      }
    }
    else if (isLoading) {
      return (
        <button className={styles.button}>Loading ...</button>
      );
    }
    else {
      return (
        <button className={styles.button} onClick={connectWallet}>Connect Wallet</button>
      );
    }
  }
  return (
    <div className={styles.container}>
      <Head>
        <title>NFT Collection by Kazim</title>
        <meta name="description" content="NFT Collection by Kazim" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>
            Welcome to NFT Collection
          </h1>
          <div className={styles.description}>
            Its an NFT collection for developers in Crypto.
          </div>
          <div className={styles.description}>
            {tokenIdsMinted}/20 have been minted
          </div>
          <div className={styles.description}>
            {renderNFTButton()}
          </div>
          <div className={styles.description}>
            {renderWithdrawButton()}
          </div>
        </div>

        <div>
          <img className={styles.image} src="./cryptodevs/0.svg" />
        </div>

      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Kazim&#169;
      </footer>
    </div>
  )
}
