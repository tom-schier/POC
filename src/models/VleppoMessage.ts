export class VleppoMessage {

    channel: string;
    description: string;
    transType: string;
    transAmount: string;
    transDate: string;
    userId: string;
    address: string;
    public isVerified: boolean = false;
    
    constructor(channel, transType, transAmount, transDate, userId, description, address) {
        this.channel = channel;
        this.description = description;
        this.transType = transType;
        this.transAmount = transAmount;
        this.transDate = transDate;
        this.userId = userId;
        this.address = address
    }
}