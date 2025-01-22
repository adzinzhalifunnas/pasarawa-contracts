// Student ID (NIM) : 2602063144
// Name             : Adzin Zhalifunnas
// Course           : DTSC6017001 – Advanced Blockchain Programming
// Lecturer         : D3579 – Dr. Ir. Alexander Agung Santoso Gunawan, S.Si., M.T., M.Sc.
// University       : BINUS University
// Type             : Final Exam (Individual)

// Required Node.js modules
const path = require("path");
const solc = require("solc"); // Solidity compiler
const fs = require("fs-extra"); // File system utilities

// Get the Solidity file name from CLI arguments
const fileName = process.argv[2];
if (!fileName) {
    console.error("Error: Please provide the Solidity file name as an argument.");
    process.exit(1);
}

// Define the path to the compile directory
const compilePath = path.resolve(__dirname, "compile");

/**
 * Clears the compile directory.
 */
function clearCompileDirectory() {
    fs.removeSync(compilePath);
    fs.ensureDirSync(compilePath);
}

/**
 * Reads the Solidity file content.
 * @param {string} contractPath - The path to the Solidity file.
 * @returns {string} - The content of the Solidity file.
 */
function readContractSource(contractPath) {
    try {
        return fs.readFileSync(contractPath, "utf8");
    } catch (error) {
        throw new Error(`Failed to read contract file: ${error.message}`);
    }
}

/**
 * Compiles the Solidity contract.
 * @param {string} source - The Solidity source code.
 * @param {string} fileName - The name of the Solidity file.
 * @returns {object} - The compiled output.
 */
function compileContract(source, fileName) {
    const input = {
        language: "Solidity",
        sources: {
            [fileName]: { content: source },
        },
        settings: {
            outputSelection: {
                "*": {
                    "*": ["abi", "evm.bytecode.object"],
                },
            },
        },
    };

    try {
        return JSON.parse(solc.compile(JSON.stringify(input)));
    } catch (error) {
        throw new Error(`Compilation failed: ${error.message}`);
    }
}

/**
 * Writes the compiled contract data to the compile directory.
 * @param {object} compiledOutput - The compiled contract output.
 * @param {string} fileName - The name of the Solidity file.
 */
function writeCompiledContracts(compiledOutput, fileName) {
    for (const [contractName, contractData] of Object.entries(compiledOutput.contracts[fileName])) {
        const contractOutput = {
            abi: contractData.abi,
            bytecode: contractData.evm.bytecode.object,
        };

        fs.outputJsonSync(
            path.resolve(compilePath, `${contractName}.json`),
            contractOutput
        );

        console.log(`Compiled ${contractName} to ./compile/${contractName}.json`);
    }
}

/**
 * Main function to compile the contract.
 */
function main() {
    clearCompileDirectory();

    const contractPath = path.resolve(__dirname, "contracts", fileName);
    const source = readContractSource(contractPath);
    const compiledOutput = compileContract(source, fileName);

    writeCompiledContracts(compiledOutput, fileName);
}

// Run the main function
try {
    main();
} catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
}