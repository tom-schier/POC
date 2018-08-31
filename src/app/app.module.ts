

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { TradeComponent } from './trade/trade.component';
import {NgxPopperModule} from 'ngx-popper';



@NgModule({
  declarations: [
    AppComponent,
    TradeComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    NgxPopperModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
