import { Edm, oData } from 'ts-odatajs';

export class AssociationEndpoint {
    private ConstrainMany = '*';
    private ConstrainOne = '1';
    private _propertyName: string;

    public containingEntityType: string;
    public navigationProperty?: Edm.NavigationProperty;
    public partnerEntityType: string;
    public referentialConstraint: Edm.ReferentialConstraint[] = [];

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

    public get partnerEntityShortName(): string {
        const result = this.partnerEntityType.split('.').pop();

        return result;
    }

    public get propertyName(): string {
        const result = this.isMapped ? this.navigationProperty.name : this._propertyName;

        return result;
    }

    public set propertyName(value: string) {
        this._propertyName = value;
    }

    public get role(): string {
        const result = `${this.containingEntityShortName}_${this.propertyName}`;

        return result;
    }
}
