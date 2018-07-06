
//'host': 'https://nodes.testnet.iota.org',
// 'host': 'https://nodes.devnet.thetangle.org',

currentChannelStr = "";
currentUser = "";
iota = new IOTA({
    'host': 'https://nodes.testnet.iota.org',
    'port': 443
});
channelRoot = "";
mamState = null;
Mam = null;
getDataCallback = null;

class Vleppo {

    constructor() {
        Mam = require('mam.web.js');       
    };

    clearTable() {
        document.getElementById("messageRoot").value = channelRoot;
        var numRows = document.getElementById("offerTableBody").getElementsByTagName("tr").length;
        for (let i = numRows - 1; i >= 0; i--) {
            try {
                document.getElementById("offerTableBody").deleteRow(i);
            } catch (e) {
                console.log("WTF " + i);
            }
        }
    }

    async createChannel() {
        var descr = document.getElementById("itemDescription").value;
        //var tag = document.getElementById("itemTag").value;
        var itemObj = { "descr": descr };


        let trytes = iota.utils.toTrytes(JSON.stringify(itemObj));
        let tagValue = iota.utils.toTrytes("Vleppo");
        mamState = Mam.init(iota, undefined, 2);
        channelRoot = mamState.seed;
        // Attach the payload
        let message = Mam.create(mamState, trytes);
        mamState = message.state;
        let obj = await Mam.attach(message.payload, message.address, undefined, undefined,  tagValue);
        console.log("Channel created." + obj);
        channelRoot = message.root;
        currentChannelStr = descr;
        document.getElementById("channelNew").value = '';
        document.getElementById("messageRoot").value = channelRoot;

        let cont = true;
        while (cont) {
            let resp = await Mam.fetch(channelRoot, 'public');
            if (resp != null && resp != '') {
                 this.clearTable();
                 this.writeMessages(resp);
            }
        }
        return message.root;
    }

    getDateAndTime() {
        let a = new Date();
        let year = a.getUTCFullYear();
        let month = (a.getUTCMonth() + 1) < 10 ? '0' + (a.getUTCMonth() + 1) : (a.getUTCMonth() + 1);
        let date = a.getUTCDate() < 10 ? '0' + a.getUTCDate() : a.getUTCDate();
        let hour = a.getUTCHours() < 10 ? '0' + a.getUTCHours() : a.getUTCHours();
        let min = a.getUTCMinutes() < 10 ? '0' + a.getUTCMinutes() : a.getUTCMinutes();
        let sec = a.getUTCSeconds() < 10 ? '0' + a.getUTCSeconds() : a.getUTCSeconds();
        let time = date + '/' + month + '/' + year + ' ' + hour + ':' + min + ':' + sec;
        return time;
    }


    async publish() {

        if (channelRoot == '' || channelRoot == null) {
            console.log("No roor in publish. Exit here");
            return;
        }

        var price = document.getElementById("itemPrice").value;
        let dateStamp = this.getDateAndTime();

        currentUser = "Tomas";
        var itemObj = { "user": currentUser, "price": price, "date": dateStamp, "channel": currentChannelStr };
        // Create MAM Payload
        let trytes = iota.utils.toTrytes(JSON.stringify(itemObj));
        let tagValue = iota.utils.toTrytes("Vleppo");
        let message = Mam.create(mamState, trytes);

        let obj = await Mam.attach(message.payload, message.address, undefined, undefined, tagValue);
        console.log("Publich succeded");
    }

    writeMessages(resp) {
        if (resp == null)
            return;
        let msgLength = resp.messages.length;
        for (let i = 0; i < msgLength; i++) {
            let msg = resp.messages[i];
            let ff = iota.utils.fromTrytes(msg);
            this.parseReturnValues(msg);
            console.log("Decoded message is : " + ff);
        }
    }


    async retrieve() {

        let aVal = document.getElementById("channelNew").value;
        if (aVal != null && aVal != '') {
            channelRoot = aVal;
            mamState = Mam.init(iota, channelRoot, 2);
        }

        if (channelRoot == '') {
            console.log("No channel root. Exit here");
            return;
        }

        document.getElementById("messageRoot").value = channelRoot;
        let cont = true;
        while (cont) {
            let resp = await Mam.fetch(channelRoot, 'public');
            if (resp != null && resp != '') {
                 this.clearTable();
                 this.writeMessages(resp);
            }
        }
        console.log("Response is " + resp)
    }

    parseReturnValues(data) {

        let json = JSON.parse(iota.utils.fromTrytes(data));
        if (json != null) {

            var table = document.getElementById("offerTableBody");

            var row = table.insertRow(-1);

            var cell1 = row.insertCell(-1); //USer
            cell1.className += " col text-overflow: ellipsis";
            var cell2 = row.insertCell(-1); //Item
            cell2.className += " col text-overflow: ellipsis";
            var cell3 = row.insertCell(-1); //Price
            cell3.className += " col text-overflow: ellipsis";
            var cell4 = row.insertCell(-1); //Date
            cell4.className += " col text-overflow: ellipsis";
            if (json.descr != null) {
                currentChannelStr = json.descr;
                cell1.innerHTML = "";
                cell2.innerHTML = json.descr;
                cell3.innerHTML = "";
                cell4.innerHTML = "";
            } else {
                cell1.innerHTML = json.user;
                cell2.innerHTML = currentChannelStr;
                cell3.innerHTML = json.price;
                cell4.innerHTML = json.date;
            }

        }
        console.log(JSON.stringify(json));
    }


    buildTableRow(rowData) {
        if (rowData != null) {
            // Find a <table> element with id="myTable":
            var table = document.getElementById("offerTableBody");

            // Create an empty <tr> element and add it to the 1st position of the table:
            var row = table.insertRow(0);

            // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
            var cell2 = row.insertCell(1); //USer
            cell2.className += " col text-overflow: ellipsis";
            var cell3 = row.insertCell(2); //Price
            cell3.className += " col text-overflow: ellipsis";
            var cell4 = row.insertCell(3); //Date
            cell4.className += " col text-overflow: ellipsis";

            cell2.innerHTML = rowData.user;
            cell3.innerHTML = rowData.Price;
            cell4.innerHTML = rowData.date;
        }

    }
}


let vp = new Vleppo();







