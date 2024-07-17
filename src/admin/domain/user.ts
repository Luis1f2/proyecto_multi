export class User {
    public id: number;
    public name: string;
    public email: string;
    public password: string;
    public serialNumber: string;

    constructor(userData: any) {
        this.id = userData.id;
        this.name = userData.name;
        this.email = userData.email;
        this.password = userData.password;
        this.serialNumber = userData.serialNumber;
    }
}
