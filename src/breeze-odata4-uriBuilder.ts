import { EntityQuery, EntityType, MetadataStore, UriBuilder, Predicate, OrderByClause, SelectClause, ExpandClause, IProperty } from 'breeze-client';

export interface QueryOptionsBase {
  expand?: ExpandOptions[];
  filter?: string;
  select?: string[];
}

export interface QueryOptions extends QueryOptionsBase {
  count?: boolean;
  orderby?: string;
  skip?: number;
  top?: number;
}

export interface ExpandOptions extends QueryOptionsBase {
  name: string;
}

export class OData4UriBuilder implements UriBuilder {
  private entityType: EntityType;

  private queryOptions: QueryOptions = {};

  public name = 'odata4';

  public initialize(): void { }

  public buildUri(entityQuery: EntityQuery, metadataStore: MetadataStore) {
    // force entityType validation;
    let entityType = (<any>entityQuery)._getFromEntityType(metadataStore, false);
    if (!entityType) {
      // anonymous type but still has naming convention info avail
      entityType = new EntityType(metadataStore);
    }

    if (entityQuery.inlineCountEnabled) {
      this.queryOptions.count = true;
    }

    if (entityQuery.skipCount) {
      this.queryOptions.skip = entityQuery.skipCount;
    }

    if (entityQuery.takeCount != null) {
      this.queryOptions.top = entityQuery.takeCount;
    }

    this.addExpandOptions(entityQuery.expandClause);

    this.addSelectOptions(entityQuery.selectClause);

    this.queryOptions['$filter'] = this.toWhereODataFragment(entityQuery.wherePredicate);


    this.queryOptions['$orderby'] = this.toOrderByODataFragment(entityQuery.orderByClause);


    const qoText = this.toQueryOptionsString(this.queryOptions);
    return entityQuery.resourceName + qoText;
  }


  private getQueryOptions(rootOptions: QueryOptionsBase, propertyPath: IProperty[]): QueryOptionsBase {
    const path = [].concat(propertyPath);
    const rootProperty = path.shift().name;

    if (!path.length) {
      return rootOptions;
    }

    let nextExpand = rootOptions.expand.find(e => e.name === rootProperty);
    if (!nextExpand) {
      nextExpand = { name: rootProperty, expand: [] };
      rootOptions.expand.push(nextExpand);
    }

    return this.getQueryOptions(nextExpand, path);
  }

  private addExpandOptions(expandClause: ExpandClause) {
    if (!expandClause) {
      return;
    };

    // no validate on expand clauses currently.
    // expandClause.validate(entityType);
    expandClause.propertyPaths.forEach(pp => {
      const props = this.entityType.getPropertiesOnPath(pp, false, true);
      const workingOptions = this.getQueryOptions(this.queryOptions, props);

      const expandOptions = { name: props.pop().name, expand: [] };
      workingOptions.expand.push(expandOptions);
    });
  }

  private addSelectOptions(selectClause: SelectClause): void {
    const result = [];
    if (!selectClause) {
      return;
    }

    selectClause.validate(this.entityType);

    selectClause.propertyPaths.forEach(pp => {
      const props = this.entityType.getPropertiesOnPath(pp, false, true);
      const workingOptions = this.getQueryOptions(this.queryOptions, props);

      workingOptions.select = workingOptions.select || [];
      workingOptions.select.push(props.pop().name);
    });
  }

  private toWhereODataFragment(wherePredicate: Predicate) {
    if (!wherePredicate) {
      return undefined;
    };

    // validation occurs inside of the toODataFragment call here.
    return wherePredicate.toODataFragment({ entityType: this.entityType });
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
