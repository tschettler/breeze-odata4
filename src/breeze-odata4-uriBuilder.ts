import { EntityQuery, EntityType, MetadataStore, UriBuilder, Predicate, OrderByClause, SelectClause, ExpandClause } from 'breeze-client';

export class OData4UriBuilder implements UriBuilder {
    private entityType: EntityType;

    public name = 'odata4';

    public initialize(): void { }

    public buildUri(entityQuery: EntityQuery, metadataStore: MetadataStore) {
        // force entityType validation;
        let entityType = (<any>entityQuery)._getFromEntityType(metadataStore, false);
        if (!entityType) {
            // anonymous type but still has naming convention info avail
            entityType = new EntityType(metadataStore);
        }

        const queryOptions = {};
        queryOptions['$filter'] = this.toWhereODataFragment(entityQuery.wherePredicate);
        queryOptions['$orderby'] = this.toOrderByODataFragment(entityQuery.orderByClause);

        if (entityQuery.skipCount) {
            queryOptions['$skip'] = entityQuery.skipCount;
        }

        if (entityQuery.takeCount != null) {
            queryOptions['$top'] = entityQuery.takeCount;
        }

        queryOptions['$expand'] = this.toExpandODataFragment(entityQuery.expandClause);
        queryOptions['$select'] = this.toSelectODataFragment(entityQuery.selectClause);

        if (entityQuery.inlineCountEnabled) {
            queryOptions['$count'] = true;
        }

        const qoText = this.toQueryOptionsString(queryOptions);
        return entityQuery.resourceName + qoText;
    }

        private toWhereODataFragment(wherePredicate: Predicate) {
      if (!wherePredicate) {
          return undefined;
        };

      // validation occurs inside of the toODataFragment call here.
      return wherePredicate.toODataFragment({ entityType: this.entityType});
    }

    private toOrderByODataFragment(orderByClause: OrderByClause) {
      if (!orderByClause) {
          return undefined;
        };

      orderByClause.validate(this.entityType);
      const strings = orderByClause.items.map(item => {
        return this.entityType.clientPropertyPathToServer(item.propertyPath, '/') + (item.isDesc ? ' desc' : '');
      });
      // should return something like CompanyName,Address/City desc
      return strings.join(',');
    }

    private toSelectODataFragment(selectClause: SelectClause) {
      if (!selectClause) {
          return undefined;
        };
      selectClause.validate(this.entityType);
      const frag = selectClause.propertyPaths.map(pp => {
        return  this.entityType.clientPropertyPathToServer(pp, '/');
      }).join(',');

      return frag;
    }

    private toExpandODataFragment(expandClause: ExpandClause) {
      if (!expandClause) {
          return undefined;
    };
      // no validate on expand clauses currently.
      // expandClause.validate(entityType);
      const frag = expandClause.propertyPaths.map(pp => {
        return this.entityType.clientPropertyPathToServer(pp, '/');
      }).join(',');
      return frag;
    }

    private toQueryOptionsString(queryOptions) {
      const qoStrings = [];
      // tslint:disable-next-line:forin
      for (const qoName in queryOptions) {
        const qoValue = queryOptions[qoName];
        if (qoValue !== undefined) {
          if (qoValue instanceof Array) {
            qoValue.forEach(qov => {
              qoStrings.push(qoName + '=' + encodeURIComponent(qov));
            });
          } else {
            qoStrings.push(qoName + '=' + encodeURIComponent(qoValue));
          }
        }
      }

      if (qoStrings.length > 0) {
        return '?' + qoStrings.join('&');
      } else {
        return '';
      }
    }
}
