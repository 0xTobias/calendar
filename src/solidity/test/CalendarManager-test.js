const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CalendarManager", function () {
  let event;
  let calendarManager;

  beforeEach(async function () {
    const Event = await ethers.getContractFactory("Event");
    event = await Event.deploy();

    await event.deployed();

    const CalendarManager = await ethers.getContractFactory("CalendarManager");
    calendarManager = await CalendarManager.deploy(event.address);

    await calendarManager.deployed();

    await event.transferOwnership(calendarManager.address);
  });

  it("Should have the correct address for the event contract", async function () {
    expect(await calendarManager.eventContract()).to.equal(event.address);
  });

  it("Should have address as allowed after calling allowInvite", async function () {
    const [, add1, add2] = await ethers.getSigners();
    await calendarManager.allowInvites(add1.address);
    const isInviteAllowed = await calendarManager.isInviteAllowed(add1.address);
    expect(isInviteAllowed).to.be.true;
    expect(await calendarManager.isInviteAllowed(add2.address)).to.be.false;
  });

  it("Should not have address as allowed after calling disableInvites", async function () {
    const [, add1, add2] = await ethers.getSigners();
    await calendarManager.allowInvites(add1.address);
    let isInviteAllowed = await calendarManager.isInviteAllowed(add1.address);
    expect(isInviteAllowed).to.be.true;
    await calendarManager.disableInvites(add1.address);
    isInviteAllowed = await calendarManager.isInviteAllowed(add1.address);
    expect(isInviteAllowed).to.be.false;
  });

  it("Should create the event if all invitees are approved", async function () {
    const [owner, add1, add2] = await ethers.getSigners();
    await calendarManager.allowInvites(add1.address);
    await calendarManager.connect(add2).allowInvites(add1.address);

    //Event should not exist
    const event0Missing = await event.getEventData(0);
    expect(event0Missing.organizer).to.equal(
      "0x0000000000000000000000000000000000000000"
    );

    await calendarManager
      .connect(add1)
      .createEvent([owner.address, add2.address], 0, 0, "description");

    const event0 = await event.getEventData(0);
    expect(event0.organizer).to.equal(add1.address);
  });

  it("Should revert with `invitee did not approve` when creating an event without invitees approve", async function () {
    const [owner, add1] = await ethers.getSigners();
    await expect(
      calendarManager
        .connect(add1)
        .createEvent([owner.address], 0, 0, "description")
    ).to.be.revertedWith("Invitee did not approve");
  });

  it("Should delete event when calling cancelEvent as organizer", async function () {
    const [owner, add1, add2] = await ethers.getSigners();
    await calendarManager.allowInvites(add1.address);
    await calendarManager.connect(add2).allowInvites(add1.address);

    await calendarManager
      .connect(add1)
      .createEvent([owner.address, add2.address], 0, 0, "description");

    await calendarManager.connect(add1).cancelEvent(0);

    //Event should not exist
    const event0Missing = await event.getEventData(0);
    expect(event0Missing.organizer).to.equal(
      "0x0000000000000000000000000000000000000000"
    );
  });

  it("Should fail deleting event when calling cancelEvent not as organizer", async function () {
    const [owner, add1, add2] = await ethers.getSigners();
    await calendarManager.allowInvites(add1.address);
    await calendarManager.connect(add2).allowInvites(add1.address);

    await calendarManager
      .connect(add1)
      .createEvent([owner.address, add2.address], 0, 0, "description");

    await expect(calendarManager.cancelEvent(0)).to.be.revertedWith(
      "Only the owner can cancel an event"
    );

    //Event should exist
    const event0 = await event.getEventData(0);
    expect(event0.organizer).to.equal(add1.address);
  });
});
