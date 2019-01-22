import { NavigationAdapter } from './../../src/adapters/adapters';
import { Edm, Edmx } from 'ts-odatajs';
import { EntityNotFound } from '../../src/adapters/navigation-adapter';

let metadata: Edmx.Edmx;
let sut: NavigationAdapter;

function getCategoryEntityType(): Edm.EntityType {
  return {
    name: 'Category',
    key: { propertyRef: [{ name: 'Id' }] },
    property: [{ name: 'Id', type: 'Edm.Int32' }]
  };
}

function getProductEntityType(): Edm.EntityType {
  return {
    name: 'Product',
    key: { propertyRef: [{ name: 'Id' }] },
    property: [{ name: 'Id', type: 'Edm.Int32' }]
  };
}

function getProductDetailEntityType(): Edm.EntityType {
  return {
    name: 'ProductDetail',
    key: { propertyRef: [{ name: 'ProductId' }] },
    property: [{ name: 'ProductId', type: 'Edm.Int32' }]
  };
}

function getSupplierEntityType(): Edm.EntityType {
  return {
    name: 'Supplier',
    key: { propertyRef: [{ name: 'Id' }] },
    property: [{ name: 'Id', type: 'Edm.Int32' }]
  };
}

function getOneToOneEntityTypes(): Edm.EntityType[] {
  const productEntityType = getProductEntityType();
  const productDetailEntityType = getProductDetailEntityType();

  productEntityType.navigationProperty = [{ name: 'ProductDetail', type: 'UnitTesting.ProductDetail' }];
  productDetailEntityType.navigationProperty = [{ name: 'Product', type: 'UnitTesting.Product' }];

  return [productEntityType, productDetailEntityType];
}

function getOneToManyEntityTypes(): Edm.EntityType[] {
  const productEntityType = getProductEntityType();
  const supplierEntityType = getSupplierEntityType();

  productEntityType.navigationProperty = [{ name: 'Supplier', type: 'UnitTesting.Supplier' }];
  supplierEntityType.navigationProperty = [{ name: 'Products', type: 'Collection(UnitTesting.Product)' }];

  return [productEntityType, supplierEntityType];
}

function getManyToManyEntityTypes(): Edm.EntityType[] {
  const categoryEntityType = getCategoryEntityType();
  const productEntityType = getProductEntityType();

  categoryEntityType.navigationProperty = [{ name: 'Products', type: 'Collection(UnitTesting.Product)' }];
  productEntityType.navigationProperty = [{ name: 'Categories', type: 'Collection(UnitTesting.Category)' }];

  return [categoryEntityType, productEntityType];
}

const schema: Edm.Schema = {
  namespace: 'UnitTesting',
  entityContainer: {
    name: 'Default',
    entitySet: [
      { name: 'Categories', entityType: 'UnitTesting.Category' },
      { name: 'Products', entityType: 'UnitTesting.Product' },
      { name: 'ProductDetails', entityType: 'UnitTesting.ProductDetail' },
      { name: 'Suppliers', entityType: 'UnitTesting.Supplier' }
    ]
  }
};

