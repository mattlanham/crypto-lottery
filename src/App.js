import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from './artifacts/contracts/CryptoLottery.sol/CryptoLottery.json';

export default function App() {

    // Used to store the account we are working with
    const [currentAccount, setCurrentAccount] = useState("");
    const [message, setMessage] = useState("");
    const [messageClass, setMessageClass] = useState("");
    const [allWaves, setAllWaves] = useState([]);

    const contractAddress = "0xC681e1DD127FAb028C0aC2a31AB26E763D5A4b04";
    const contractABI = abi.abi;

    const checkIfWalletIsConnected = async () => {
        try {
            const { ethereum } = window;

            // Check if they have metamask
            if (!ethereum) {
                console.log("Make sure you have metamask!");
                return;
            } else {
                console.log("We have a ethereum object! ", ethereum);
            }

            // Check if we are authorized to access the wallet
            const accounts = await ethereum.request({ method: 'eth_accounts' });

            if (accounts.length !== 0) {
                const account = accounts[0];
                console.log("Found an authorized account:", account);
                setCurrentAccount(account);
                getAllWaves();
            } else {
                console.log("No authorized account found");
            }
        } catch (error) {
            console.log(error);
        }
    };

    // Connect to wallet
    const connectWallet = async () => {
        try {
            const { ethereum } = window;

            if (!ethereum) {
                alert("Get metamask");
                return;
            }

            const accounts = await ethereum.request({ method: "eth_requestAccounts" });

            console.log("Connected ", accounts[0]);
            setCurrentAccount(accounts[0]);
        } catch (error) {
            console.log(error);
        }
    }

    const getAllWaves = async () => {
        try {
            const { ethereum } = window;
            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

                const waves = await wavePortalContract.getAllWaves();

                let wavesCleaned = [];
                waves.forEach(wave => {
                    wavesCleaned.push({
                        address: wave.waver,
                        timestamp: new Date(wave.timestamp * 1000),
                        message: wave.message
                    });
                });

                setAllWaves(wavesCleaned);

                wavePortalContract.on("NewWave", (from, timestamp, message) => {
                    console.log("NewWave", from, timestamp, message);

                    setAllWaves(prevState => [...prevState, {
                        address: from,
                        timestamp: new Date(timestamp * 1000),
                        message: message
                      }]);

                })
            } else {
                console.log("Ethereum object doesn't exist");
            }
            
        } catch (error) {
            console.log(error);
        }
    };

    const wave = async () => {
        try {
            const { ethereum } = window;

            if (ethereum) {
                if (message.length === 0) {
                    console.log("Supply a message");
                    setMessageClass('required');
                    return;
                }

                setMessageClass('');
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

                let count = await wavePortalContract.getTotalWaves();
                console.log("Total wave count is: ", count.toNumber());

                const waveTxn = await wavePortalContract.wave(message, {gasLimit: 300000});
                console.log("Mining...", waveTxn.hash);

                await waveTxn.wait();
                console.log("Mined -- ", waveTxn.hash);

                count = await wavePortalContract.getTotalWaves();
                console.log("Total wave count is: ", count.toNumber());

                setMessage("");

            } else {
                console.log("Ethereum object does not exist");
            }

        } catch (error) {
            console.log(error);
        }
    }

    // Will run when the page loads
    useEffect(() => {
        checkIfWalletIsConnected();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
    return (
        <div className="mainContainer">

            <div className="dataContainer">
                <div className="header">
                👋 Hey there!
                </div>

                <div className="bio">
                I am farza and I worked on self-driving cars so that's pretty cool right? Connect your Ethereum wallet and wave at me!
                </div>

                <input type="text" className={messageClass} placeholder="Type your message" onChange={e => setMessage(e.target.value)} />
                <button className="waveButton" onClick={wave}>
                Wave at Me
                </button>

                {!currentAccount && (
                    <button className="waveButton" onClick={connectWallet}>
                    Connect wallet
                    </button>
                )}

                {allWaves.map((wave, index) => {
                    return (
                        <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
                            <div>Address: {wave.address}</div>
                            <div>Time: {wave.timestamp.toString()}</div>
                            <div>Message: {wave.message}</div>
                        </div>)
                })}

            </div>
        </div>
    );
}
