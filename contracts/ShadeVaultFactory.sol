// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./ShadeVault.sol";
import "./ShadowRegistry.sol";
import "./GhostToken.sol";

contract ShadeVaultFactory {
    event VaultCreated(address indexed user, address wallet);

    address public admin;
    ShadowRegistry public registry;
    GhostToken public ghostToken;

    constructor(address _admin, address _registry, address _ghost) {
        admin = _admin;
        registry = ShadowRegistry(_registry);
        ghostToken = GhostToken(_ghost);
    }

    function createVault(
        address user,
        address backup,
        uint256 deadmanDelay,
        uint256 inactivityTimeout,
        ShadeVault.DestructAction destructAction,
        ShadeVault.TrapMode trapMode
    ) external returns (address) {
        require(msg.sender == admin, "FACT:NOT_ADMIN");
        ShadeVault w = new ShadeVault(
            user,
            backup,
            deadmanDelay,
            inactivityTimeout,
            destructAction,
            trapMode,
            address(ghostToken),
            address(registry)
        );
        // Let the vault mint GhostTokens for trap mode
        // ghostToken.setMinter(address(w), true);

        // Phonebook registration
        registry.register(user, address(w));
        emit VaultCreated(user, address(w));
        return address(w);
    }

    function setAdmin(address newAdmin) external {
        require(msg.sender == admin, "FACT:NOT_ADMIN");
        admin = newAdmin;
    }
}
