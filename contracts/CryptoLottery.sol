//SPDX-License-Identifier: Unlicensed

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract CryptoLottery is Ownable {

    // The initial ticket price
    uint256 ticketPrice = 0.01 ether;
    uint256 minimumTickets = 10;

    // Set the values for the payout (in %)
    uint256 firstPrizePayout = 50;
    uint256 secondPrizePayout = 20;
    uint256 thirdPrizePayout = 10;
    uint256 totalPrizePool = 80;

    // Hold a record of all tickets purchased
    address[] tickets;

    // Hold a record of all winners
    struct Winner {
        address plaer;
        uint256 timestamp;
        uint256 winnings;
    }

    // Store an array of winners
    Winner[] winners;

    // Events
    event TicketPurchased(address indexed from, uint256 timestamp);
    event DrawStarted(uint256 timestamp);
    event WinnerChosen(address indexed player, uint256 timestamp);

    constructor() payable {
        console.log("Contract method constructor called");
    }

    // Allow the purchase of a ticket for the ticket price
    function purchaseTicket() public payable {

        // Require the purchase to be for the ticket price
        require(
            msg.value == ticketPrice,
            "You must pay the ticket price"
        );

        // Add the ticket purchase
        tickets.push(msg.sender);

        // Emit event
        emit TicketPurchased(msg.sender, block.timestamp);

    }

    // Get all the tickets that have been purchased
    function getTickets() public view returns(address[] memory) {
        return tickets;
    }

    // Get all the tickets that have been purchased
    function getWinners() public view returns(Winner[] memory) {
        return winners;
    }

    // Get the latest ticket price
    function getTicketPrice() public view returns(uint256) {
        return ticketPrice;
    }

    // The owner can update the ticket price if required
    function setTicketPrice(uint256 newTicketPrice) public onlyOwner {
        ticketPrice = newTicketPrice;
    }

    // Start the prize draw
    function startDraw() public onlyOwner {

        require(
            tickets.length >= minimumTickets,
            "There needs to be at least 10 players to run a draw"
        );

        require(
            address(this).balance > 0,
            "A draw cannot be run when the contract balance is 0"
        );
        
        // Emit event
        emit DrawStarted(block.timestamp);

        // Get a random winner
        uint index = random() % tickets.length;
        console.log("Draw finished, player won: ", tickets[index]);

        // Pay the winner
        payWinner(payable(tickets[index]), calculateWinnings(1));
    }

    // This is the function that will pay out to the winner
    function payWinner(address payable player, uint prizeAmount) public payable onlyOwner {

        require(
            prizeAmount < address(this).balance,
            "Winner cannot win more than the contract balance"
        );

        // Emit event
        emit WinnerChosen(player, block.timestamp);
        
        // Transfer the player their winnings
        player.transfer(prizeAmount);

        // Save a record of the winner
        winners.push(Winner(msg.sender, block.timestamp, prizeAmount));

        // Reset the draw
        resetTickets();
    }

    // Once the draw has been done, reset the array of tickets
    function resetTickets() public onlyOwner {
        tickets = new address[](0);
    }

    // This will return the prize pool (80% of the contract balance)
    function calculateWinnings(uint16 _position) public view returns(uint256) {
        uint256 prizePortion;

        if (_position == 1) {
            prizePortion = firstPrizePayout;
        } else if (_position == 2) {
            prizePortion = secondPrizePayout;
        } else if (_position == 3) {
            prizePortion = thirdPrizePayout;
        }

        // Calculate the portal of the total prize pool i.e. for first 50% of prize pool (80% of contract balance)
        return (getPrizePool() / 100) * prizePortion;
    }

    // This will return the prize pool (80% of the contract balance)
    function getPrizePool() public view returns(uint256) {
        return (address(this).balance / 100) * totalPrizePool;
    }

    function random() private view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp)));
    }

}
