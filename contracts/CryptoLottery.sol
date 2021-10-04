//SPDX-License-Identifier: Unlicensed

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract CryptoLottery is Ownable {

    // The initial ticket price
    uint256 ticketPrice = 0.0001 ether;

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

    Winner[] winners;

    // Events
    event TicketPurchased(address indexed from, uint256 timestamp);

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
        uint index = random() % tickets.length;
        console.log("Draw finished, player won: ", tickets[index]);

        payWinner(payable(tickets[index]));
    }

    // This is the function that will pay out to the winner
    function payWinner(address payable player) public payable onlyOwner {
        // Transfer the player their winnings
        // player.transfer(address(this).balance);

        // Save a record of the winner
        winners.push(Winner(msg.sender, block.timestamp, 0.001 ether));

        // Reset the draw
        resetTickets();
    }

    function resetTickets() public onlyOwner {
        tickets = new address[](0);
    }

    // This will return the prize pool (80% of the contract balance)
    function getPrizePool() public view returns(uint256) {
        return (address(this).balance / 100) * totalPrizePool;
    }

    function random() private view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp)));
    }

}
