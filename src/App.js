import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import TicketPurchased from './TicketPurchased.js';
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
    const [purchasing, setPurchasing] = useState(false);
    const [ticketPurchased, setTicketPurchased] = useState(false);

    const contractAddress = "0x05ed1b08eF2CcB5c6Eb867638cFA9FD73a09687e";
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
                getPrizePool();

            });

            cryptoLotteryContract.on("WinnerChosen", (from, timestamp) => {
                console.log("WinnerChosen", from, timestamp);

                // Update winners
                getWinners();
                getTickets();
                getPrizePool();

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

            setPurchasing(true);
            const ticket = await cryptoLotteryContract.purchaseTicket({value: ticketPrice});
            await ticket.wait();

            setPurchasing(false);
            setTicketPurchased(true);

        } catch (error) {
            console.log(error);
            setPurchasing(false);
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
        <div className="content-center text-center">

            <div className="mt-16 mx-auto max-w-7xl px-4 sm:mt-20">
                <h1 className="mx-auto text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">Do you feel <span className="block text-indigo-600 xl:inline">lucky punk!?</span></h1>
                <p className="mt-3 text-base text-gray-500 sm:text-lg">Enter now for your chance to win!</p>
                {currentAccount && (
                    <>
                        <button className="hover:bg-gray-100 shadow-lg ring-1 ring-black ring-opacity-10 text-lg text-black p-5 pl-10 pr-10 rounded-lg mt-5" onClick={purchaseTicket} disabled={purchasing}>
                            {!purchasing ? "Purchase a ticket" : "Awaiting confirmation"}
                        </button>
                        <p className="mt-5 text-gray-500">Current ticket price is: {ethers.utils.formatEther(ticketPrice)} ETH</p>

                    </>
                )}
            </div>
            {currentAccount && (
                <div className="bg-indigo-800 rounded-xl mt-10">
                    <div className="max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8 lg:py-20">
                        <div className="max-w-4xl mx-auto text-center">
                            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                                The most transparent lottery you've every played!
                            </h2>
                            <p className="mt-3 text-xl text-indigo-200 sm:mt-4">
                                All mechanics are driven by a smart contract using the latest web3 technology.
                            </p>
                        </div>
                        <dl className="mt-10 text-center sm:max-w-3xl sm:mx-auto sm:grid sm:grid-cols-2 sm:gap-8">
                            <div className="flex flex-col">
                                <dt className="order-2 mt-2 text-lg leading-6 font-medium text-indigo-200">
                                Prize Pool
                                </dt>
                                <dd className="order-1 text-5xl font-extrabold text-white">
                                {ethers.utils.formatEther(prizePool)} ETH
                                </dd>
                            </div>
                            <div className="flex flex-col mt-10 sm:mt-0">
                                <dt className="order-2 mt-2 text-lg leading-6 font-medium text-indigo-200">
                                Entrants
                                </dt>
                                <dd className="order-1 text-5xl font-extrabold text-white">
                                    {tickets.length}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            )}

           

            {!currentAccount && (
                <>
                    <button className="shadow text-lg text-blue-900 p-5 pl-10 pr-10 rounded mt-10" onClick={connectWallet}>
                        Connect your wallet
                    </button>
                    <p className="mt-5 text-white">Once your wallet is connected, you'll see the total entrants, prize pool and previous winners.</p>
                </>
            )}

            {(currentAccount && true==false) && (
                <>
                    
                    <div className="grid grid-cols-2 gap-4">

                        <div className="mt-10">
                            <p className="text-xl mb-5 font-bold">Entrants</p>
                            {tickets.length === 0 && (
                                <p className="mt-5 text-white">There are currently no entrants!</p>
                            )}
                            {tickets.map((ticket, index) => {
                                return (
                                    <div className="shadow rounded bg-gray-600 p-5 mb-5" key={index}>
                                        <p className="text-white">{ticket}</p>
                                    </div>)
                            })}
                        </div>
                        <div className="mt-10">
                            <p className="text-xl mb-5 font-bold">Previous winners</p>
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
                </>
            )}

            {ticketPurchased && (
                <TicketPurchased onClick={
                    setTicketPurchased
                } />
            )}
            
            
        </div>
    );
}
