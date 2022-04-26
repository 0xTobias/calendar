const main = async () => {
  console.log("start");

  const [sig1, sig2] = await hre.ethers.getSigners();

  const Event = await hre.ethers.getContractFactory("Event");
  const event = await Event.deploy();

  await event.deployed();

  const CalendarManager = await hre.ethers.getContractFactory(
    "CalendarManager"
  );
  const calendarManager = await CalendarManager.deploy(event.address);

  await calendarManager.deployed();

  await event.transferOwnership(calendarManager.address);

  console.log("Events address: ", event.address);
  console.log("Calendar manager address: ", calendarManager.address);

  const allowTx = await calendarManager
    .connect(sig2)
    .allowInvites(sig1.address);

  await allowTx.wait();

  // eslint-disable-next-line no-extend-native
  Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  };

  // eslint-disable-next-line no-extend-native
  Date.prototype.addHours = function (h) {
    this.setTime(this.getTime() + h * 60 * 60 * 1000);
    return this;
  };

  const startDate = new Date().addDays(2).getTime();
  const endDate = new Date().addDays(2).addHours(6).getTime();
  const startDate2 = new Date().addDays(5).getTime();
  const endDate2 = new Date().addDays(5).addHours(6).getTime();  

  const eventTx = await calendarManager.createEvent(
    [sig2.address],
    startDate,
    endDate,
    "description of event"
  );

  const eventTx2 = await calendarManager.createEvent(
    [sig2.address],
    startDate2,
    endDate2,
    "description of event 2"
  );

  await eventTx2.wait(1);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

runMain();
