import { EntityQuery } from 'breeze-client';

export const ExpandParamsKey = 'expandParams';

export class OData4EntityQuery extends EntityQuery {
    public expand(propertyPaths: string | string[], subQuery?: EntityQuery): OData4EntityQuery {
        if (propertyPaths instanceof Array || !subQuery) {
            return super.expand(propertyPaths);
        }

        // save the subquery for later
        this.parameters[ExpandParamsKey] = this.parameters[ExpandParamsKey] || {};
        this.parameters[ExpandParamsKey][propertyPaths] = subQuery;

        return this;
    }
}
