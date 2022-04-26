const hre = require("hardhat");

async function main() {
  const Event = await hre.ethers.getContractFactory("Event");
  const event = await Event.deploy();

  await event.deployed();

  console.log("Event deployed to:", event.address);

  let date = new Date().getTime();

  const createEventTx = await event.createEvent(
    date,
    ["0xd8da6bf26964af9d7eed9e03e53415d37aa96045"],
    "description"
  );

  await createEventTx.wait();

  let event0 = await event.getEventData(0);
  console.log(event0);

  const CalendarManager = await hre.ethers.getContractFactory("CalendarManager");
  const calendarManager = await CalendarManager.deploy(event.address);

  await calendarManager.deployed();

  console.log("calendarManager deployed to:", calendarManager.address);

  let eventContract = await calendarManager.eventContract();
  console.log(eventContract);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
