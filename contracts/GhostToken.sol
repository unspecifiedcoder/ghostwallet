// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GhostToken is ERC20, Ownable {
    mapping(address => bool) public minters;

    constructor() ERC20("Ghost Token", "GHOST") Ownable(msg.sender) {}

    function setMinter(address m, bool ok) external onlyOwner {
        minters[m] = ok;
    }

    function mint(address to, uint256 amount) external {
        require(minters[msg.sender], "GHOST:NOT_MINTER");
        _mint(to, amount);
    }
}
