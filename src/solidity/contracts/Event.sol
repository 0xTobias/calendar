//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Event is ERC721, Ownable {
    struct EventData {
        //let date = (new Date()).getTime();
        uint256 startDate;
        uint256 endDate;
        address[] invites;
        string description;
        address organizer;
        uint256 eventId;
    }

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping(uint256 => EventData) public eventsData;

    constructor() ERC721("calendar.eth", "CALETH") {}

    event EventCreated(EventData eventData);
    event EventCancelled(uint256 eventId);

    function createEvent(
        uint256 startDate,
        uint256 endDate,
        address[] memory invites,
        string memory description,
        address organizer
    ) public onlyOwner returns (uint256) {
        uint256 newItemId = _tokenIds.current();
        _safeMint(msg.sender, newItemId);
        EventData memory eventData = EventData(
            startDate,
            endDate,
            invites,
            description,
            organizer,
            newItemId
        );
        eventsData[newItemId] = eventData;
        _tokenIds.increment();
        emit EventCreated(eventData);
        return newItemId;
    }

    function cancelEvent(uint256 eventId) public onlyOwner returns (bool) {
        delete eventsData[eventId];
        _burn(eventId);
        emit EventCancelled(eventId);
        return true;
    }

    function getEventData(uint256 id) public view returns (EventData memory) {
        return eventsData[id];
    }

    function getAllEvents() public view returns (EventData[] memory) {
        EventData[] memory events = new EventData[](_tokenIds.current());
        for (uint256 i; i < _tokenIds.current(); i++) {
            events[i] = eventsData[i];
        }
        return events;
    }
}
