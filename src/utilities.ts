import { ComplexType, DataType, DataTypeSymbol, EntityType, IStructuralType, MetadataStore } from 'breeze-client';
import { Edm, Edmx, oData } from 'ts-odatajs';
import { ClassRegistry } from './class-registry';

export interface InvokableEntry {
  config: Edm.Action | Edm.Function;
  namespace: string;
  url?: string;
}

export const nameof = <T>(name: keyof T) => name;

export namespace Utilities {
  export const dataTypeMap: { [key: string]: DataTypeSymbol } = {
    bool: DataType.Boolean,
    float: DataType.Double,
    int: DataType.Int64,
    sbyte: DataType.Byte
  };

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

  export function getEdmTypeFromTypeName(metadata: Edmx.Edmx, typeName: string): Edm.ComplexType | Edm.EntityType {
    const bindingTypeName = oData.utils.getCollectionType(typeName) || typeName;
    const entityType = oData.utils.lookupEntityType(bindingTypeName, metadata);
    const complexType = oData.utils.lookupComplexType(bindingTypeName, metadata);

    return entityType || complexType;
  }

  export function adaptComplexType(metadataStore: MetadataStore, complexType: Edm.ComplexType): ComplexType {
    return <ComplexType>adaptStructuralType(metadataStore, complexType);
  }

  export function adaptEntityType(metadataStore: MetadataStore, entityType: Edm.EntityType): EntityType {
    return <EntityType>adaptStructuralType(metadataStore, entityType);
  }

  export function adaptStructuralType(metadataStore: MetadataStore, structuralType: Edm.ComplexType | Edm.EntityType): IStructuralType {
    const result = metadataStore.getEntityType(structuralType.name, true);

    return result;
  }

  export function getActions(metadata: Edmx.Edmx, metadataStore: MetadataStore): InvokableEntry[] {
    const result = getInvokableEntries(metadata, metadataStore, s => s.action);

    return result;
  }

  export function getFunctions(metadata: Edmx.Edmx, metadataStore: MetadataStore): InvokableEntry[] {
    const result = getInvokableEntries(metadata, metadataStore, s => s.function);

    return result;
  }

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

  export function getInvokableUrl(
    metadata: Edmx.Edmx,
    metadataStore: MetadataStore,
    config: Edm.Function | Edm.Action,
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
}
