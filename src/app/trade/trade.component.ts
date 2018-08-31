
import { Component, OnInit, Input } from '@angular/core';
import * as IOTA from "iota.lib.js";
import { VleppoMessage } from '../../models/VleppoMessage';
import { VleppoItem } from '../../models/VleppoItems';
import { VleppoConst } from '../common/vleppoUtils';

declare var Mam: any;

//TESTNET
//'host': 'https://testnet140.tangle.works' , 443,
//'host': 'http://p102.iotaledger.net', 14700
//'host': 'https://nodes.testnet.iota.org', 443


//MAINNET
//'host': 'https://nodes.thetangle.org', 443
//'host': 'https://nodes.tangle.works', 443
//'host': 'http://node.lukaseder.de', 14265
//'host': 'https://field.carriota.com', 443
@Component({
  selector: 'app-trade',
  templateUrl: './trade.component.html',
  styleUrls: ['./trade.component.css']
})
export class TradeComponent implements OnInit {

  iota: any;
  mamState: any;
  channelRoot: string;
  currentUser: string;

  @Input() vleppoItems: Array<VleppoItem>;

  public vleppoItemTag= VleppoConst.VleppoTag;

  public initialPrice: string;
  public itemDescription: string;
  public channelNew: string;
  public currentItem: string;
  public itemBid: string;
  public itemOffer: string;

  public bidArray: Array<VleppoMessage>;
  public offerArray: Array<VleppoMessage>;

  public currentVleppo: VleppoItem;

  constructor() {  
    this.bidArray = new Array<VleppoMessage>();  
    this.offerArray = new Array<VleppoMessage>(); 
  };

  ngOnInit() {
    this.iota = new IOTA({
      'host': 'https://testnet140.tangle.works',
      'port': 443
    });
    let seed = this.iota.utils.toTrytes("VLEPPOTESTNET");
    this.mamState = Mam.init(this.iota, seed, 2);
  }

  ngAfterInit() {
    this.setPropertiesForVleppoChannels(this.vleppoItems);
  }

  async publishToNewChannel() {

    this.clearTable();
    let price = this.initialPrice;
    let descr = this.itemDescription;
    this.clearForm();
    this.initialPrice = price;
    this.itemDescription = descr;

    let dateStamp = this.getDateAndTime();
    this.currentUser = "Tomas";


    let tagValue = this.iota.utils.toTrytes(this.vleppoItemTag);
    var itemObj = new VleppoMessage('channelRoot', "NEW", price , dateStamp, this.currentUser, descr, null);
    let trytes = this.iota.utils.toTrytes(JSON.stringify(itemObj));
    this.mamState = Mam.init(this.iota, undefined, 2);
    let message = Mam.create(this.mamState, trytes);
    this.mamState = message.state;
    let newOffer = new VleppoMessage(message.root, "NEW", price , dateStamp, this.currentUser, descr, message.address);
    this.offerArray.push(newOffer);
    let obj = await Mam.attach(message.payload, message.address, undefined, undefined, tagValue);
    this.channelRoot = message.root;
    this.channelNew = '';

    console.log("NEW Publish succeeeded to " + this.channelRoot);
    this.startDateRetrieval(this.channelRoot);
  }

  async publishBid() {

    let dateStamp = this.getDateAndTime();

    this.currentUser = "Tomas";
    var itemObj = new VleppoMessage(this.channelRoot, "BID", this.itemBid, dateStamp, this.currentUser, this.currentItem, null);

    let trytes = this.iota.utils.toTrytes(JSON.stringify(itemObj));
    let tagValue = this.iota.utils.toTrytes(this.vleppoItemTag);
    let message = Mam.create(this.mamState, trytes);
    this.mamState = message.state;
    let newBid = new VleppoMessage(message.root, "NEW", this.itemBid , dateStamp, this.currentUser, this.currentItem, message.address);
    this.bidArray.push(newBid);
    let obj = await Mam.attach(message.payload, message.address, undefined, undefined, tagValue);
    console.log("BID Publish succeeeded to " + this.channelRoot);
  }

  async publishOffer() {

    let dateStamp = this.getDateAndTime();

    this.currentUser = "Tomas";
    var itemObj = new VleppoMessage(this.channelRoot, "OFFER", this.itemOffer, dateStamp, this.currentUser, this.currentItem, null);

    let trytes = this.iota.utils.toTrytes(JSON.stringify(itemObj));
    let tagValue = this.iota.utils.toTrytes(this.vleppoItemTag);
    let message = Mam.create(this.mamState, trytes);
    this.mamState = message.state;
    let newOffer = new VleppoMessage(message.root, "NEW", this.itemOffer , dateStamp, this.currentUser, this.currentItem, message.address);
    this.offerArray.push(newOffer);
    let obj = await Mam.attach(message.payload, message.address, undefined, undefined, tagValue);
    console.log("OFFER Publish succeeeded to " + this.channelRoot);
  }

