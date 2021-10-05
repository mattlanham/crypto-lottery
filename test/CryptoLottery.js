const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CryptoLottery", function () {

  before(async function () {
    this.CryptoLottery = await ethers.getContractFactory('CryptoLottery');
    this.lottery = await this.CryptoLottery.deploy();
    await this.lottery.deployed();
  });

  it("Should have zero tickets initially", async function () {
    expect(await this.lottery.getTickets()).lengthOf(0);
  });

  it("Should have zero winners initially", async function () {
    expect(await this.lottery.getWinners()).lengthOf(0);
  });

  it("Should have a default ticket price of 0.01 eth", async function () {
    expect(await this.lottery.getTicketPrice()).to.equal(ethers.utils.parseEther('0.01'));
  });

  it("Should allow the ticket price to be changed to 0.02", async function () {
    const setTicketPriceTx = await this.lottery.setTicketPrice(ethers.utils.parseEther('0.02'));
    await setTicketPriceTx.wait();
  });

  it("Should have a new ticket price of 0.02 eth", async function () {
    expect(await this.lottery.getTicketPrice()).to.equal(ethers.utils.parseEther('0.02'));
  });

  it("Should not be able to run prize draw with zero tickets", async function () {
    await expect(this.lottery.startDraw()).to.be.revertedWith('There needs to be at least 10 players to run a draw');
  });

  it("Should not allow a ticket to be purchased for more than the ticket price", async function () {
    await expect(this.lottery.purchaseTicket({value: ethers.utils.parseEther('0.03')})).to.be.revertedWith('You must pay the ticket price');
  });

  it("Should not allow a ticket to be purchased for less than the ticket price", async function () {
    await expect(this.lottery.purchaseTicket({value: ethers.utils.parseEther('0.001')})).to.be.revertedWith('You must pay the ticket price');
  });

  it("Should allow the ticket to be purchased for 0.02 eth", async function () {
    const setTicketPriceTx = await this.lottery.purchaseTicket({value: ethers.utils.parseEther('0.02')});
    await setTicketPriceTx.wait();

    expect(await this.lottery.getTickets()).lengthOf(1);

  });

});