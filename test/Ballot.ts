import { expect } from "chai";
import { ethers } from "hardhat";

describe("Ballot", function () {
  let Ballot;
  let ballot;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    Ballot = await ethers.getContractFactory("Ballot");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Initialize the contract with two proposals
    const proposalNames = [ethers.encodeBytes32String("Proposal 1"), ethers.encodeBytes32String("Proposal 2")];
    ballot = await Ballot.deploy(proposalNames);
  });

  describe("Deployment", function () {
    it("Should set the right chairperson", async function () {
      expect(await ballot.chairperson()).to.equal(owner.address);
    });

    it("Should create proposals correctly", async function () {
      const proposal1 = await ballot.proposals(0);
      const proposal2 = await ballot.proposals(1);
      expect(proposal1.name).to.equal(ethers.encodeBytes32String("Proposal 1"));
      expect(proposal2.name).to.equal(ethers.encodeBytes32String("Proposal 2"));
    });
  });

  describe("Voting rights", function () {
    it("Should give the right to vote", async function () {
      await ballot.giveRightToVote(addr1.address);
      const voter = await ballot.voters(addr1.address);
      expect(voter.weight).to.equal(1);
    });

    it("Should fail if non-chairperson tries to give voting rights", async function () {
      await expect(ballot.connect(addr1).giveRightToVote(addr2.address)).to.be.revertedWith("Only chairperson can give right to vote.");
    });

    it("Should fail if the voter has already voted", async function () {
      await ballot.giveRightToVote(addr1.address);
      await ballot.connect(addr1).vote(0);
      await expect(ballot.giveRightToVote(addr1.address)).to.be.revertedWith("The voter already voted.");
    });
  });

  describe("Voting and delegation", function () {
    it("Should allow voting", async function () {
      await ballot.giveRightToVote(addr1.address);
      await ballot.connect(addr1).vote(0);

      const proposal = await ballot.proposals(0);
      expect(proposal.voteCount).to.equal(1);
    });

    it("Should allow delegation", async function () {
      await ballot.giveRightToVote(addr1.address);
      await ballot.giveRightToVote(addr2.address);

      await ballot.connect(addr1).delegate(addr2.address);
      await ballot.connect(addr2).vote(0);

      const voter = await ballot.voters(addr1.address);
      const proposal = await ballot.proposals(0);

      expect(voter.voted).to.equal(true);
      expect(proposal.voteCount).to.equal(2);
    });

    it("Should fail delegation to self", async function () {
      await ballot.giveRightToVote(addr1.address);
      await expect(ballot.connect(addr1).delegate(addr1.address)).to.be.revertedWith("Self-delegation is disallowed.");
    });

    it("Should fail delegation causing a loop", async function () {
      await ballot.giveRightToVote(addr1.address);
      await ballot.giveRightToVote(addr2.address);

      await ballot.connect(addr1).delegate(addr2.address);
      await expect(ballot.connect(addr2).delegate(addr1.address)).to.be.revertedWith("Found loop in delegation.");
    });
  });

  describe("Winning proposal", function () {
    it("Should return the correct winning proposal", async function () {
      await ballot.giveRightToVote(addr1.address);
      await ballot.giveRightToVote(addr2.address);

      await ballot.connect(addr1).vote(0);
      await ballot.connect(addr2).vote(1);

      const winningProposalIndex = await ballot.winningProposal();
      expect(winningProposalIndex).to.equal(0);

      const winnerName = await ballot.winnerName();
      expect(winnerName).to.equal(ethers.encodeBytes32String("Proposal 1"));
    });
  });
});