describe('NavigationAdapter', () => {
  beforeEach(() => {
    sut = new NavigationAdapter();
    // delete schema.association;
    metadata = {
      version: '4.0',
      dataServices: {
        schema: [schema]
      }
    };
  });

  it('should create instance of NavigationAdapter when constructor is called', () => {
    expect(sut).toBeInstanceOf(NavigationAdapter);
  });

  it('should throw TypeError when adapt is called with null metadata', () => {
    expect(() => {
      sut.adapt(null);
    }).toThrow(TypeError);
  });

  it('should succeed when adapt is called with null schema', () => {
    metadata.dataServices.schema = null;

    sut.adapt(metadata.dataServices);
  });

  it('should succeed when adapt is called with empty schema', () => {
    metadata.dataServices.schema = [];

    sut.adapt(metadata.dataServices);
  });

  it('should succeed when adapt is called with null entityType', () => {
    schema.entityType = null;

    sut.adapt(metadata.dataServices);
  });

  it('should succeed when adapt is called with empty entityType', () => {
    schema.entityType = [];

    sut.adapt(metadata.dataServices);
  });

  it('should not add associations when adapt is called with an entityType with null navigationProperty', () => {
    const entityType = getProductEntityType();
    entityType.navigationProperty = null;
    schema.entityType = [entityType];

    sut.adapt(metadata.dataServices);

    expect(schema.association).toHaveLength(0);
  });

  it('should not add associations when adapt is called with an entityType with empty navigationProperty', () => {
    const entityType = getProductEntityType();
    entityType.navigationProperty = [];
    schema.entityType = [entityType];

    sut.adapt(metadata.dataServices);

    expect(schema.association).toHaveLength(0);
  });

  it('should throw Error when adapt is called with missing entityType', () => {
    const entityType = getProductEntityType();
    entityType.navigationProperty = [{ name: 'NotHere', type: 'UnitTesting.Nothing' }];
    schema.entityType = [entityType];

    expect(() => {
      sut.adapt(metadata.dataServices);
    }).toThrow(EntityNotFound);
  });

  it('should add associations when adapt is called with a 1:1 entity relationship', () => {
    schema.entityType = getOneToOneEntityTypes();

    sut.adapt(metadata.dataServices);

    expect(schema.association).toHaveLength(1);
    expect(schema.association[0].name).toBe('Product_ProductDetail');
    expect(schema.association[0].end).toContainEqual(
      expect.objectContaining({
        multiplicity: '1',
        role: 'Product_ProductDetail_Target'
      })
    );

    expect(schema.association[0].end).toContainEqual(
      expect.objectContaining({
        multiplicity: '1',
        role: 'Product_ProductDetail_Source'
      })
    );
  });

  it('should add associations when adapt is called with a M:M entity relationship', () => {
    schema.entityType = getManyToManyEntityTypes();

    sut.adapt(metadata.dataServices);

    expect(schema.association).toHaveLength(1);
    expect(schema.association[0].name).toBe('Product_Category');
    expect(schema.association[0].end).toContainEqual(
      expect.objectContaining({
        multiplicity: '*',
        role: 'Product_Category_Target'
      })
    );

    expect(schema.association[0].end).toContainEqual(
      expect.objectContaining({
        multiplicity: '*',
        role: 'Product_Category_Source'
      })
    );
  });

  it('should add associations when adapt is called with a 1:M entity relationship', () => {
    schema.entityType = getOneToManyEntityTypes();

    sut.adapt(metadata.dataServices);

    expect(schema.association).toHaveLength(1);
    expect(schema.association[0].name).toBe('Product_Supplier');

    expect(schema.association[0].end).toContainEqual(
      expect.objectContaining({
        multiplicity: '1',
        role: 'Product_Supplier_Target'
      })
    );

    expect(schema.association[0].end).toContainEqual(
      expect.objectContaining({
        multiplicity: '*',
        role: 'Product_Supplier_Source'
      })
    );
  });

  it('should add associations when adapt is called with a self-referencing constraint', () => {
    const entityType = getSupplierEntityType();
    entityType.property.push({ name: 'RootSupplierId', type: 'Edm.Int32' });
    entityType.navigationProperty = [
      {
        name: 'RootSupplier',
        type: 'UnitTesting.Supplier',
        referentialConstraint: [
          {
            property: 'RootSupplierId',
            referencedProperty: 'Id'
          }
        ]
      }
    ];
    schema.entityType = [entityType];

    sut.adapt(metadata.dataServices);

    expect(schema.association).toHaveLength(1);
    expect(schema.association[0].name).toBe('Supplier_Supplier');

    expect(schema.association[0].end).toContainEqual(
      expect.objectContaining({
        multiplicity: '1',
        role: 'Supplier_Supplier_Target'
      })
    );

    expect(schema.association[0].end).toContainEqual(
      expect.objectContaining({
        multiplicity: '1',
        role: 'Supplier_Supplier_Source'
      })
    );
  });

  it('should add associations when adapt is called with a 1:M entity relationship (reversed)', () => {
    schema.entityType = getOneToManyEntityTypes().reverse();

    sut.adapt(metadata.dataServices);

    expect(schema.association).toHaveLength(1);
    expect(schema.association[0].name).toBe('Product_Supplier');

    expect(schema.association[0].end).toContainEqual(
      expect.objectContaining({
        multiplicity: '1',
        role: 'Product_Supplier_Target'
      })
    );

    expect(schema.association[0].end).toContainEqual(
      expect.objectContaining({
        multiplicity: '*',
        role: 'Product_Supplier_Source'
      })
    );
  });
});
