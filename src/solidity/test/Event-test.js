const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Event", function () {
  let event;

  beforeEach(async function () {
    const Event = await ethers.getContractFactory("Event");
    event = await Event.deploy();

    await event.deployed();
  });

  it("Should have the correct data after mint", async function () {
    const date = new Date().getTime();
    const addressArray = [
      "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      "0x66666Bf26964Af9d7eed9E03e53415d37aa66666",
    ];
    const description = "description";
    const organizer = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";

    const createEventTx = await event.createEvent(
      date,
      date,
      addressArray,
      description,
      organizer
    );

    await createEventTx.wait();

    let event0 = await event.getEventData(0);

    expect(event0.description).to.equal(description);
    expect(event0.invites[0]).to.equal(addressArray[0]);
    expect(event0.invites[1]).to.equal(addressArray[1]);
    expect(event0.startDate).to.equal(date);
    expect(event0.endDate).to.equal(date);
    expect(event0.organizer).to.equal(organizer);
  });

  it("Should return all events correctly", async function () {
    const date = new Date().getTime();
    const addressArray = [
      "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      "0x66666Bf26964Af9d7eed9E03e53415d37aa66666",
    ];
    const description = "description";
    const organizer = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";
    const organizer2 = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";

    const createEventTx = await event.createEvent(
      date,
      date,
      addressArray,
      description,
      organizer
    );

    await createEventTx.wait();

    const createEventTx2 = await event.createEvent(
      date,
      date,
      addressArray,
      description,
      organizer2
    );

    await createEventTx2.wait();

    const events = await event.getAllEvents();

    expect(events.length).to.equal(2);
    expect(events[0].organizer).to.equal(organizer);
    expect(events[1].organizer).to.equal(organizer2);
  });
});
