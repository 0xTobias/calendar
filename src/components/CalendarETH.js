import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { useState } from "react";
import Button from 'react-bootstrap/Button';
import { Form, FormControl, InputGroup } from "react-bootstrap";
import { ethers } from "ethers";
import DateTimePicker from 'react-datetime-picker';

function CalendarETH({ events, eventsContract, calendarManagerContract, currentAccount }) {
  const localizer = momentLocalizer(moment);
  const [allowInviteAddress, setAllowInviteAddress] = useState("");
  const [invitees, setInvitees] = useState([]);
  const [currentInvitee, setCurrentInvitee] = useState([]);
  const [eventDescription, setEventDescription] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const ownedEvents = events ? events.filter((ev) => ev.organizer === currentAccount) : [];
  const [selectedEventToCancel, setSelectedEventToCancel] = useState();

  const addInvitee = () => {
    try {
      ethers.utils.getAddress(currentInvitee);
      //Check if not user address
      //Check if user has permission for invite
      if (!invitees.includes(currentInvitee)) {
        setInvitees((prevValue) => prevValue.concat([currentInvitee]));
      }
    } catch (e) {
      //Make this a pretty error
      console.log("Invalid address");
    }
  }

  const removeInvitee = (inviteeToRemove) => {
    setInvitees((prevValue) => prevValue.filter(inv => inv !== inviteeToRemove));
  }

  const allowInvitesFrom = async (from) => {
    try {
      ethers.utils.getAddress(allowInviteAddress);
      await calendarManagerContract.allowInvites(from)
    } catch (e) {
      //Make this a pretty error
      console.log("Invalid address");
    }
  }

  const createEvent = async (invitees, startDate, endDate, description) => {
    await calendarManagerContract.createEvent(invitees, startDate.getTime(), endDate.getTime(), description)
  }

  const cancelEvent = async (eventId) => {
    const eventIdToDelete = eventId || ownedEvents[0].id;
    await calendarManagerContract.cancelEvent(ethers.BigNumber.from(eventIdToDelete));
  }

  return (
    <div className="calendar">
      <Calendar
        localizer={localizer}
        events={events || []}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 650 }}
      />
      <div className="allow-invites action-card">
        <p className="mb-3">Allow invites from other addresses</p>
        <div className="content">
          <InputGroup>
            <FormControl placeholder="Insert address (0x)" value={allowInviteAddress} onChange={(e) => setAllowInviteAddress(e.target.value)} />
            <Button style={{zIndex: "0"}} variant="primary" onClick={() => allowInvitesFrom(allowInviteAddress)}>
              Allow invites from address
            </Button>
          </InputGroup>
        </div>
      </div>
      <div className="create-event action-card">
        <p className="mb-3">Create invite</p>
        <div className="content">
          <Form className="text-start" onSubmit={(e) => {
            e.preventDefault();
            createEvent(invitees, startDate, endDate, eventDescription)
          }}>

            <Form.Group className="mb-3">
              <Form.Label>Event description</Form.Label>
              <Form.Control placeholder="Enter event description"
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)} />
            </Form.Group>

            <div style={{display: "flow-root"}}>
              <Form.Group className="mb-3 float-start">
                <Form.Label>Start date</Form.Label>
                <div>
                  <DateTimePicker minDate={new Date()} onChange={setStartDate} value={startDate} />
                </div>
              </Form.Group>

              <Form.Group className="mb-3 float-end">
                <Form.Label>End date</Form.Label>
                <div>
                  <DateTimePicker minDate={startDate} onChange={setEndDate} value={endDate} />
                </div>
              </Form.Group>
            </div>

            <Form.Group>
              <Form.Label>Invitees</Form.Label>
              <InputGroup className="mb-3">
                <FormControl
                  placeholder="Enter a valid addresses (0x)"
                  value={currentInvitee}
                  onChange={(e) => setCurrentInvitee(e.target.value)}
                />
                <Button onClick={() => { addInvitee() }} variant="outline-primary">
                  <span className="fw-bold">+</span>
                </Button>
              </InputGroup>
              {invitees.map((invitee) =>
                <div className="mb-2">
                  {invitee}
                  <span onClick={() => { removeInvitee(invitee) }} className={"fw-bold ms-3 text-secondary"}>X</span>
                </div>
              )}
            </Form.Group>
            <Button variant="primary" type="submit">
              Create event
            </Button>
          </Form>
        </div>
      </div>
      <div className="cancel-event action-card">
        <p className="mb-3">Cancel event you own</p>
        <div className="content">
          <InputGroup>
            <Form.Select onChange={(e) => setSelectedEventToCancel(e.target.value)}>
              {ownedEvents && ownedEvents.map((ev) => <option key={ev.id} value={ev.id}>{ev.description}</option>)}
            </Form.Select>
            <Button disabled={!ownedEvents.length} variant="primary" onClick={() => cancelEvent(selectedEventToCancel)}>
              Cancel event
            </Button>
          </InputGroup>
        </div>
      </div>
    </div >
  );
}

export default CalendarETH;
