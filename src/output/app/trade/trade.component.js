"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var core_1 = require("@angular/core");
require("randombytes");
//TESTNET
//'host': 'https://testnet140.tangle.works' , 443,
//'host': 'http://p102.iotaledger.net', 14700
//'host': 'https://nodes.testnet.iota.org', 443
//MAINNET
//'host': 'https://nodes.thetangle.org', 443
//'host': 'https://nodes.tangle.works', 443
//'host': 'http://node.lukaseder.de', 14265
//'host': 'https://field.carriota.com', 443
var TradeComponent = /** @class */ (function () {
    function TradeComponent() {
        var _this = this;
        this.doPublish = function () {
            var trytes = _this.iota.utils.toTrytes(JSON.stringify("My message"));
            var message = Mam.create(_this.mamState, trytes);
            // Attach the payload
            Mam.attach(message.payload, message.address).then(function (e) {
                console.log("I am here" + e);
            }, function (error) {
                console.log("I am in ERROR" + error);
            });
            return message.root;
        };
    }
    TradeComponent.prototype.ngOnInit = function () {
        this.iota = new IOTA({
            'host': 'https://nodes.testnet.iota.org',
            'port': 443,
            'sandbox': true
        });
    };
    TradeComponent.prototype.doIt = function () {
        var trytes = this.iota.utils.toTrytes(JSON.stringify("MySeed"));
        this.mamState = Mam.init(this.iota, trytes, 2);
        console.log("MAM initialised " + this.mamState);
        this.iota.api.getNodeInfo(function (error, success) {
            if (error) {
                console.error(error);
            }
            else {
                console.log(success);
            }
        });
    };
    TradeComponent = __decorate([
        core_1.Component({
            selector: 'app-trade',
            templateUrl: './trade.component.html',
            styleUrls: ['./trade.component.css']
        })
    ], TradeComponent);
    return TradeComponent;
}());
exports.TradeComponent = TradeComponent;
