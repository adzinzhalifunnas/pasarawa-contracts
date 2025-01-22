// Student ID (NIM) : 2602063144
// Name             : Adzin Zhalifunnas
// Course           : DTSC6017001 – Advanced Blockchain Programming
// Lecturer         : D3579 – Dr. Ir. Alexander Agung Santoso Gunawan, S.Si., M.T., M.Sc.
// University       : BINUS University
// Type             : Final Exam (Individual)

// Required modules
const HDWalletProvider = require('@truffle/hdwallet-provider'); // For managing wallet and provider
const { Web3 } = require('web3'); // Web3 module for interacting with the Ethereum network
const dotenv = require('dotenv'); // For loading environment variables
const fs = require('fs'); // For filesystem operations
const axios = require('axios'); // For HTTP requests

// Load environment variables from .env file
dotenv.config();

// Validate environment variables
const { MNEMONIC, INFURA_URL, ETHERSCAN_API_KEY } = process.env;
if (!MNEMONIC || !INFURA_URL || !ETHERSCAN_API_KEY) {
    console.error("Error: Please ensure MNEMONIC, INFURA_URL, and ETHERSCAN_API_KEY are set in your .env file.");
    process.exit(1);
}

/**
 * Loads the compiled contract JSON file dynamically.
 * @param {string} contractPath - The path to the compiled contract JSON file.
 * @returns {object} - The compiled contract data (ABI and bytecode).
 */
function loadCompiledContract(contractPath) {
    if (!fs.existsSync(contractPath)) {
        throw new Error(`Compiled contract file not found: ${contractPath}`);
    }
    return require(contractPath);
}

/**
 * Verifies the deployed smart contract on Etherscan.
 * @param {string} contractAddress - The deployed contract address.
 * @param {string} contractSourcePath - Path to the Solidity source file.
 * @param {string} contractName - The name of the contract (e.g., ":MyContract").
 * @param {string} compilerVersion - The Solidity compiler version (e.g., "v0.8.19+commit.7dd6d404").
 * @param {boolean} optimizationUsed - Whether optimization was used (1 for true, 0 for false).
 * @param {number} runs - The number of optimization runs (e.g., 200).
 */
async function verifyContract(
    contractAddress,
    contractSourcePath,
    contractName,
    compilerVersion,
    optimizationUsed,
    runs
) {
    try {
        console.log(`Verifying contract ${contractName} on Etherscan...`);

        // Read the Solidity source code
        const sourceCode = fs.readFileSync(contractSourcePath, 'utf8');

        // Prepare API request payload
        const payload = {
            apikey: ETHERSCAN_API_KEY,
            module: 'contract',
            action: 'verifysourcecode',
            contractaddress: contractAddress,
            sourceCode: sourceCode,
            codeformat: 'solidity-single-file',
            contractname: contractName,
            compilerversion: compilerVersion,
            optimizationUsed: optimizationUsed ? 1 : 0,
            runs: runs,
        };

        // Send request to Etherscan
        const response = await axios.post(`https://api-sepolia.etherscan.io/api`, null, {
            params: payload,
        });

        // Handle response
        if (response.data.status === '1') {
            console.log('Contract verified successfully! You can check the status at Etherscan.');
        } else {
            console.error('Verification failed:', response.data.result);
        }
    } catch (error) {
        console.error('Verification error:', error);
    }
}

/**
 * Deploys a smart contract to the blockchain network.
 * @param {string} contractPath - Path to the compiled contract JSON file.
 */
async function deployContract(contractPath) {
    try {
        const compiledContract = loadCompiledContract(contractPath);

        // Initialize provider and Web3 instance
        const provider = new HDWalletProvider(MNEMONIC, INFURA_URL);
        const web3 = new Web3(provider);

        // Get accounts from the wallet
        const accounts = await web3.eth.getAccounts();
        console.log('Attempting to deploy from account:', accounts[0]);

        try {
            const result = await new web3.eth.Contract(compiledContract.abi)
                .deploy({ data: compiledContract.bytecode })
                .send({ 
                    gas: '2000000', 
                    gasPrice: web3.utils.toWei('20', 'gwei'),
                    from: accounts[0] 
                });

            console.log('Contract deployed to:', result.options.address);
            console.log('View on Etherscan: https://sepolia.etherscan.io/address/' + result.options.address);
        } catch (error) {
            console.error('Deployment error:', error);
        }

        // Verify the contract on Etherscan
        try {
            if (result && result.options && result.options.address) {
                await verifyContract(
                    result.options.address,
                    contractPath.replace('.json', '.sol'),
                    Object.keys(compiledContract.abi)[0],
                    '0.8.24+commit.e11b9ed9',
                    true,
                    200
                );
            } else {
                console.error('Verification skipped: Contract deployment failed.');
            }
        } catch (error) {
            console.error('Verification error:', error);
        }

    } catch (error) {
        console.error('Deployment error:', error);
    } finally {
        // Ensure the provider is stopped
        if (provider) {
            provider.engine.stop();
        }
    }
}

/**
 * Main function to execute the deployment process.
 */
function main() {
    const contractPath = process.argv[2]; // Path to the compiled contract JSON file

    // Validate if the contract path is provided
    if (!contractPath) {
        console.error("Error: Please provide the path to the compiled contract JSON file as an argument.");
        console.error("Usage: node deploy.js [./compile/file.json]");
        process.exit(1);
    }

    // Validate if the contract file exists
    if (!fs.existsSync(contractPath)) {
        console.error(`Error: Compiled contract file not found at ${contractPath}.`);
        process.exit(1);
    }

    // Deploy the contract
    deployContract(contractPath).catch((err) => {
        console.error('Error during deployment process:', err);
        process.exit(1);
    });
}

// Execute the main function
main();