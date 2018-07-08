# POC
Proof of Concept

This application demonstrates the use of Masked Authenticated Messaging (MAM) in the IOTA tangle.
The idea is that it captures the price negotiations (bids and offers) for a given item.

Each item for sale is a "channel" in the IOTA MAM plugin.
Once a bit or offer is submitted it is attached to and verified by the tangle.
Each bid or offer is a  0-value  (immutable) IOTA transactions.
Currently this application points to the IOTA testnet, ie the channel and associated transactions can be monitored at https://devnet.thetangle.org/

A running version of the app can be found here https://vleppo-iri.firebaseapp.com/.

An item can be created and anyone with that channel id can subscribe to that channel, ie monitor and/or submit bids.
