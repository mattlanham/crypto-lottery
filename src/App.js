import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from './artifacts/contracts/CryptoLottery.sol/CryptoLottery.json';

var TimeAgo = (function() {
    var self = {};
    
    // Public Methods
    self.locales = {
      prefix: '',
      sufix:  'ago',
      
      seconds: 'less than a minute',
      minute:  'about a minute',
      minutes: '%d minutes',
      hour:    'about an hour',
      hours:   'about %d hours',
      day:     'a day',
      days:    '%d days',
      month:   'about a month',
      months:  '%d months',
      year:    'about a year',
      years:   '%d years'
    };
    
    self.inWords = function(timeAgo) {
      var seconds = Math.floor((new Date() - parseInt(timeAgo)) / 1000),
          separator = this.locales.separator || ' ',
          words = this.locales.prefix + separator,
          interval = 0,
          intervals = {
            year:   seconds / 31536000,
            month:  seconds / 2592000,
            day:    seconds / 86400,
            hour:   seconds / 3600,
            minute: seconds / 60
          };
      
      var distance = this.locales.seconds;
      
      for (var key in intervals) {
        interval = Math.floor(intervals[key]);
        
        if (interval > 1) {
          distance = this.locales[key + 's'];
          break;
        } else if (interval === 1) {
          distance = this.locales[key];
          break;
        }
      }
      
      distance = distance.replace(/%d/i, interval);
      words += distance + separator + this.locales.sufix;
  
      return words.trim();
    };
    
    return self;
  }());

export default function App() {

    // Used to store the account we are working with
    const [currentAccount, setCurrentAccount] = useState("");
    const [ticketPrice, setTicketPrice] = useState(0);
    const [tickets, setTickets] = useState([]);
    const [winners, setWinners] = useState([]);
    const [prizePool, setPrizePool] = useState(0);

    const contractAddress = "0x30D625A0A00C66C24B9E66bcF22Ff2f295201728";
    const contractABI = abi.abi;

    const setupEvents = async () => {
        try {
            const { ethereum } = window;
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const cryptoLotteryContract = new ethers.Contract(contractAddress, contractABI, signer);

            cryptoLotteryContract.on("TicketPurchased", (from, timestamp) => {
                console.log("TicketPurchased", from, timestamp);

                // Update tickets total
                getTickets();

            });

            cryptoLotteryContract.on("WinnerChosen", (from, timestamp) => {
                console.log("WinnerChosen", from, timestamp);

                // Update winners
                getWinners();

            });

        } catch (error) {
            console.log(error);
        }
    };

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

    const getCurrentTicketPrice = async () => {
        try {
            const { ethereum } = window;
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const cryptoLotteryContract = new ethers.Contract(contractAddress, contractABI, signer);

            const contractTicketPrice = await cryptoLotteryContract.getTicketPrice();

            setTicketPrice(contractTicketPrice);

        } catch (error) {
            console.log(error);
        }
    };

    const getTickets = async () => {
        try {
            const { ethereum } = window;
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const cryptoLotteryContract = new ethers.Contract(contractAddress, contractABI, signer);

            const contractTickets = await cryptoLotteryContract.getTickets();

            setTickets(contractTickets);

        } catch (error) {
            console.log(error);
        }
    };

    const getWinners = async () => {
        try {
            const { ethereum } = window;
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const cryptoLotteryContract = new ethers.Contract(contractAddress, contractABI, signer);

            const contractWinners = await cryptoLotteryContract.getWinners();

            setWinners(contractWinners);

        } catch (error) {
            console.log(error);
        }
    };

    const purchaseTicket = async () => {
        try {
            const { ethereum } = window;
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const cryptoLotteryContract = new ethers.Contract(contractAddress, contractABI, signer);

            const ticket = cryptoLotteryContract.purchaseTicket({value: ticketPrice});
            await ticket.wait();

        } catch (error) {

        }
    }

    const getPrizePool = async () => {
        try {
            const { ethereum } = window;
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const cryptoLotteryContract = new ethers.Contract(contractAddress, contractABI, signer);

            const contractPrizePool = await cryptoLotteryContract.getPrizePool();

            setPrizePool(contractPrizePool);
        } catch (error) {
            console.log(error);
        }
    };

    const startDraw = async () => {
        try {
            const { ethereum } = window;
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const cryptoLotteryContract = new ethers.Contract(contractAddress, contractABI, signer);

            const draw = await cryptoLotteryContract.startDraw();
            await draw.wait();

        } catch (error) {
            console.log(error);
        }
    };

    // Will run when the page loads
    useEffect(() => {
        checkIfWalletIsConnected();
        getCurrentTicketPrice();
        getTickets();
        getWinners();
        getPrizePool();
        setupEvents();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
    return (
        <div className="mainContainer text-center">

            <h1 className="mt-10 font-sans text-4xl text-white">Welcome to CryptoLottery</h1>
            <p className="text-white font-sans text-lg pt-5">A simple project to learn solidity and web3 by creating a lottery</p>

            <p className="text-white font-sans text-lg pt-5">The next draw currently has {tickets.length} tickets</p>
            <p className="text-white font-sans text-lg pt-5">The total prize pool is: {ethers.utils.formatEther(prizePool)} ETH</p>
            {!currentAccount && (
                <button className="waveButton" onClick={connectWallet}>
                    Connect wallet
                </button>
            )}

            {currentAccount && (
                <>
                    <button className="bg-white text-lg text-blue-900 p-5 pl-10 pr-10 rounded mt-10" onClick={purchaseTicket}>
                        Purchase a ticket
                    </button>
                    <p className="mt-5 text-white">Current ticket price is: {ethers.utils.formatEther(ticketPrice)} ETH</p>
                </>
            )}

            <div className="grid grid-cols-2 gap-4">

                <div className="mt-10">
                    <p className="text-white text-xl mb-5 font-bold">Entrants</p>
                    {tickets.length === 0 && (
                        <p className="mt-5 text-white">There are currently no entrants!</p>
                    )}
                    {tickets.map((ticket, index) => {
                        return (
                            <div key={index}>
                                <div>{ticket}</div>
                            </div>)
                    })}
                </div>
                <div className="mt-10">
                    <p className="text-white text-xl mb-5 font-bold">Previous winners</p>
                    {winners.length === 0 && (
                        <p className="mt-5 text-white">There have been no winners</p>
                    )}
                    {winners.map((winner, index) => {
                        return (
                            <div className="shadow rounded bg-gray-600 p-5 mb-5" key={index}>
                                <p className="text-white">{winner.plaer}</p>
                                <p className="text-white">{TimeAgo.inWords(winner.timestamp.toString() * 1000)}</p>
                                <p className="text-white">{ethers.utils.formatEther(winner.winnings)} ETH</p>
                            </div>)
                    })}
                </div>
            </div>

            <button className="bg-white text-lg text-blue-900 p-5 pl-10 pr-10 rounded mt-10" onClick={startDraw}>
                Start Draw
            </button>
            
        </div>
    );
}
