// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

contract Contract {
  address public owner;

  constructor() {
    owner = msg.sender;
  }
}
