export class Admin {
    public id: number;
    public name: string;
    public email: string;
    public password: string;
    public serialNumber: string;

    constructor(adminData: any) {
        this.id = adminData.id;
        this.name = adminData.name;
        this.email = adminData.email;
        this.password = adminData.password;
        this.serialNumber = adminData.serialNumber;
    }
}
