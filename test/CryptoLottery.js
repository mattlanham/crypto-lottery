const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CryptoLottery", function () {
  it("Should return new price once changed", async function () {
    const CryptoLottery = await ethers.getContractFactory("CryptoLottery");
    const lottery = await CryptoLottery.deploy();
    await lottery.deployed();

    expect(await lottery.getTicketPrice()).to.equal(ethers.utils.formatEther('0.01'));

    const setTicketPriceTx = await lottery.setTicketPrice("0.02");

    // wait until the transaction is mined
    await setTicketPriceTx.wait();

    expect(await lottery.getTicketPrice()).to.equal("0.02");
  });
});