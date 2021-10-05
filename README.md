# Crypto Lottery

This project has been setup to learn more about web3 and solidity by creating a simple lottery concept, this allows people to purchase tickets and enter a weekly prize draw. There are some rules to follow which will be implemented via the smart contract, and this allows for testing of various validation.

You can see the project in action here:
https://crypto-lottery.vercel.app/


For development I am using Alchemy, and you can easily set this up for your local development environment. Simply create a `.env` in your root directory with the following:

```
STAGING_ALCHEMY_KEY=BLAHBLAH
PROD_ALCHEMY_KEY=BLAHBLAH
PRIVATE_KEY=WALLET_PRIVATE_KEY
```

Remember. Never commit the `.env` file! 

To use the project, you have the following commands available to you:

```shell

// Start the front end node server
npm start

// Run the tests
npx hardhat test

// Deploy the contract (locally with hardhat)
npx hardhat run scripts/run.js

// Deploy the contract (testnet Rinkeby)
npx hardhat run scripts/deploy.js --network rinkeby

```


The project uses hardhat, so the usual commands also work such as:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
npx hardhat help
```
