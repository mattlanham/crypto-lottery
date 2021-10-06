import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import TicketPurchased from './components/TicketPurchased.js';
import IncorrectNetwork from './components/IncorrectNetwork.js';
import AdminFunctions from './components/AdminFunctions.js';
import abi from './artifacts/contracts/CryptoLottery.sol/CryptoLottery.json';
import { TimeAgo } from './lib/helpers.js';

export default function App() {

    // Used to store the account we are working with
    const [currentAccount, setCurrentAccount] = useState("");
    const [ticketPrice, setTicketPrice] = useState(0);
    const [tickets, setTickets] = useState([]);
    const [winners, setWinners] = useState([]);
    const [prizePool, setPrizePool] = useState(0);
    const [purchasing, setPurchasing] = useState(false);
    const [ticketPurchased, setTicketPurchased] = useState(false);
    const [currentTickets, setCurrentTickets] = useState(0);
    const [currentNetwork, setCurrentNetwork] = useState(0);

    const contractAddress = "0x98a071dc643208c5AF3BF6727E879d92562601d6";
    const contractABI = abi.abi;

    const triggerInitialLoad = async () => {
        getCurrentTicketPrice();
        getTickets();
        getWinners();
        getPrizePool();
    };

    const getContract = () => {
        const { ethereum } = window;
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const cryptoLotteryContract = new ethers.Contract(contractAddress, contractABI, signer);
        
        return [cryptoLotteryContract, signer, provider];
    }

    const setupEvents = async () => {
        try {
            const [cryptoLotteryContract] = getContract();

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

            console.log("setting the network to ", parseInt(ethereum.networkVersion));
            setCurrentNetwork(parseInt(ethereum.networkVersion));

            // detect Network account change
            ethereum.on('chainChanged', function(chainId){
                console.log("Chain was updated", parseInt(chainId));
                console.log("setting the network to this ", parseInt(chainId));
                setCurrentNetwork(parseInt(chainId));
                triggerInitialLoad();
            });

            if (accounts.length !== 0) {
                const account = accounts[0];
                console.log("Found an authorized account:", account);
                setCurrentAccount(account);
                triggerInitialLoad();
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
                alert("You need to install MetaMask to continue");
                return;
            }

            setCurrentNetwork(parseInt(ethereum.networkVersion));

            const accounts = await ethereum.request({ method: "eth_requestAccounts" });

            console.log("Connected ", accounts[0]);
            setCurrentAccount(accounts[0]);
        } catch (error) {
            console.log(error);
        }
    }

    const getCurrentTicketPrice = async () => {
        try {
            const [cryptoLotteryContract] = getContract();
            const contractTicketPrice = await cryptoLotteryContract.getTicketPrice();

            setTicketPrice(contractTicketPrice);
            
        } catch (error) {
            console.log(error);
        }
    };

    const getTickets = async () => {
        console.log("called getTickets");
        
        try {
            const [cryptoLotteryContract, signer] = getContract();

            const walletAddress = await signer.getAddress();
            const contractTickets = await cryptoLotteryContract.getTickets();

            setTickets(contractTickets);

            let localCurrentTickets = 0;

            // This users tickets
            contractTickets.forEach(ticket => {
                if (ticket.toUpperCase() === walletAddress.toUpperCase()) {
                    localCurrentTickets++;
                }
            });

            setCurrentTickets(localCurrentTickets);


        } catch (error) {
            console.log(error);
        }
    };

    const getWinners = async () => {
        try {
            const [cryptoLotteryContract] = getContract();
            const contractWinners = await cryptoLotteryContract.getWinners();

            setWinners(contractWinners);

        } catch (error) {
            console.log(error);
        }
    };

    const purchaseTicket = async () => {
        try {
            const [cryptoLotteryContract] = getContract();

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
            const [cryptoLotteryContract] = getContract();

            const contractPrizePool = await cryptoLotteryContract.getPrizePool();

            setPrizePool(contractPrizePool);
        } catch (error) {
            console.log(error);
        }
    };

    const startDraw = async () => {
        try {
            const [cryptoLotteryContract] = getContract();

            const draw = await cryptoLotteryContract.startDraw();
            await draw.wait();

        } catch (error) {
            console.log(error);
        }
    };

    const adminFunction = async (action) => {
        try {
            const [cryptoLotteryContract] = getContract();

            let actionTxn;

            if (action === 'startDraw') {
                actionTxn = await cryptoLotteryContract.startDraw();
                await actionTxn.wait();
            } else if (action === 'withdrawBalance') {
                actionTxn = await cryptoLotteryContract.withdrawBalance();
                await actionTxn.wait();
            } else if (action === 'resetTickets') {
                actionTxn = await cryptoLotteryContract.resetTickets();
                await actionTxn.wait();
            } else if (action === 'setTicketPrice') {
                let newPrice = window.prompt("What is the new price?", 0);
                if (newPrice) {
                    actionTxn = await cryptoLotteryContract.setTicketPrice(ethers.utils.parseEther(newPrice));
                    await actionTxn.wait();
                }
            }

            triggerInitialLoad();

        } catch (error) {
            console.log(error);
        }
    };

    // Will run when the page loads
    useEffect(() => {
        checkIfWalletIsConnected();
        setupEvents();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
    return (
        <div className="content-center text-center">

            <div className="mt-16 mx-auto max-w-7xl px-4 sm:mt-10">
                <h1 className="mx-auto text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">Do you feel <span className="block text-indigo-600 xl:inline">lucky punk!?</span></h1>
                <p className="mt-3 text-base text-gray-500 sm:text-lg">Enter now for your chance to win!</p>
                {currentAccount && (
                    <>
                        <button className="hover:bg-gray-100 inline-flex text-base leading-6 shadow-lg ring-1 ring-black ring-opacity-10 text-lg text-black p-5 pl-10 pr-10 rounded-lg mt-5" onClick={purchaseTicket} disabled={purchasing}>
                            {!purchasing ? "Purchase a ticket" : 
                            (
                                <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Awaiting confirmation
                                </>
                            )
                            }
                        </button>

                        <p className="mt-5 text-gray-500">Current ticket price is: {ethers.utils.formatEther(ticketPrice)} ETH</p>
                        
                        {currentTickets > 0 && (
                            <div className="rounded-md bg-green-50 p-4 max-w-sm mx-auto mt-5">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-green-800">
                                            You've purchased {currentTickets} tickets for the next draw!
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
            {currentAccount && (
                <div className="bg-indigo-600 rounded-xl mt-10">
                    <div className="max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8 lg:py-10">
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
                    <button className="hover:bg-gray-100 shadow-lg ring-1 ring-black ring-opacity-10 text-lg text-black p-5 pl-10 pr-10 rounded-lg mt-5" onClick={connectWallet}>
                        Connect your MetaMask wallet
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

            {currentAccount && currentAccount.toUpperCase() === '0x14f686aF5C1370268C2C77973ea2b37feaa45CCF'.toUpperCase() && (
                <AdminFunctions onClickCallback={
                    adminFunction
                } />
            )}
    
            <p className="text-gray-500 mt-10 mb-10">Built by <a href="https://twitter.com/mattlanham" className="text-indigo-800" target="_blank" rel="noreferrer">@mattlanham</a>  <span className="pl-5 pr-5">|</span>  View the sourcecode on <a href="https://github.com/mattlanham/crypto-lottery" target="_blank" rel="noreferrer" className="text-indigo-800"> Github</a></p>
            
            {(currentNetwork !== 4 && currentAccount) && (
                <IncorrectNetwork />
            )}

        </div>
    );
}
