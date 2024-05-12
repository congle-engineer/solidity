async function main() {
  const HelloWorld = await ethers.getContractFactory("HelloWorld");

  const hello_world = await HelloWorld.deploy("This is a test message!");
  console.log("Contract deployed to address: ", hello_world.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.log(error);
    process.exit(1);
  });
