export class Employee {
    public id: number;
    public name: string;
    public lastName: string;
    public idCard: string;
    public section: string;

    constructor(employeeData: any) {
        this.id = employeeData.id;
        this.name = employeeData.name;
        this.lastName = employeeData.lastName;
        this.idCard = employeeData.idCard;
        this.section = employeeData.section;
    }
}
