// Student ID (NIM) : 2602063144
// Name             : Adzin Zhalifunnas
// Course           : DTSC6017001 – Advanced Blockchain Programming
// Lecturer         : D3579 – Dr. Ir. Alexander Agung Santoso Gunawan, S.Si., M.T., M.Sc.
// University       : BINUS University
// Type             : Final Exam (Individual)

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title Pasarawa
 * @dev A simple smart contract for managing an decentralized marketplace.
 */
contract Pasarawa {
    // Struct representing a product in the marketplace.
    struct Product {
        uint256 id; // Unique identifier for the product.
        string name; // Name of the product (max 50 characters).
        string description; // Description of the product (max 256 characters).
        uint256 price; // Price of the product in Wei. (1 Ether = 1^18 Wei)
        ProductStatus status; // Current status of the product (Available, Sold, or Cancelled).
        address payable seller; // Address of the seller who registered the product.
        address buyer; // Address of the buyer who purchased the product.
        bytes32 shippingReceipt; // Hash of the shipping receipt, provided by the seller after shipping.
    }

    // Enum representing possible product statuses.
    enum ProductStatus { Sold, Available, Cancelled }

    // Mapping of product IDs to Product structs.
    mapping(uint256 => Product) public products;

    // Counter for the next product ID.
    uint256 private nextProductId = 1;

    // Total number of products registered.
    uint256 public productCount = 0;

    // Event emitted when a product is registered.
    event ProductRegistered(uint256 _id, string _name, string _description, uint256 _price, address _seller);

    // Event emitted when a product is purchased.
    event ProductPurchased(uint256 _id, address _buyer);

    // Event emitted when a product's status changes.
    event ProductStatusChanged(uint256 _id, ProductStatus _status);

    // Event emitted when a product is shipped.
    event ProductShipped(uint256 _id, bytes32 _shippingReceipt);

    /**
     * @notice Registers a new product in the marketplace.
     * @param _name The name of the product (1-50 characters).
     * @param _description The description of the product (1-256 characters).
     * @param _price The price of the product in Wei.
     * No. 2 - Function to register products with details (name, description, price).
     */
    function registerProduct(
        string memory _name,
        string memory _description,
        uint256 _price
    ) external {
        require(bytes(_name).length > 0 && bytes(_name).length <= 50, "Product name must be between 1 and 50 characters");
        require(bytes(_description).length > 0 && bytes(_description).length <= 256, "Product description must be between 1 and 256 characters");
        require(_price > 0, "Product price must be greater than 0");

        uint256 id = nextProductId; // Assign a unique ID to the product.
        // Create a new Product struct and store it in the products mapping.
        products[id] = Product({
            id: id,
            name: _name,
            description: _description,
            price: _price,
            status: ProductStatus.Available,
            seller: payable(msg.sender),
            buyer: address(0),
            shippingReceipt: ""
        });

        // Emit events for the product registration and status change.
        emit ProductRegistered(id, _name, _description, _price, msg.sender);
        emit ProductStatusChanged(id, ProductStatus.Available);

        nextProductId++; // Increment the product ID counter.
        productCount++; // Increment the total product count.
    }

    /**
     * @notice Purchases a product from the marketplace.
     * @param _id The ID of the product to purchase.
     * No. 2 - Functions for purchasing products, including managing funds through payables.
     */
    function purchaseProduct(uint256 _id) external payable {
        Product storage product = products[_id];
        require(product.id == _id, "Product does not exist");
        require(product.status == ProductStatus.Available, "Product must be available");
        require(msg.value == product.price, "The value must match the product price");
        require(msg.sender != product.seller, "Seller cannot purchase their own product");

        product.buyer = msg.sender; // Assign the buyer to the product.
        product.status = ProductStatus.Sold; // Update the product status to Sold.
        product.seller.transfer(msg.value); // Transfer the payment to the seller.

        // Emit events for the product purchase and status change.
        emit ProductPurchased(_id, msg.sender);
        emit ProductStatusChanged(_id, ProductStatus.Sold);
    }

    /**
     * @notice Changes the status of a product, except to Sold.
     * @param _id The ID of the product whose status is to be changed.
     * @param _status The new status (Available or Cancelled).
     * No. 2 - Transaction status management (sold, available, or cancelled).
     */
    function manageTransactionStatus(uint256 _id, ProductStatus _status) external {
        Product storage product = products[_id];
        require(product.id == _id, "Product does not exist");
        require(product.status != ProductStatus.Sold, "Cannot change status of a sold product");
        require(_status != ProductStatus.Sold, "Cannot change status to Sold");
        require(product.status != _status, "Product status must be different");
        require(msg.sender == product.seller, "Only seller can change product status");

        product.status = _status; // Update the product status.
        emit ProductStatusChanged(_id, _status); // Emit an event for the status change.
    }

    /**
     * @notice Ships a sold product and records a shipping receipt.
     * @param _id The ID of the product to ship.
     * @param _shippingReceipt The shipping receipt details.
     * No. 2 - Additional function to ship products and record shipping receipts.
     */
    function shipProduct(uint256 _id, string memory _shippingReceipt) external {
        Product storage product = products[_id];
        require(product.id == _id, "Product does not exist");
        require(product.status == ProductStatus.Sold, "Product must be sold");
        require(msg.sender == product.seller, "Only seller can ship the product");

        bytes32 hashedReceipt = keccak256(abi.encodePacked(_shippingReceipt)); // Hash the receipt.
        product.shippingReceipt = hashedReceipt; // Store the hash in the product.

        emit ProductShipped(_id, hashedReceipt); // Emit an event for the product shipment.
    }
}
