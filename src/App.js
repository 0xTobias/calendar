import logo from "./logo.svg";
import "./App.scss";
import CalendarETH from "./components/CalendarETH";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { calendarManager, events } from "./constants.js";
import 'bootstrap/dist/css/bootstrap.min.css';

function cleanEvent(scEvent) {
  return {
    id: scEvent.eventId.toNumber(),
    start: new Date(scEvent.startDate.toNumber()),
    end: new Date(scEvent.endDate.toNumber()),
    invitees: scEvent.invites,
    description: scEvent.description,
    title: scEvent.description,
    organizer: scEvent.organizer,
    allDay: false,
  }
}

function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [userEvents, setUserEvents] = useState();
  let userEventSuscription;
  let eventCancelSuscription;

  const signer = function () {
    const { ethereum } = window;
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      return provider.getSigner();
    } else {
      console.log("Ethereum object doesn't exist!");
    }
  }()

  const calendarManagerContract = new ethers.Contract(
    calendarManager.address,
    calendarManager.abi,
    signer
  );

  const eventsContract = new ethers.Contract(
    events.address,
    events.abi,
    signer
  );

  const addUserEvent = (event) => {
    setUserEvents((prevValue) => prevValue.concat([event]));
  }

  const removeUserEvent = (eventId) => {
    setUserEvents((prevValue) => prevValue.filter(ev => ev.id !== eventId));
  }

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      await window.ethereum.enable();

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(ethers.utils.getAddress(account));
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const isUserEvent = (event, userAddress) => event.organizer == userAddress || event.invitees.includes(userAddress);

  const getAllEvents = async () => {
    const events = await eventsContract.getAllEvents();
    const eventsCleaned = events.map(ev => cleanEvent(ev));
    setUserEvents(eventsCleaned.filter(ev => isUserEvent(ev, currentAccount)))
  };

  const suscribeToNewEvents = async () => {
    userEventSuscription = eventsContract.on("EventCreated", (eventData) => {
      const eventCleaned = cleanEvent(eventData);
      if (isUserEvent(eventCleaned, currentAccount) && userEvents.every((ev) => ev.id !== eventCleaned.id)) {
        addUserEvent(eventCleaned);
      }
    });
  }

  const suscribeToCancelEvents = async () => {
    eventCancelSuscription = eventsContract.on("EventCancelled", (bigNumberId) => {
      removeUserEvent(bigNumberId.toNumber());
    });
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    if (currentAccount) {
      getAllEvents();
    }
  }, [currentAccount])

  useEffect(() => {
    if (userEvents && !userEventSuscription) {
      suscribeToNewEvents();
    }
  }, [userEvents, userEventSuscription])

  useEffect(() => {
    if (userEvents && !eventCancelSuscription) {
      suscribeToCancelEvents();
    }
  }, [userEvents, eventCancelSuscription])

  return (
    <div className="App">
      <header className="App-header"><span>Calendar.ETH</span><span>{signer.address}</span></header>
      <CalendarETH
        events={userEvents}
        eventsContract={eventsContract}
        calendarManagerContract={calendarManagerContract}
        currentAccount={currentAccount}
      />
    </div>
  );
}

export default App;
