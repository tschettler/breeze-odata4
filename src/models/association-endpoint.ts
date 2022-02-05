import { Edm, oData } from 'ts-odatajs';

/**
 * @classdesc Association endpoint for referential constraints.
 */
export class AssociationEndpoint {
    private ConstrainMany = '*';
    private ConstrainOne = '1';
    private _propertyName: string;

    /**
     * Containing entity type of association endpoint.
     */
    public containingEntityType: string;

    /**
     * Navigation property of association endpoint.
     */
    public navigationProperty?: Edm.NavigationProperty;

    /**
     * Partner entity type of association endpoint.
     */
    public partnerEntityType: string;

    /**
     * Referential constraint of association endpoint.
     */
    public referentialConstraint: Edm.ReferentialConstraint[] = [];

    /** Creates an association endpoint.
     * @constructor
     * @param  {Partial<AssociationEndpoint>} init? Optional initialization options.
     */
    public constructor(init?: Partial<AssociationEndpoint>) {
        Object.assign(this, init);
    }

    /**
     * Gets containing entity short name.
     */
    public get containingEntityShortName(): string {
        const result = this.containingEntityType.split('.').pop();

        return result;
    }

    /**
     * Gets whether the navigation property type is a collection.
     */
    public get isCollection(): boolean {
        const result = !!this.navigationProperty
            && oData.utils.isCollectionType(this.navigationProperty.type);

        return result;
    }

    /**
     * Gets whether the association endpoint is mapped to a navigation property.
     */
    public get isMapped(): boolean {
        const result = !!this.navigationProperty;

        return result;
    }

    /**
     * Gets the multiplicity of the association endpoint.
     */
    public get multiplicity(): string {
        const result = this.isCollection ? this.ConstrainMany : this.ConstrainOne;

        return result;
    }

    /**
     * Gets the order of the association endpoint, preferring mapped collections.
     */
    public get order(): number {
        const result = Number(!this.isMapped) * 2 + Number(this.isCollection);

        return result;
    }

    /**
     * Gets the partner entity type short name.
     */
    public get partnerEntityShortName(): string {
        const result = this.partnerEntityType.split('.').pop();

        return result;
    }

    /**
     * Gets the navigation property name.
     */
    public get propertyName(): string {
        const result = this.isMapped ? this.navigationProperty.name : this._propertyName;

        return result;
    }

    /**
     * Sets a custom property name.
     */
    public set propertyName(value: string) {
        this._propertyName = value;
    }

    /**
     * Gets the role name of the association endpoint.
     */
    public get role(): string {
        const result = `${this.containingEntityShortName}_${this.propertyName}`;

        return result;
    }
}
