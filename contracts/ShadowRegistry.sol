// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ShadowRegistry {
    event Registered(uint256 indexed chainId, address indexed user, address wallet);
    event Updated(uint256 indexed chainId, address indexed user, address wallet);

    mapping(uint256 => mapping(address => address)) public walletOf; // chainId => user => wallet
    address public admin;

    constructor(address _admin) {
        admin = _admin;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "REG:NOT_ADMIN");
        _;
    }

    function register(address user, address wallet) external onlyAdmin {
        walletOf[block.chainid][user] = wallet;
        emit Registered(block.chainid, user, wallet);
    }

    function update(address user, address wallet) external onlyAdmin {
        walletOf[block.chainid][user] = wallet;
        emit Updated(block.chainid, user, wallet);
    }

    function setAdmin(address newAdmin) external onlyAdmin {
        admin = newAdmin;
    }
}
