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

    // Send Wave
    let waveTxn = await contract.wave('This is wave #1');
    await waveTxn.wait(); // Wait for it to be mined

    waveTxn = await contract.wave('This is wave #2');
    await waveTxn.wait(); // Wait for it to be mined

    // Get contract balance
    contractBalance = await hre.ethers.provider.getBalance(contract.address);
    console.log(
        'Contract balance: ',
        hre.ethers.utils.formatEther(contractBalance)
    );

    let allWaves = await contract.getAllWaves();
    console.log(allWaves);
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