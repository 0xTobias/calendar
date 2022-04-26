import calendarManagerABI from "./solidity/artifacts/contracts/CalendarManager.sol/CalendarManager.json";
import eventsABI from "./solidity/artifacts/contracts/Event.sol/Event.json";

export const calendarManager = {
    address: "0x32e598BdC080c54aAA46eFe99F4B44F692E89dB3",
    abi: calendarManagerABI.abi,
}

export const events = {
    address: "0x19FB997777F9577F313F96B7EE73c6d8d99f30E4",
    abi: eventsABI.abi,
}