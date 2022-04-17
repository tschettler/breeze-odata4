import { AbstractDataServiceAdapter, ComplexType, DataType, EntityType, MetadataStore, StructuralType } from 'breeze-client';
import { Batch, Edm, Edmx, oData } from 'ts-odatajs';

import { ClassRegistry } from './class-registry';
import { ODataError } from './odata-error';

/**
 * Represents an invokable entry, either an action or a function.
 */
export interface InvokableEntry {
  config: Edm.Action | Edm.Function;
  namespace: string;
  url?: string;
}

/**
 * Utility methods used across the BreezeOData4 library.
 */
export namespace Utilities {

  /**
   * The data type map, allows conversion of OData 4 types to breeze DataTypes.
   */
  export const dataTypeMap: { [key: string]: DataType } = {
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
  export function getDataType(key: string): DataType {
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
    return adaptStructuralType(metadataStore, complexType) as ComplexType;
  }

  /**
   * Adapts the entity type.
   * @param metadataStore The metadata store.
   * @param entityType The entity type.
   * @returns The entity type.
   */
  export function adaptEntityType(metadataStore: MetadataStore, entityType: Edm.EntityType): EntityType {
    return adaptStructuralType(metadataStore, entityType) as EntityType;
  }

  /**
   * Adapts the structural type.
   * @param metadataStore The metadata store.
   * @param structuralType The structural type.
   * @returns The structural type.
   */
  export function adaptStructuralType(metadataStore: MetadataStore, structuralType: Edm.ComplexType | Edm.EntityType): StructuralType {
    const result = metadataStore.getStructuralType(structuralType.name, true);

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
          config,
          namespace,
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
  export function parseValue(dataType: DataType, value: any) {
    const result = dataType.parseRawValue ? dataType.parseRawValue(value) : dataType.parse(value, 'string');

    return result;
  }

  export function createError(error: any, url?: string): ODataError {
    // OData errors can have the message buried very deeply - and nonobviously
    // this code is tricky so be careful changing the response.body parsing.
    const result = new ODataError();
    const response = error && (error as Batch.FailedResponse).response;

    result.message = error.message || error;
    result.statusText = error.message || error;

    if (!response) {
      // in case DataJS returns 'No handler for this data'
      return result;
    }

    if (response.statusCode !== '200') {
      result.message = response.statusText;
      result.statusText = response.statusText;
      result.status = Number(response.statusCode);
    }

    // non std
    if (url) {
      result.url = url;
    }

    result.body = response.body;
    if (response.body) {
      let nextErr;
      try {
        let body = JSON.parse(response.body);
        result.body = body;
        // OData v3 logic
        if (body['odata.error']) {
          body = body['odata.error'];
        }
        let msgs = [];
        do {
          nextErr = body.error || body.innererror;
          if (!nextErr) {
            msgs.push(getMessage(body));
          }

          nextErr = nextErr || body.internalexception;
          body = nextErr || body;
        } while (nextErr);

        msgs = msgs.filter(m => !!m);
        if (msgs.length > 0) {
          result.message = msgs.join('; ');
        }
      } catch (e) { }
    }

    AbstractDataServiceAdapter._catchNoConnectionError(result);

    return result;
  }

  function getMessage(body: any): string {
    const messageKey = Object.keys(body)
      .find(k => k.toLowerCase() === 'message');

    if (!messageKey) {
      return '';
    }

    const msg = body[messageKey];
    return typeof msg === 'string' ? msg : msg.value;
  }
}
