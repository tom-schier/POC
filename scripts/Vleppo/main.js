
//'host': 'https://nodes.testnet.iota.org',
// 'host': 'https://nodes.devnet.thetangle.org',

currentChannelStr = "";
currentUser = "";
iota = new IOTA({
    'host': 'https://nodes.testnet.iota.org',
    'port': 443
});
channelRoot = "";
//currentChannelRoot = "";
mamState = null;
Mam = null;
getDataCallback = null;

class VleppoMessage {
    constructor(channel, transType, transAmount, transDate, userId, description) {
        this.channel = channel;
        this.description = description;
        this.transType = transType;
        this.transAmount = transAmount;
        this.transDate = transDate;
        this.userId = userId;
    }
}

class Vleppo {

    constructor() {
        Mam = require('mam.web.js');       
    };

    clearTable() {
        var numRows = document.getElementById("offerTableBody").getElementsByTagName("tr").length;
        for (let i = numRows - 1; i >= 0; i--) {
            try {
                document.getElementById("offerTableBody").deleteRow(i);
            } catch (e) {
                console.log("WTF " + i);
            }
        }
        var numRows1 = document.getElementById("bidTableBody").getElementsByTagName("tr").length;
        for (let i = numRows1 - 1; i >= 0; i--) {
            try {
                document.getElementById("bidTableBody").deleteRow(i);
            } catch (e) {
                console.log("WTF " + i);
            }
        }
    }

    async createChannel() {
        var descr = document.getElementById("itemDescription").value;
        var itemObj = { "descr": descr };

        let trytes = iota.utils.toTrytes(JSON.stringify(itemObj));
        mamState = Mam.init(iota, undefined, 2);

        let message = Mam.create(mamState, trytes);
        mamState = message.state;

        console.log("Channel created." + mamState.seed);

        document.getElementById("channelNew").value = '';
        document.getElementById("messageRoot").value = channelRoot;

        let tagValue = iota.utils.toTrytes("VLEPPO MARKET");

        channelRoot = message.root;
        let obj = await Mam.attach(message.payload, message.address, undefined, undefined, tagValue);
        this.retrieve();
        return mamState.seed;
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

    async publishToNewChannel(){

        this.clearTable();
        let transAmount = document.getElementById("initialPrice").value;
        let descr = document.getElementById("itemDescription").value;
        let dateStamp = this.getDateAndTime();
        currentUser = "Tomas";

        document.getElementById("channelNew").value = '';
        document.getElementById("messageRoot").value = '';
        document.getElementById("currentItem").value = descr;

        let tagValue = iota.utils.toTrytes("VLEPPO MARKET");
        var itemObj = new VleppoMessage('channelRoot',"NEW",transAmount,dateStamp,currentUser, descr);
        let trytes = iota.utils.toTrytes(JSON.stringify(itemObj));
        mamState = Mam.init(iota, undefined, 2);
        let message = Mam.create(mamState, trytes);
        mamState = message.state;
        let obj = await Mam.attach(message.payload, message.address, undefined, undefined, tagValue);
        channelRoot = message.root;
        document.getElementById("channelNew").value = '';
        document.getElementById("messageRoot").value = channelRoot;
        console.log("NEW Publish succeeeded to " + channelRoot);
        this.startDateRetrieval(channelRoot);
    }

    async publishBid(){

        let transAmount = document.getElementById("itemBid").value;
        let descr = document.getElementById("currentItem").value;
        let dateStamp = this.getDateAndTime();

        currentUser = "Tomas";
        var itemObj = new VleppoMessage(channelRoot,"BID",transAmount,dateStamp,currentUser, descr);

        let trytes = iota.utils.toTrytes(JSON.stringify(itemObj));
        let tagValue = iota.utils.toTrytes("VLEPPO MARKET");
        let message = Mam.create(mamState, trytes);
        mamState = message.state;
        let obj = await Mam.attach(message.payload, message.address, undefined, undefined, tagValue);
        console.log("BID Publish succeeeded to " + channelRoot);        
    }

    async publishOffer(){
        let transAmount = document.getElementById("itemOffer").value;
        let descr = document.getElementById("currentItem").value;
        let dateStamp = this.getDateAndTime();

        currentUser = "Tomas";
        var itemObj = new VleppoMessage(channelRoot,"OFFER",transAmount,dateStamp,currentUser, descr);

        let trytes = iota.utils.toTrytes(JSON.stringify(itemObj));
        let tagValue = iota.utils.toTrytes("VLEPPO MARKET");
        let message = Mam.create(mamState, trytes);
        mamState = message.state;
        let obj = await Mam.attach(message.payload, message.address, undefined, undefined, tagValue);
        console.log("OFFER Publish succeeeded to " + channelRoot);
    }

    async publish(transType) {

        if (transType == 'BID'){
            this.publishBid();
        }
        if (transType == 'NEW'){
            this.publishToNewChannel();
        } 
        if (transType == 'OFFER'){
            this.publishOffer();
        }
    }

    
	async startDateRetrieval(rootVal) {
			var resp = await Mam.fetch(rootVal, 'public', null, (data) => {
				let json = JSON.parse(iota.utils.fromTrytes(data));
                console.log("Retrieved: " + json);
                this.parseReturnValues(data);

			});
		    this.startDateRetrieval(resp.nextRoot);
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

        document.getElementById("initialPrice").value = '';
        document.getElementById("itemDescription").value = '';

        document.getElementById("messageRoot").value = channelRoot;
        document.getElementById("currentItem").value = ""; 
        this.clearTable();
        this.startDateRetrieval(channelRoot);
    }

    parseReturnValues(data) {

        let json = JSON.parse(iota.utils.fromTrytes(data));
        if (json != null) {

            let transType = json.transType;
            var table;

            if (transType == 'BID')
                table = document.getElementById("bidTableBody");
            if (transType == 'OFFER')
                table = document.getElementById("offerTableBody");

            if (transType == 'NEW') {
                table = document.getElementById("offerTableBody"); 
                document.getElementById("currentItem").value = json.description; 
            }
                              
            var row = table.insertRow(-1);

            var cell1 = row.insertCell(-1); //User
            cell1.className += " col-4 text-overflow: ellipsis";

            var cell3 = row.insertCell(-1); //Price
            cell3.className += " col-3 text-overflow: ellipsis";
            var cell4 = row.insertCell(-1); //Date
            cell4.className += " col-5 text-overflow: ellipsis";  
            cell1.innerHTML = json.userId;
            cell3.innerHTML = json.transAmount;
            cell4.innerHTML = json.transDate;

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







