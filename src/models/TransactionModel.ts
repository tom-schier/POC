export class TransactionModel {

    userId: string;
    transAmount: string;
    transDate: string;
    transType: string;

    constructor(transType, transAmount, transDate, userId) {
        this.transType = transType;
        this.transAmount = transAmount;
        this.transDate = transDate;
        this.userId = userId;
    }
}