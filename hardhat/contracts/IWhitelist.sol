// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IWhitelist{

    function whitelist(address) external view returns(bool);

}
