const main = async () => {
    const contractFactory = await hre.ethers.getContractFactory('CryptoLottery');
    const contract = await contractFactory.deploy({
        value: hre.ethers.utils.parseEther('0.001'),
    });

    await contract.deployed();
    console.log('CryptoLottery address: ', contract.address);
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