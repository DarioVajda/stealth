# Implementing Stealth Address protocol on Ethereum network

This project was done during [web3 camp](https://web3kamp.org/) in Petnica Science Center. Stealth addresses allow users to anonymously recieve transactions. They work by creating a new address (called stealth address) based on the users' public Ethereum address. Transaction is then sent to this address - only the user, based on whose Ethereum address the stealth address was created can access the sent funds. Anonymity is guaranteed because no one, except the sender, can link the users' stealth address with his public Ethereum address. For implementing algorithms realated to this protocol, we heavily relied on [this](https://vitalik.eth.limo/general/2023/01/20/stealth.html) article.

We wrote a frontend application and smart contact which implement this protocol. Users can:
* generate their meta address and publish them on the smart contract
* send ETH or ERC20 tokens to someone's stealth address
* check whether they have recieved some funds on their stealth address

Generation of stealth addresses is mostly written in the `frontend/src/logic/logic.js` file. Source code of the smart contract is located in `smart_contracts/contracts/StealthAddressContract.sol`. The contract was deployed to Sepolia test network.