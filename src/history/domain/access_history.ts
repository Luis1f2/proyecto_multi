export class AccessHistory {
    public id: number;
    public name: string;
    public lastName: string;
    public section: string;
    public entryTime: Date;
    public exitTime: Date;
    public entryPhoto: string;
    public exitPhoto: string;

    constructor(historyData: any) {
        this.id = historyData.id;
        this.name = historyData.name;
        this.lastName = historyData.lastName;
        this.section = historyData.section;
        this.entryTime = historyData.entryTime;
        this.exitTime = historyData.exitTime;
        this.entryPhoto = historyData.entryPhoto;
        this.exitPhoto = historyData.exitPhoto;
    }
}
