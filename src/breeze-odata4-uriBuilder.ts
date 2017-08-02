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

  public name = 'odata4';

  public initialize(): void { }

  public buildUri(entityQuery: EntityQuery, metadataStore: MetadataStore) {
    // force entityType validation;
    let entityType = (<any>entityQuery)._getFromEntityType(metadataStore, false);
    if (!entityType) {
      // anonymous type but still has naming convention info avail
      entityType = new EntityType(metadataStore);
    }

    const queryOptions: QueryOptions = {};

    if (entityQuery.inlineCountEnabled) {
      queryOptions.count = true;
    }

    if (entityQuery.skipCount) {
      queryOptions.skip = entityQuery.skipCount;
    }

    if (entityQuery.takeCount != null) {
      queryOptions.top = entityQuery.takeCount;
    }

    queryOptions.expand = this.toExpandOptions(entityQuery.expandClause);

    queryOptions['$filter'] = this.toWhereODataFragment(entityQuery.wherePredicate);


    queryOptions['$orderby'] = this.toOrderByODataFragment(entityQuery.orderByClause);
    queryOptions['$select'] = this.toSelectODataFragment(entityQuery.selectClause);


    const qoText = this.toQueryOptionsString(queryOptions);
    return entityQuery.resourceName + qoText;
  }

  private toExpandOptions(expandClause: ExpandClause): ExpandOptions[] {
    if (!expandClause) {
      return undefined;
    };

    const result: ExpandOptions[] = [];

    expandClause.propertyPaths.forEach(pp => {
      const props = this.entityType.getPropertiesOnPath(pp, false, true);

      const rootProperty = props.shift().name;
      let rootExpand = result.find(e => e.name === rootProperty);

      if (!rootExpand) {
        rootExpand = { name: props.shift().name, expand: [] };
        result.push(rootExpand);
      }

      let workingExpandOptions = rootExpand;
      props.forEach((value: IProperty) => {
        const propName = value.name;
        let currentExpand = workingExpandOptions.expand.find(e => e.name === propName);

        if (!currentExpand) {
          currentExpand = { name: propName, expand: [] };
          workingExpandOptions.expand.push(currentExpand);
        }

        workingExpandOptions = currentExpand;
      });
    });

    return result;
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

  private toSelectODataFragment(selectClause: SelectClause) {
    if (!selectClause) {
      return undefined;
    };
    selectClause.validate(this.entityType);
    const frag = selectClause.propertyPaths.map(pp => {
      return this.entityType.clientPropertyPathToServer(pp, '/');
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
