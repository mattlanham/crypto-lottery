const { ethers } = require("ethers");

const main = async () => {
    const contractFactory = await hre.ethers.getContractFactory("CryptoLottery");
    const contract = await contractFactory.deploy({
        value: hre.ethers.utils.parseEther('0.1')
    });
    await contract.deployed();
    console.log("Contract deployed to: ", contract.address);

    // Get contract balance
    let contractBalance = await hre.ethers.provider.getBalance(
        contract.address
    );

    console.log(
        'Contract balance: ',
        hre.ethers.utils.formatEther(contractBalance)
    );

    // Get ticket price
    let ticketPrice = await contract.getTicketPrice();
    console.log("The ticket price is: ", hre.ethers.utils.formatEther(ticketPrice));

    // Purchase a ticket
    let purchaseTicket = await contract.purchaseTicket({
        value: hre.ethers.utils.parseEther('0.01')
    });
    await purchaseTicket.wait();

    // Purchase a ticket
    purchaseTicket = await contract.purchaseTicket({
        value: hre.ethers.utils.parseEther('0.01')
    });
    await purchaseTicket.wait();

    // Get tickets
    let tickets = await contract.getTickets();
    console.log("Here are the tickets:", tickets);

    // Get contract balance
    let prizePool = await contract.getPrizePool();
    console.log("Total prize pool:", hre.ethers.utils.formatEther(prizePool));

    // Get contract balance
    contractBalance = await hre.ethers.provider.getBalance(
        contract.address
    );
    console.log(
        'Contract balance: ',
        hre.ethers.utils.formatEther(contractBalance)
    );

    // Perform a prize draw
    let prizeDraw = await contract.startDraw();
    await prizeDraw.wait();

    // Get tickets
    tickets = await contract.getTickets();
    console.log("Here are the tickets:", tickets);

    // Get winners
    let winners = await contract.getWinners();
    console.log("Here are the winners:", winners);

    // Get contract balance
    contractBalance = await hre.ethers.provider.getBalance(
        contract.address
    );
    console.log(
        'Contract balance: ',
        hre.ethers.utils.formatEther(contractBalance)
    );


};

const runMain = async () => {
    try {
        await main();
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

runMain();