import { ComplexType, DataType, DataTypeSymbol, EntityType, IStructuralType, MetadataStore } from 'breeze-client';
import { Edm, Edmx, oData } from 'ts-odatajs';

import { ClassRegistry } from './class-registry';

/**
 * Represents an invokable entry, either an action or a function.
 */
export interface InvokableEntry {
  config: Edm.Action | Edm.Function;
  namespace: string;
  url?: string;
}

/**
 * Shorthand implementation similar to the `nameof` construct in C#.
 * Allows validating the name passed in is available on the type.
 * @param name The key name.
 * @returns The key name.
 */
export const nameof = <T>(name: keyof T) => name;

/**
 * Utility methods used across the BreezeOData4 library.
 */
export namespace Utilities {

  /**
   * The data type map, allows conversion of OData 4 types to breeze DataTypes.
   */
  export const dataTypeMap: { [key: string]: DataTypeSymbol } = {
    bool: DataType.Boolean,
    float: DataType.Double,
    int: DataType.Int64,
    sbyte: DataType.Byte
  };

  /**
   * Adapts the metadata based on the configured metadata adapters.
   * @param metadata The metadata.
   * @returns The metadata.
   */
  export function adaptMetadata(metadata: Edmx.Edmx): Edmx.Edmx {
    // Edmx version must be "4.0", no need to adapt if it is not OData 4.
    if (metadata.version !== '4.0') {
      return metadata;
    }

    const metadataAdapters = ClassRegistry.MetadataAdapters.get();

    const csdlMetadata = metadata.dataServices;

    metadataAdapters.forEach(a => {
      oData.utils.forEachSchema(csdlMetadata, a.adapt.bind(a));
    });

    return metadata;
  }

  /**
   * Gets the data type.
   * @param key The data type string key.
   * @returns The breeze DataType symbol.
   */
  export function getDataType(key: string): DataTypeSymbol {
    // default to the data type map
    let result = dataTypeMap[key];

    if (result) {
      return result;
    }

    // try to get the built-in type
    const enumName = DataType.getNames().find(n => n.toLowerCase() === key.toLowerCase());

    result = !!enumName ? DataType[enumName] : DataType.String;

    return result;
  }

  /**
   * Gets edm type from type name.
   * @param metadata The metadata.
   * @param typeName The type name.
   * @returns The EDM structural type.
   */
  export function getEdmTypeFromTypeName(metadata: Edmx.Edmx, typeName: string): Edm.ComplexType | Edm.EntityType {
    const bindingTypeName = oData.utils.getCollectionType(typeName) || typeName;
    const entityType = oData.utils.lookupEntityType(bindingTypeName, metadata);
    const complexType = oData.utils.lookupComplexType(bindingTypeName, metadata);

    return entityType || complexType;
  }

  /**
   * Adapts the complex type.
   * @param metadataStore The metadata store.
   * @param complexType The complex type.
   * @returns The complex type.
   */
  export function adaptComplexType(metadataStore: MetadataStore, complexType: Edm.ComplexType): ComplexType {
    return <ComplexType>adaptStructuralType(metadataStore, complexType);
  }

  /**
   * Adapts the entity type.
   * @param metadataStore The metadata store.
   * @param entityType The entity type.
   * @returns The entity type.
   */
  export function adaptEntityType(metadataStore: MetadataStore, entityType: Edm.EntityType): EntityType {
    return <EntityType>adaptStructuralType(metadataStore, entityType);
  }

  /**
   * Adapts the structural type.
   * @param metadataStore The metadata store.
   * @param structuralType The structural type.
   * @returns The structural type.
   */
  export function adaptStructuralType(metadataStore: MetadataStore, structuralType: Edm.ComplexType | Edm.EntityType): IStructuralType {
    const result = metadataStore.getEntityType(structuralType.name, true);

    return result;
  }

  /**
   * Gets available actions.
   * @param metadata The metadata.
   * @param metadataStore The metadata store.
   * @returns The actions represented as invokable entries.
   */
  export function getActions(metadata: Edmx.Edmx, metadataStore: MetadataStore): InvokableEntry[] {
    const result = getInvokableEntries(metadata, metadataStore, s => s.action);

    return result;
  }

  /**
  * Gets available functions.
  * @param metadata The metadata.
  * @param metadataStore The metadata store.
  * @returns The functions represented as invokable entries.
  */
  export function getFunctions(metadata: Edmx.Edmx, metadataStore: MetadataStore): InvokableEntry[] {
    const result = getInvokableEntries(metadata, metadataStore, s => s.function);

    return result;
  }

  /**
   * Gets invokable entries.
   * @param metadata The metadata.
   * @param metadataStore The metadata store.
   * @param accessor The accessor for retrieving either actions or functions.
   * @returns The invokable entries.
   */
  export function getInvokableEntries(
    metadata: Edmx.Edmx,
    metadataStore: MetadataStore,
    accessor: (schema: Edm.Schema) => Edm.Action[] | Edm.Function[]
  ): InvokableEntry[] {
    let result: InvokableEntry[] = [];

    metadata.dataServices.schema.forEach(s => {
      const namespace = s.namespace;
      const items: any[] = accessor(s);
      if (!items) {
        return;
      }

      const entries = items.map((config: Edm.Action | Edm.Function) => {
        const entry: InvokableEntry = {
          config: config,
          namespace: namespace,
          url: getInvokableUrl(metadata, metadataStore, config, namespace)
        };

        return entry;
      });

      result = result.concat(entries);
    });

    return result;
  }

  /**
   * Gets the invokable url.
   * @param metadata The metadata.
   * @param metadataStore The metadata store.
   * @param config The action or function.
   * @param namespace The EDM namespace.
   * @returns The invokable url for the action or function.
   */
  export function getInvokableUrl(
    metadata: Edmx.Edmx,
    metadataStore: MetadataStore,
    config: Edm.Action | Edm.Function,
    namespace: string
  ): string {
    const isBound = Boolean(config.isBound);
    let boundPart = '';

    if (isBound) {
      const bindingParameter = config.parameter[0];
      const bindingEdmType = getEdmTypeFromTypeName(metadata, bindingParameter.type);
      const breezeType = adaptEntityType(metadataStore, bindingEdmType);

      if (breezeType) {
        boundPart = `${breezeType.defaultResourceName}/`;
      }
    }

    const url = `${boundPart}${namespace}.${config.name}`;

    return url;
  }

  /**
   * Parses the value using either parseRawValue or parse.
   * @param dataType THe data type.
   * @param value The value.
   * @returns The value parsed by the data type.
   */
  export function parseValue(dataType: DataTypeSymbol, value: any) {
    const result = dataType.parseRawValue ? dataType.parseRawValue(value) : dataType.parse(value, 'string');

    return result;
  }
}
