// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library Errors {
    string constant NotOwner = "SV:NOT_OWNER";
    string constant NotAuthorizedViewer = "SV:NOT_AUTH_VIEWER";
    string constant NotBackupOrOwner = "SV:NOT_OWNER_OR_BACKUP";
    string constant UnauthorizedWithdrawal = "SV:UNAUTH_WITHDRAWAL";
    string constant TooSoon = "SV:TOO_SOON";
    string constant ZeroAddress = "SV:ZERO_ADDRESS";
}
