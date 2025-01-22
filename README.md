# Pasarawa Contracts Project

This project is designed for managing smart contracts related to an online marketplace called Pasarawa. It provides the tools to develop, compile, deploy, and verify Solidity-based contracts on the Ethereum blockchain.

## Project Information

This project is part of the final exam for the **Advanced Blockchain Programming** course at BINUS University. Below are the details:

- **Student ID (NIM):** 2602063144
- **Name:** Adzin Zhalifunnas
- **Course:** DTSC6017001 – Advanced Blockchain Programming
- **Lecturer:** D3579 – Dr. Ir. Alexander Agung Santoso Gunawan, S.Si., M.T., M.Sc.
- **University:** BINUS University
- **Type:** Final Exam (Individual)

## Project Structure

```
Pasarawa-Contracts/
├── contracts/         # Contains Solidity contract files
├── compile/           # Output directory for compiled contract JSON
├── deploy.js          # Script for deploying contracts to the blockchain
├── compile.js         # Script for compiling Solidity contracts
├── .env               # Environment configuration file
├── package.json       # Project dependencies and scripts
├── README.md          # Project documentation
```

## Prerequisites

Before running the project, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A valid Infura project URL
- A wallet mnemonic for deployment
- An Etherscan API key for contract verification

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/adzinzhalifunnas/pasarawa-contracts.git
   cd pasarawa-contracts
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the `.env` file:
   Create a `.env` file in the project root with the following variables:
   ```env
   MNEMONIC="your-wallet-mnemonic"
   INFURA_URL="https://sepolia.infura.io/v3/YOUR-INFURA-PROJECT-ID"
   ETHERSCAN_API_KEY="your-etherscan-api-key"
   ```

## Usage

### 1. Writing Smart Contracts

Write your smart contracts in the `contracts/` directory. Use `.sol` as the file extension. For example:

```
contracts/
└── Pasarawa.sol
```

### 2. Compiling Contracts

Run the `compile.js` script to compile your contracts:

```bash
node compile.js Pasarawa.sol
```

The compiled output will be stored in the `compile/` directory.

### 3. Deploying Contracts

Deploy the compiled contract to the Ethereum network using `deploy.js`:

```bash
node deploy.js ./compile/Pasarawa.json
```

During deployment, the script will:
- Use the wallet mnemonic from `.env`.
- Deploy the contract to the specified network (via Infura).
- Automatically attempt to verify the contract on Etherscan.

### 4. Verifying Contracts on Etherscan

If the contract deployment is successful, the script will submit the contract for verification on Etherscan. Ensure your Etherscan API key is correctly set in the `.env` file.

## Example

1. **Compile:**
   ```bash
   node compile.js Pasarawa.sol
   ```

2. **Deploy:**
   ```bash
   node deploy.js ./compile/Pasarawa.json
   ```

3. **Output:**
   ```
   Attempting to deploy from account: 0xYourAccount
   Contract deployed to: 0xYourContractAddress
   View on Etherscan: https://sepolia.etherscan.io/address/0xYourContractAddress
   Contract verified successfully! You can check the status at Etherscan.
   ```

## Troubleshooting

- **`TransactionBlockTimeoutError`:** Increase `gasPrice` or ensure there are no pending transactions.
- **Environment Errors:** Check that `.env` contains the correct values for `MNEMONIC`, `INFURA_URL`, and `ETHERSCAN_API_KEY`.

## License

This project is licensed under the [MIT License](LICENSE).