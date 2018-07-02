export class Vleppo {
    
    get mamState() { return this._mamState; }
    set mamState(value) { this._mamState = value;}

    get iota() { return this._iota; }
    set iota(value) { this._iota = value;}

    get channelRoot() { return this._channelRoot; }
    set channelRoot(value) { this._channelRoot = value;}

    get Mam() { return this._Mam; }
    set Mam(value) { this._Mam = value;}

    constructor() {
      //  this.connectToIota();
        this.Mam = require('mam.web.js');
    };
  
     async createChannel(){
        var descr = document.getElementById("itemDescription").value;
        var tag = document.getElementById("itemTag").value;
        var itemObj = { "descr": descr, "tag": tag};


        this.connectToIota();

        let trytes = this.iota.utils.toTrytes(JSON.stringify(itemObj));
        this.mamState = this.Mam.init(this.iota, trytes, 2);

        // Attach the payload
        let message = this.Mam.create(this.mamState, trytes);
        this.mamState = message.state;
        let obj = await this.Mam.attach(message.payload, message.address);
        
        this.channelRoot = message.root;
        this.retrieve();
        document.getElementById("messageRoot").value = this.channelRoot;
        return message.root;    
    }

    connectToIota() {
        let iota = new IOTA({
            'host': 'https://nodes.testnet.iota.org',
            'port': 443
        });
        this.iota = iota;
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

        var price = document.getElementById("itemPrice").value;

        let dateStamp = this.getDateAndTime();

        var itemObj = { "user": "Tomas", "price": price, "date": dateStamp};
        // Create MAM Payload
        let trytes = this.iota.utils.toTrytes(JSON.stringify(itemObj));
        let message = this.Mam.create(this.mamState, trytes);
        // Save new mamState
        this.mamState = message.state;
        // Attach the payload
        await this.Mam.attach(message.payload, message.address);
        console.log("Publich succeded")
    }

    async retrieve() {
        let theRoot = this.channelRoot;
        while (true) {
            let resp = await this.Mam.fetch(theRoot, null, null, this.parseReturnValues);//
            theRoot = resp.nextRoot;
        }
    }

    parseReturnValues(data){
        let iota = new IOTA({
            'host': 'https://nodes.testnet.iota.org',
            'port': 443
        });
        let json = JSON.parse(iota.utils.fromTrytes(data));
        if (json != null) {
            // Find a <table> element with id="myTable":
            var table = document.getElementById("offerTableBody");

            // Create an empty <tr> element and add it to the 1st position of the table:
            var row = table.insertRow(0);

            // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
            var cell2 = row.insertCell(-1); //USer
            cell2.className += " col text-overflow: ellipsis";
            var cell3 = row.insertCell(-1); //Price
            cell3.className += " col text-overflow: ellipsis";
            var cell4 = row.insertCell(-1); //Date
            cell4.className += " col text-overflow: ellipsis";

            cell2.innerHTML = json.user;
            cell3.innerHTML = json.price;   
            cell4.innerHTML = json.date;
        }
        console.log(JSON.stringify(json));
    }


    buildTableRow(rowData){
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
