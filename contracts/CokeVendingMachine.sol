// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract CokeVendingMachine {
    /**
     * declare the events emitted
     */
    event CokeAdded(uint count, uint timestamp);
    event CokePurchased(uint count, uint timestamp);
    // vending mahcine business owner
    address owner;
    // store coke inventory
    uint public remainingCoke;
    // max inventory storage of the machine
    uint public immutable MAX_STORAGE;

    // Initialize the owner of the vending machine
    constructor() {
        owner = msg.sender;
        MAX_STORAGE = 5;
    }

    // Allow owner to add coke inventory
    function addCoke(uint _count) external {
        // only owner should be able to add
        require(msg.sender == owner, "Only owner can add inventory");
        // check if inventory has space
        require(_count <= (MAX_STORAGE - remainingCoke), "Inventory can't store that much");
        // add new coke to inventory
        remainingCoke += _count;
        emit CokeAdded(_count, block.timestamp);
    }

    // Allow customer to purchase coke
    function purchase(uint _count) payable external {
        // make sure customer pays 0,01 ether
        require(msg.value == 0.01 ether * _count, "Pay 0.01 ether");
        // make sure inventory is enough
        require(remainingCoke > 0, "Sorry. No coke available at the moment");
        // reduce purchased amount from inventory
        remainingCoke -= _count;
        emit CokePurchased(_count, block.timestamp);
    }
}