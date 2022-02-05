import { EntityQuery } from 'breeze-client';

export const ExpandParamsKey = 'expandParams';

/**
 * @classdesc OData4 entity query which enables nested expand query functionality.
 */
export class OData4EntityQuery extends EntityQuery {
    /**
     * Add an expand clause to the Entity Query.
     * @param propertyPaths The property paths.
     * @param [subQuery] The subquery, which will be applied to the expand.
     * @returns The entity query instance.
     * @example
     * ```ts
     *  const navProperty = 'author';
     *  query = query.where('lastName', 'eq', 'Testington');
     *
     *  const newQuery = new OData4EntityQuery('Book').expand(navProperty, query);
     * ```
     *
     * Results in an OData query with the url: `Books?$expand=Author($filter=lastName%20eq%20'Testington')`
     */
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
