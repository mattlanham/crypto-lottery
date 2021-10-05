const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CryptoLottery", function () {

  let owner;
  let addr1;
  let addr2;
  let addrs;

  before(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();


    this.CryptoLottery = await ethers.getContractFactory('CryptoLottery');
    this.lottery = await this.CryptoLottery.deploy({
      value: ethers.utils.parseEther('0.1')
    });
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

    expect(await this.lottery.getTicketPrice()).to.equal(ethers.utils.parseEther('0.02'));
  });

  it("Should not be able to run prize draw with zero tickets", async function () {
    await expect(
      this.lottery.startDraw()
    ).to.be.revertedWith('There needs to be at least 10 players to run a draw');
  });

  it("Should not allow a ticket to be purchased for more than the ticket price", async function () {
    await expect(
      this.lottery.purchaseTicket({value: ethers.utils.parseEther('0.03')})
    ).to.be.revertedWith('You must pay the ticket price');
  });

  it("Should not allow a ticket to be purchased for less than the ticket price", async function () {
    await expect(
      this.lottery.purchaseTicket({value: ethers.utils.parseEther('0.001')})
    ).to.be.revertedWith('You must pay the ticket price');
  });

  it("Should allow the ticket to be purchased for 0.02 eth", async function () {
    const setTicketPriceTx = await this.lottery.purchaseTicket({value: ethers.utils.parseEther('0.02')});
    await setTicketPriceTx.wait();

    expect(await this.lottery.getTickets()).lengthOf(1);

  });

  it("Should allow multiple tickets to be purchased for 0.02 eth each", async function () {
    let setTicketPriceTx = await this.lottery.purchaseTicket({value: ethers.utils.parseEther('0.02')});
    await setTicketPriceTx.wait();

    setTicketPriceTx = await this.lottery.purchaseTicket({value: ethers.utils.parseEther('0.02')});
    await setTicketPriceTx.wait();

    setTicketPriceTx = await this.lottery.purchaseTicket({value: ethers.utils.parseEther('0.02')});
    await setTicketPriceTx.wait();

    setTicketPriceTx = await this.lottery.purchaseTicket({value: ethers.utils.parseEther('0.02')});
    await setTicketPriceTx.wait();

    setTicketPriceTx = await this.lottery.purchaseTicket({value: ethers.utils.parseEther('0.02')});
    await setTicketPriceTx.wait();

    setTicketPriceTx = await this.lottery.purchaseTicket({value: ethers.utils.parseEther('0.02')});
    await setTicketPriceTx.wait();

    setTicketPriceTx = await this.lottery.purchaseTicket({value: ethers.utils.parseEther('0.02')});
    await setTicketPriceTx.wait();

    setTicketPriceTx = await this.lottery.purchaseTicket({value: ethers.utils.parseEther('0.02')});
    await setTicketPriceTx.wait();

    setTicketPriceTx = await this.lottery.purchaseTicket({value: ethers.utils.parseEther('0.02')});
    await setTicketPriceTx.wait();

    setTicketPriceTx = await this.lottery.purchaseTicket({value: ethers.utils.parseEther('0.02')});
    await setTicketPriceTx.wait();

    expect(await this.lottery.getTickets()).lengthOf(11);

  });

  it("Should not allow draw to start if not the owner", async function () {
    await expect(
      this.lottery.connect(addr1).startDraw()
    ).to.be.revertedWith('Ownable: caller is not the owner');
  });

  it("Should not allow winner to be paid if not the owner", async function () {
    await expect(
      this.lottery.connect(addr1).payWinner(addr2.address, 10000)
    ).to.be.revertedWith('Ownable: caller is not the owner');
  });

  it("Should not be able to run prize draw with zero tickets", async function () {
    await this.lottery.startDraw()
  });

});