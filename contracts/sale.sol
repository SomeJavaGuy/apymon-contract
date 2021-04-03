// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./Context.sol";
import "./IERC721.sol";

contract Sale is Context {
    struct Offer {
        uint256 eggId;
        uint256 price;
    }

    struct Bid {
        address bider;
        uint256 price;
    }

    IERC721 public apymon;

    mapping(address => Offer[]) public offers;

    mapping(uint256 => Bid[]) public bids;

    constructor(
        address _apymon
    ) {
        apymon = IERC721(_apymon);
    }

    modifier onlyEggOwner(uint256 eggId) {
        require(
            apymon.ownerOf(eggId) == _msgSender(),
            "Invalid owner"
        );
        _;
    }

    function putToSale(
        uint256 eggId,
        uint256 price
    ) external onlyEggOwner(eggId) {
        Offer[] storage myOffers = offers[_msgSender()];
        Offer memory newOffer =
            Offer({
                eggId: eggId,
                price: price
            });
        myOffers.push(newOffer);
    }

    function popFromSale(
        uint256 eggId
    ) external onlyEggOwner(eggId) {
        Offer[] storage myOffers = offers[_msgSender()];
        uint256 len = myOffers.length;
        for (uint256 i; i < len; i++) {
            if (myOffers[i].eggId == eggId) {
                myOffers[i] = myOffers[len -1];
                myOffers.pop();
                offers[_msgSender()] = myOffers;
            }
        }
    }

    // function bidToEgg(
    //     uint256 eggId,
    //     uint256 price
    // ) external {
    //     Bid[] storage curBids = bids[eggId];
    //     Bid memory newBid =
    //         Offer({
    //             bider: _msgSender(),
    //             price: price
    //         });
    //     myOffers.push(newOffer);
    // }
}
