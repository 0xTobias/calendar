//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Event.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract CalendarManager is IERC721Receiver {
    using EnumerableSet for EnumerableSet.AddressSet;

    Event public eventContract;
    mapping(address => EnumerableSet.AddressSet) allowances;
    event InvitesAllowed(address indexed by, address indexed from);
    event InvitesDisabled(address indexed by, address indexed from);

    constructor(Event _eventContract) {
        eventContract = _eventContract;
    }

    modifier onlyEventOwner(uint256 eventId) {
        require(
            eventContract.getEventData(eventId).organizer == msg.sender,
            "Only the owner can cancel an event"
        );
        _;
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    function createEvent(
        address[] memory invitees,
        uint256 startDate,
        uint256 endDate,
        string memory description
    ) public returns (uint256) {
        for (uint256 i; i < invitees.length; i++) {
            if (!EnumerableSet.contains(allowances[invitees[i]], msg.sender)) {
                revert("Invitee did not approve");
            }
        }
        uint256 eventId = eventContract.createEvent(
            startDate,
            endDate,
            invitees,
            description,
            msg.sender
        );
        return eventId;
    }

    function cancelEvent(uint256 eventId)
        public
        onlyEventOwner(eventId)
        returns (bool)
    {
        bool canceled = eventContract.cancelEvent(eventId);
        return canceled;
    }

    function allowInvites(address from) public {
        EnumerableSet.add(allowances[msg.sender], from);
        emit InvitesAllowed(msg.sender, from);
    }

    function disableInvites(address from) public {
        EnumerableSet.remove(allowances[msg.sender], from);
        emit InvitesDisabled(msg.sender, from);
        (msg.sender, from);
    }

    function isInviteAllowed(address from) public view returns (bool) {
        return EnumerableSet.contains(allowances[msg.sender], from);
    }

    function isInviteAllowedBy(address by, address from)
        public
        view
        returns (bool)
    {
        return EnumerableSet.contains(allowances[by], from);
    }
}
