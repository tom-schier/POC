import { Component, OnInit } from '@angular/core';
import {TradeComponent} from './trade/trade.component';
import { VleppoItem } from '../models/VleppoItems';
import * as IOTA from "iota.lib.js";
import { VleppoConst } from './common/vleppoUtils';

declare var Mam: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Vleppo';
  iota: any;
  mamState: any;
  public vleppoItemTag= VleppoConst.VleppoTag;
  public vleppoItems: Array<VleppoItem>;

  constructor(){
    this.vleppoItems = new Array<VleppoItem>(); 
  }

  ngOnInit(){
    this.iota = new IOTA({
      'host': 'https://nodes.testnet.iota.org',
      'port': 443
    });
    this.mamState = Mam.init(this.iota, undefined, 2);
    this.buildListOfVleppoItems(this.vleppoItems);
    //this.setPropertiesForVleppoChannels(this.vleppoItems);
  }

  async buildListOfVleppoItems(vleppoItems: Array<VleppoItem>): Promise<any>{
    let tagValue = this.iota.utils.toTrytes(this.vleppoItemTag);
  
    await this.iota.api.findTransactionObjects({ tags: [tagValue] }, function(error, success) {
      if (error) {
          console.error(error);
      } else {
          let successLength = success.length;
          for (let i = 0; i < successLength; i++) {
            let add = success[i].address;
            const idx = vleppoItems.findIndex(x => x.channelId == add);
            if (idx == -1) {
              let newItem = new VleppoItem();
              newItem.channelId = success[i].address;
              vleppoItems.push(newItem);
            }
          }
      }
    });
    //await this.setPropertiesForVleppoChannels(this.vleppoItems);
  }

  async setPropertiesForVleppoChannels(vleppoItems: Array<VleppoItem>){  
    this.mamState = Mam.init(this.iota, undefined, 2);
    let vleppoListLength = vleppoItems.length;
    for(let i =0; i < vleppoListLength; i++) {
      let channel = vleppoItems[i].channelId;
      await Mam.fetch(channel, 'public', null, (data) => {
        let json = JSON.parse(this.iota.utils.fromTrytes(data));
        vleppoItems[i].channelName = json.description;
        vleppoItems[i].dateCreated = json.transDate;
        vleppoItems[i].userId = json.userId;
        vleppoItems[i].initialAmount = json.transAmount;
        //console.log("Retrieved: " + json);
      });
    }

  }
}
