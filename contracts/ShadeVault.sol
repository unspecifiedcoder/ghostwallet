// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./GhostToken.sol";
import "./ShadowRegistry.sol";
import { Errors as SVErrors } from "./libs/Errors.sol";

contract ShadeVault is Ownable, ReentrancyGuard {
    using Address for address payable;

    enum TrapMode { None, GhostToken, Revert }
    enum DestructAction { Burn, TransferToBackup }

    event Ping(uint256 timestamp);
    event DecoyUpdated(bool enabled);
    event TrapTriggered(TrapMode mode, address indexed attacker, uint256 ghostAmount);
    event ShadowMirrorRequest(bytes32 indexed op, address indexed wallet, address indexed user, uint256 chainId, bytes data);
    event BackupChanged(address backup);
    event Withdraw(address indexed by, address token, uint256 amount, address to);
    event SelfDestructExecuted(DestructAction action, uint256 ethAmount, address dest);

    address public backup;
    uint256 public lastPing;
    uint256 public deadmanDelay;      // seconds after lastPing that backup can withdraw
    uint256 public inactivityTimeout; // seconds after lastPing enabling self-destruct
    DestructAction public destructAction;

    TrapMode public trapMode;
    GhostToken public ghostToken;
    ShadowRegistry public registry;

    // Decoy presentation
    bool public decoyEnabled;
    uint256 public decoyEthBalance;
    mapping(address => uint256) public decoyErc20Balance;
    mapping(address => bool) public authorizedViewers;

    // Track tokens for sweeping (owner can add)
    address[] public trackedTokens;
    mapping(address => bool) public isTracked;

    modifier onlyOwnerOrBackupTimed() {
        if (msg.sender == owner()) {
            _;
        } else if (msg.sender == backup && block.timestamp >= lastPing + deadmanDelay) {
            _;
        } else {
            revert(SVErrors.NotBackupOrOwner);
        }
    }

    constructor(
        address _owner,
        address _backup,
        uint256 _deadmanDelay,
        uint256 _inactivityTimeout,
        DestructAction _destructAction,
        TrapMode _trapMode,
        address _ghostToken,
        address _registry
    ) Ownable(_owner) {
        require(_owner != address(0) && _backup != address(0), SVErrors.ZeroAddress);
        backup = _backup;
        lastPing = block.timestamp;
        deadmanDelay = _deadmanDelay;
        inactivityTimeout = _inactivityTimeout;
        destructAction = _destructAction;
        trapMode = _trapMode;
        ghostToken = GhostToken(_ghostToken);
        registry = ShadowRegistry(_registry);

        // preset: owner is authorized viewer
        authorizedViewers[_owner] = true;

        emit ShadowMirrorRequest(
            keccak256("wallet.created"),
            address(this),
            _owner,
            block.chainid,
            abi.encode(_backup, _deadmanDelay, _inactivityTimeout, _destructAction, _trapMode)
        );
    }

    receive() external payable {
        emit ShadowMirrorRequest(
            keccak256("wallet.funded"),
            address(this),
            owner(),
            block.chainid,
            abi.encode(msg.value, msg.sender)
        );
    }

    // --- Timers & ping ---
    function ping() external onlyOwner {
        lastPing = block.timestamp;
        emit Ping(lastPing);
        emit ShadowMirrorRequest(keccak256("wallet.ping"), address(this), owner(), block.chainid, abi.encode(lastPing));
    }

    function canBackupWithdraw() public view returns (bool) {
        return block.timestamp >= lastPing + deadmanDelay;
    }

    function canSelfDestruct() public view returns (bool) {
        return block.timestamp >= lastPing + inactivityTimeout;
    }

    // --- Admin settings ---
    function setBackup(address _backup) external onlyOwner {
        require(_backup != address(0), SVErrors.ZeroAddress);
        backup = _backup;
        emit BackupChanged(_backup);
        emit ShadowMirrorRequest(keccak256("wallet.backup_changed"), address(this), owner(), block.chainid, abi.encode(_backup));
    }

    function setTrapMode(TrapMode mode) external onlyOwner { trapMode = mode; }

    function setDecoyConfig(bool enabled, uint256 ethBal) external onlyOwner {
        decoyEnabled = enabled;
        decoyEthBalance = ethBal;
        emit DecoyUpdated(enabled);
    }

    function setDecoyErc20(address token, uint256 bal) external onlyOwner {
        decoyErc20Balance[token] = bal;
    }

    function setAuthorizedViewer(address viewer, bool ok) external onlyOwner {
        authorizedViewers[viewer] = ok;
    }

    function addTrackedToken(address token) external onlyOwner {
        if (!isTracked[token]) {
            isTracked[token] = true;
            trackedTokens.push(token);
        }
    }

    // --- Decoy reads ---
    function getDisplayedEthBalance(address viewer) external view returns (uint256) {
        if (decoyEnabled && !authorizedViewers[viewer]) return decoyEthBalance;
        return address(this).balance;
    }

    function getDisplayedTokenBalance(address viewer, address token) external view returns (uint256) {
        if (decoyEnabled && !authorizedViewers[viewer]) return decoyErc20Balance[token];
        return IERC20(token).balanceOf(address(this));
    }

    // --- Withdrawals ---
    function withdrawETH(uint256 amount, address payable to) external nonReentrant onlyOwnerOrBackupTimed {
        _transferEth(to, amount);
        emit Withdraw(msg.sender, address(0), amount, to);
    }

    function withdrawToken(address token, uint256 amount, address to) external nonReentrant onlyOwnerOrBackupTimed {
        IERC20(token).transfer(to, amount);
        emit Withdraw(msg.sender, token, amount, to);
    }

    // --- Unauthorized trap ---
    function tryWithdrawAsAttacker(uint256 amount) external nonReentrant {
        if (trapMode == TrapMode.Revert) {
            emit TrapTriggered(TrapMode.Revert, msg.sender, 0);
            revert(SVErrors.UnauthorizedWithdrawal);
        } else if (trapMode == TrapMode.GhostToken) {
            uint256 ghost = amount == 0 ? 1e18 : amount;
            ghostToken.mint(msg.sender, ghost);
            emit TrapTriggered(TrapMode.GhostToken, msg.sender, ghost);
            emit ShadowMirrorRequest(
                keccak256("wallet.trap_ghost"),
                address(this),
                owner(),
                block.chainid,
                abi.encode(msg.sender, ghost)
            );
        } else {
            revert(SVErrors.UnauthorizedWithdrawal);
        }
    }

    // --- Self-destruct ---
    function performSelfDestruct() external nonReentrant {
        require(canSelfDestruct(), SVErrors.TooSoon);

        uint256 bal = address(this).balance;
        address dest = destructAction == DestructAction.TransferToBackup ? backup : address(0);

        if (bal > 0) {
            _transferEth(payable(dest), bal);
        }

        for (uint256 i = 0; i < trackedTokens.length; i++) {
            IERC20 t = IERC20(trackedTokens[i]);
            uint256 ta = t.balanceOf(address(this));
            if (ta > 0) {
                if (destructAction == DestructAction.TransferToBackup) {
                    t.transfer(backup, ta);
                } else {
                    t.transfer(0x000000000000000000000000000000000000dEaD, ta);
                }
            }
        }

        emit SelfDestructExecuted(destructAction, bal, dest);
        emit ShadowMirrorRequest(
            keccak256("wallet.self_destructed"),
            address(this),
            owner(),
            block.chainid,
            abi.encode(destructAction, bal)
        );
    }

    // --- Internals ---
    function _transferEth(address payable to, uint256 amount) internal {
        (bool ok, ) = to.call{value: amount}("");
        require(ok, "SV:ETH_SEND_FAIL");
    }
}