  async publish(transType) {

    if ((transType == 'BID' || transType == 'OFFER') && this.channelRoot == null) {
        console.log("No channel yet. exit here");
        return;
    }

    if (transType == 'BID') {
      this.publishBid();
    }
    if (transType == 'NEW') {
      this.publishToNewChannel();
    }
    if (transType == 'OFFER') {
      this.publishOffer();
    }
  }

  retrieve() {
    this.clearTable();
    let ch = this.channelNew;
    this.clearForm();
    this.channelRoot = ch;
    this.mamState = Mam.init(this.iota, undefined, 2);
    this.startDateRetrieval(this.channelNew);
  }

  public async startDateRetrieval(rootVal) {
    if (rootVal == null)
      return;
    let resp = await Mam.fetch(rootVal, 'public', null, (data) => {
      let json = JSON.parse(this.iota.utils.fromTrytes(data));
      console.log("Retrieved: " + json);
      json.isVerified = true;
      this.buildDataTables(json, rootVal);

    });
    this.startDateRetrieval(resp.nextRoot);
  }


  setPropertiesForVleppoChannels(vleppoItems: Array<VleppoItem>){  
    this.mamState = Mam.init(this.iota, undefined, 2);
    let vleppoListLength = vleppoItems.length;
    for(let i =0; i < vleppoListLength; i++) {
      let channel = vleppoItems[i].channelId;
      let resp = Mam.fetch(channel, 'public', null, (data) => {
        let json = JSON.parse(this.iota.utils.fromTrytes(data));
        vleppoItems[i].channelName = json.description;
        vleppoItems[i].dateCreated = json.transDate;
        vleppoItems[i].userId = json.userId;
        vleppoItems[i].initialAmount = json.transAmount;
      });
    }

  }

  async getChannelItemName(rootVal: any): Promise<string>{
    this.mamState = Mam.init(this.iota, undefined, 2);
    let st = '';
    let resp = await Mam.fetch(rootVal, 'public', null, (data) => {
      let json = JSON.parse(this.iota.utils.fromTrytes(data));
      st = json.description;
    });
    return st;
  }

  /********************** Utility stuff *******************************/
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

  clearTable() {
    this.bidArray = [];
    this.offerArray = [];
  }

  clearForm() {
    this.initialPrice = '';
    this.itemDescription = '';
    this.currentItem  = '';
    this.itemBid  = '';
    this.itemOffer  = '';
  }

  parseReturnValues(data) {

    let json = JSON.parse(this.iota.utils.fromTrytes(data));
    if (json != null) {

      let transType = json.transType;
      var table;

      if (transType == 'BID')
        table = <HTMLTableElement>document.getElementById("bidTableBody");
      if (transType == 'OFFER')
        table = <HTMLTableElement>document.getElementById("offerTableBody");

      if (transType == 'NEW') {
        table = <HTMLTableElement>document.getElementById("offerTableBody");
        this.currentItem = json.description;
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

  buildDataTables(json: any, rootVal: string) {
    if (json != null) {         
      let transType = json.transType;

      if (transType == 'BID') {
        let existingMsgIdx = this.bidArray.findIndex(x => x.address == rootVal);
        if (existingMsgIdx == -1) {
          let msg : VleppoMessage = new VleppoMessage(json.channel, json.transType, json.transAmount, json.transDate, json.userId, json.description, json.address);
          msg.isVerified = json.isVerified;
          this.bidArray.push(msg);
        }
        else {
            this.bidArray[existingMsgIdx].isVerified = true;
        } 
       
      }
          
      if (transType == 'OFFER') {
        let existingMsgIdx = this.offerArray.findIndex(x => x.address == rootVal);
        if (existingMsgIdx == -1) {
          let msg : VleppoMessage = new VleppoMessage(json.channel, json.transType, json.transAmount, json.transDate, json.userId, json.description, json.address);
          msg.isVerified = json.isVerified;
          this.offerArray.push(msg);
        }
        else {
            this.offerArray[existingMsgIdx].isVerified = true;
        } 
      }
          

      if (transType == 'NEW') {
        let existingMsgIdx = this.offerArray.findIndex(x => x.address == rootVal);
        if (existingMsgIdx == -1) {
          let msg : VleppoMessage = new VleppoMessage(json.channel, json.transType, json.transAmount, json.transDate, json.userId, json.description, json.address);
          msg.isVerified = json.isVerified;
          this.offerArray.push(msg);
        }
        else {
            this.offerArray[existingMsgIdx].isVerified = true;
        } 
        this.currentItem = json.description;
      }

    }
    console.log(JSON.stringify(json));
  }
}