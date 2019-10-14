import { Edm, oData } from 'ts-odatajs';

export class AssociationEndpoint {
    private ConstrainMany = '*';
    private ConstrainOne = '1';

    public containingEntityType: string;
    public navigationProperty?: Edm.NavigationProperty;
    public partnerEntityType: string;
    public propertyName?: string;

    public constructor(init?: Partial<AssociationEndpoint>) {
        Object.assign(this, init);
    }

    public get containingEntityShortName(): string {
        const result = this.containingEntityType.split('.').pop();

        return result;
    }

    public get isCollection(): boolean {
        const result = !!this.navigationProperty
            && oData.utils.isCollectionType(this.navigationProperty.type);

        return result;
    }

    public get isMapped(): boolean {
        const result = !!this.navigationProperty;

        return result;
    }

    public get multiplicity(): string {
        const result = this.isCollection ? this.ConstrainMany : this.ConstrainOne;

        return result;
    }

    public get order(): number {
        const result = Number(!this.isMapped) * 2 + Number(this.isCollection);

        return result;
    }

    public get role(): string {
        const propertyName = this.isMapped ? this.navigationProperty.name : this.propertyName;

        const result = `${this.containingEntityShortName}_${propertyName}`;

        return result;
    }
}
