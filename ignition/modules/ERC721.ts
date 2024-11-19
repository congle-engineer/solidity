import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ERC721Module = buildModule("ERC721Module", (m) => {
  const erc721 = m.contract("ERC721", [], {});

  return { erc721 };
});

export default ERC721Module;
