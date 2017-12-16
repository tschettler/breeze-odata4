import {
  core,
  EntityQuery,
  EntityType,
  ExpandClause,
  IProperty,
  MetadataStore,
  OrderByClause,
  Predicate,
  SelectClause,
  UriBuilder,
  config,
} from 'breeze-client';
import { OData4PredicateVisitor } from './breeze-odata4-predicateVisitor';

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
  public name = 'OData4';

  public static register() {
    config.registerAdapter('uriBuilder', OData4UriBuilder);
  }

  public initialize(): void {
    OData4PredicateVisitor.register();
  }

  public buildUri(entityQuery: EntityQuery, metadataStore: MetadataStore) {
    const queryOptions: QueryOptions = { expand: [] };

    // force entityType validation;
    let entityType = (<any>entityQuery)._getFromEntityType(metadataStore, false);
    if (!entityType) {
      // anonymous type but still has naming convention info avail
      entityType = new EntityType(metadataStore);
    }

    if (entityQuery.inlineCountEnabled) {
      queryOptions.count = true;
    }

    if (entityQuery.skipCount) {
      queryOptions.skip = entityQuery.skipCount;
    }

    if (entityQuery.takeCount != null) {
      queryOptions.top = entityQuery.takeCount;
    }

    this.addExpandOption(entityType, queryOptions, entityQuery.expandClause);

    this.addSelectOption(entityType, queryOptions, entityQuery.selectClause);

    queryOptions.filter = this.toWhereODataFragment(entityType, entityQuery.wherePredicate);

    queryOptions.orderby = this.toOrderByODataFragment(entityType, entityQuery.orderByClause);

    const qoText = this.toQueryOptionsString(queryOptions);

    entityQuery.resourceName = this.getResource(entityQuery);

    return entityQuery.resourceName + qoText;
  }

  private getResource(entityQuery: EntityQuery): string {
    let resource = entityQuery.resourceName;
    if (!core.isEmpty(entityQuery.parameters)) {
      resource = this.formatString(resource, entityQuery.parameters);
    }

    return resource;
  }

  private getQueryOptions(rootOptions: QueryOptionsBase, propertyPath: IProperty[]): QueryOptionsBase {
    const path: IProperty[] = [].concat(propertyPath);
    const rootProperty = path.shift().nameOnServer;

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

  private addExpandOption(entityType: EntityType, queryOptions: QueryOptions, expandClause: ExpandClause): void {
    if (!expandClause) {
      return;
    };

    // no validate on expand clauses currently.
    // expandClause.validate(entityType);
    expandClause.propertyPaths.forEach(pp => {
      const props = entityType.getPropertiesOnPath(pp, false, true);
      const workingOptions = this.getQueryOptions(queryOptions, props);

      const expandOptions = { name: props.pop().nameOnServer, expand: [] };
      workingOptions.expand.push(expandOptions);
    });
  }

  private addSelectOption(entityType: EntityType, queryOptions: QueryOptions, selectClause: SelectClause): void {
    const result = [];
    if (!selectClause) {
      return;
    }

    selectClause.validate(entityType);

    selectClause.propertyPaths.forEach(pp => {
      const props = entityType.getPropertiesOnPath(pp, false, true);
      const workingOptions = this.getQueryOptions(queryOptions, props);

      workingOptions.select = workingOptions.select || [];
      workingOptions.select.push(props.pop().nameOnServer);
    });
  }

  private toWhereODataFragment(entityType: EntityType, wherePredicate: Predicate) {
    if (!wherePredicate) {
      return undefined;
    };

    // validation occurs inside of the toODataFragment call here.
    return wherePredicate.toODataFragment({ entityType: entityType });
  }

  private toOrderByODataFragment(entityType: EntityType, orderByClause: OrderByClause): string {
    if (!orderByClause) {
      return undefined;
    };

    orderByClause.validate(entityType);
    const orderBy = orderByClause.items.map(item => {
      const propertyPath = entityType.clientPropertyPathToServer(item.propertyPath, '/');
      const direction = item.isDesc ? ' desc' : '';
      return propertyPath + direction;
    });

    // should return something like CompanyName,Address/City desc
    return orderBy.toString();
  }

  private toQueryOptionsString(queryOptions) {
    let qoStrings = [];
    for (const qoName of Object.getOwnPropertyNames(queryOptions)) {
      const qoValue = queryOptions[qoName];
      if (qoValue !== undefined) {
        if (qoName === 'expand') {
          qoStrings.push(this.getExpandString(qoValue));
        } else if (qoName === 'select') {
          qoStrings.push(this.getSelectString(qoValue));
        } else if (qoValue instanceof Array) {
          qoValue.forEach(qov => {
            qoStrings.push(`$${qoName}=${encodeURIComponent(qov)}`);
          });
        } else {
          qoStrings.push(`$${qoName}=${encodeURIComponent(qoValue)}`);
        }
      }
    }

    qoStrings = qoStrings.filter(s => !!s);
    if (qoStrings.length > 0) {
      return '?' + qoStrings.join('&');
    } else {
      return '';
    }
  }

  private getSelectString(select: string[]): string {
    const key = '$select';
    if (!(select && select.length)) {
      return null;
    }

    return `${key}=${select}`;
  }

  private getFilterString(filter: string): string {
    const key = '$filter';
    if (!filter) {
      return null;
    }

    return `${key}=${encodeURIComponent(filter)}`;
  }

  private getExpandString(options: ExpandOptions[]): string {
    const key = '$expand';

    const expandStrings = options.map(option => {
      const subOptions: string[] = [
        this.getFilterString(option.filter),
        this.getSelectString(option.select),
        this.getExpandString(option.expand)
      ].filter(s => !!s);

      if (!subOptions.length) {
        return option.name;
      }

      return `${option.name}(${subOptions.join(';')})`
    });

    const result = expandStrings.length ? `${key}=${expandStrings}` : null;

    return result;
  }

  private formatString(format: string, params: {}) {
    const props = Object.keys(params);

    const args = props.map(prop => ({ key: prop, value: params[prop] }));

    const result = args.reduce((formattedString: string, arg: any, index: number) => {
      const key = arg.key;
      let value = arg.value;

      if (value == null) {
        value = '';
      }

      const reg = new RegExp(`\\{${key}\\}`, 'gm');

      const newString = formattedString.replace(reg, value);

      if (newString !== formattedString) {
        // remove used parameter
        delete params[key];
      }

      return newString;
    }, format);

    return result;
  }
}
