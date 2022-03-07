import { Edm, Edmx } from 'ts-odatajs';

import { EntityNotFound } from '../../src/adapters/navigation-adapter';
import { NavigationAdapter } from './../../src/adapters';


let metadata: Edmx.Edmx;
let sut: NavigationAdapter;

function getBaseEntityType(): Edm.EntityType {
  return {
    name: 'Entity',
    key: { propertyRef: [{ name: 'Id' }] },
    property: [{ name: 'Id', type: 'Edm.Int32' }]
  };
}

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

  productEntityType.navigationProperty = [{ name: 'Supplier', type: 'UnitTesting.Supplier', partner: 'Products' }];
  supplierEntityType.navigationProperty = [
    { name: 'Products', type: 'Collection(UnitTesting.Product)', partner: 'Supplier' }];

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
    NavigationAdapter.configure({
      allowManyToMany: false,
      inferReferentialConstraints: true,
      inferNavigationPropertyPartner: true
    });

    // delete schema.association;
    metadata = {
      version: '4.0',
      dataServices: {
        schema: [schema]
      }
    };
  });

  describe('configure', () => {
    it('should succeed with null', () => {
      NavigationAdapter.configure(null);
      expect(true).toBeTruthy();
    });
  });

  describe('with inferPartner = false', () => {
    beforeEach(() => {
      NavigationAdapter.configure({ inferNavigationPropertyPartner: false });
    });

    it('should add associations when adapt is called with a 1:1 entity relationship', () => {
      schema.entityType = getOneToOneEntityTypes();

      sut.adapt(metadata.dataServices);

      expect(schema.association).toHaveLength(2);
      expect(schema.association[0].name).toBe('Product_ProductDetail_ProductDetail_ProductDetailPartner');
      expect(schema.association[0].end).toContainEqual(
        expect.objectContaining({
          multiplicity: '1',
          role: 'Product_ProductDetail'
        })
      );

      expect(schema.association[0].end).toContainEqual(
        expect.objectContaining({
          multiplicity: '1',
          role: 'ProductDetail_ProductDetailPartner'
        })
      );
    });

    it('should add associations when adapt is called with a M:M entity relationship', () => {
      schema.entityType = getManyToManyEntityTypes();

      sut.adapt(metadata.dataServices);

      expect(schema.association).toHaveLength(2);
      expect(schema.association[0].name).toBe('Category_Products_Product_ProductsPartner');
      expect(schema.association[0].end).toContainEqual(
        expect.objectContaining({
          multiplicity: '*',
          role: 'Category_Products'
        })
      );

      expect(schema.association[0].end).toContainEqual(
        expect.objectContaining({
          multiplicity: '1',
          role: 'Product_ProductsPartner'
        })
      );

      expect(schema.association[1].name).toBe('Product_Categories_Category_CategoriesPartner');
      expect(schema.association[1].end).toContainEqual(
        expect.objectContaining({
          multiplicity: '*',
          role: 'Product_Categories'
        })
      );

      expect(schema.association[1].end).toContainEqual(
        expect.objectContaining({
          multiplicity: '1',
          role: 'Category_CategoriesPartner'
        })
      );

    });

    it('should add associations when adapt is called with a 1:M entity relationship with missing first partner', () => {
      schema.entityType = getOneToManyEntityTypes();
      schema.entityType[0].navigationProperty[0].partner = null;

      sut.adapt(metadata.dataServices);

      expect(schema.association).toHaveLength(1);
      expect(schema.association[0].name).toBe('Product_Supplier_Supplier_Products');

      expect(schema.association[0].end).toContainEqual(
        expect.objectContaining({
          multiplicity: '1',
          role: 'Product_Supplier'
        })
      );

      expect(schema.association[0].end).toContainEqual(
        expect.objectContaining({
          multiplicity: '*',
          role: 'Supplier_Products'
        })
      );
    });

    it('should add associations when adapt is called with a 1:M entity relationship with missing second partner', () => {
      schema.entityType = getOneToManyEntityTypes();
      schema.entityType[1].navigationProperty[0].partner = null;

      sut.adapt(metadata.dataServices);

      expect(schema.association).toHaveLength(1);
      expect(schema.association[0].name).toBe('Product_Supplier_Supplier_Products');

      expect(schema.association[0].end).toContainEqual(
        expect.objectContaining({
          multiplicity: '1',
          role: 'Product_Supplier'
        })
      );

      expect(schema.association[0].end).toContainEqual(
        expect.objectContaining({
          multiplicity: '*',
          role: 'Supplier_Products'
        })
      );
    });
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

  it('should throw Error when adapt is called with missing base entityType', () => {
    const entityTypes = getOneToOneEntityTypes();
    entityTypes[0].baseType = `UnitTesting.NotHere`;

    schema.entityType = entityTypes;

    expect(() => {
      sut.adapt(metadata.dataServices);
    }).toThrow(EntityNotFound);
  });

  it('should throw Error when adapt is called with missing entityType and inferReferentialConstraints = false', () => {
    NavigationAdapter.configure({ inferReferentialConstraints: false });
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
    expect(schema.association[0].name).toBe('Product_ProductDetail_ProductDetail_Product');
    expect(schema.association[0].end).toContainEqual(
      expect.objectContaining({
        multiplicity: '1',
        role: 'ProductDetail_Product'
      })
    );

    expect(schema.association[0].end).toContainEqual(
      expect.objectContaining({
        multiplicity: '1',
        role: 'Product_ProductDetail'
      })
    );
  });

  it('should add associations when adapt is called with a 1:1 entity relationship with a base type', () => {
    const baseType = getBaseEntityType();
    schema.entityType = getOneToOneEntityTypes();
    schema.entityType[0].baseType = `UnitTesting.${baseType.name}`;
    schema.entityType.push(baseType);
    sut.adapt(metadata.dataServices);

    expect(schema.association).toHaveLength(1);
    expect(schema.association[0].name).toBe('Product_ProductDetail_ProductDetail_Product');
    expect(schema.association[0].end).toContainEqual(
      expect.objectContaining({
        multiplicity: '1',
        role: 'ProductDetail_Product'
      })
    );

    expect(schema.association[0].end).toContainEqual(
      expect.objectContaining({
        multiplicity: '1',
        role: 'Product_ProductDetail'
      })
    );
  });

  it('should add associations when adapt is called with a 1:1 entity relationship with empty base type', () => {
    const baseType = getBaseEntityType();
    baseType.key = null;
    baseType.property = null;
    baseType.navigationProperty = null;
    schema.entityType = getOneToOneEntityTypes();
    schema.entityType[0].baseType = `UnitTesting.${baseType.name}`;
    schema.entityType.push(baseType);
    sut.adapt(metadata.dataServices);

    expect(schema.association).toHaveLength(1);
    expect(schema.association[0].name).toBe('Product_ProductDetail_ProductDetail_Product');
    expect(schema.association[0].end).toContainEqual(
      expect.objectContaining({
        multiplicity: '1',
        role: 'ProductDetail_Product'
      })
    );

    expect(schema.association[0].end).toContainEqual(
      expect.objectContaining({
        multiplicity: '1',
        role: 'Product_ProductDetail'
      })
    );
  });

  it('should add associations when adapt is called with a M:M entity relationship and allowManyToMany=false', () => {
    NavigationAdapter.configure({ allowManyToMany: false });
    schema.entityType = getManyToManyEntityTypes();

    sut.adapt(metadata.dataServices);

    expect(schema.association).toHaveLength(2);
    expect(schema.association[0].name).toBe('Category_Products_Product_ProductsPartner');
    expect(schema.association[0].end).toContainEqual(
      expect.objectContaining({
        multiplicity: '1',
        role: 'Product_ProductsPartner'
      })
    );

    expect(schema.association[0].end).toContainEqual(
      expect.objectContaining({
        multiplicity: '*',
        role: 'Category_Products'
      })
    );

    expect(schema.association[1].name).toBe('Product_Categories_Category_CategoriesPartner');
    expect(schema.association[1].end).toContainEqual(
      expect.objectContaining({
        multiplicity: '1',
        role: 'Category_CategoriesPartner'
      })
    );

    expect(schema.association[1].end).toContainEqual(
      expect.objectContaining({
        multiplicity: '*',
        role: 'Product_Categories'
      })
    );
  });

  it('should add associations when adapt is called with a M:M entity relationship and allowManyToMany=true', () => {
    NavigationAdapter.configure({ allowManyToMany: true });
    schema.entityType = getManyToManyEntityTypes();

    sut.adapt(metadata.dataServices);

    expect(schema.association).toHaveLength(1);
    expect(schema.association[0].name).toBe('Category_Products_Product_Categories');
    expect(schema.association[0].end).toContainEqual(
      expect.objectContaining({
        multiplicity: '*',
        role: 'Product_Categories'
      })
    );

    expect(schema.association[0].end).toContainEqual(
      expect.objectContaining({
        multiplicity: '*',
        role: 'Category_Products'
      })
    );
  });

  it('should add associations when adapt is called with a 1:M entity relationship with inconsistent naming', () => {
    schema.entityType = getOneToManyEntityTypes();
    schema.entityType[0].navigationProperty[0].name = 'Foo';
    schema.entityType[0].navigationProperty[0].partner = null;
    schema.entityType[1].navigationProperty[0].name = 'Bar';

    sut.adapt(metadata.dataServices);

    expect(schema.association).toHaveLength(1);
    expect(schema.association[0].name).toBe('Product_Foo_Supplier_Bar');

    expect(schema.association[0].end).toContainEqual(
      expect.objectContaining({
        multiplicity: '1',
        role: 'Product_Foo'
      })
    );

    expect(schema.association[0].end).toContainEqual(
      expect.objectContaining({
        multiplicity: '*',
        role: 'Supplier_Bar'
      })
    );
  });

  it('should add associations when adapt is called with a 1:M entity relationship', () => {
    schema.entityType = getOneToManyEntityTypes();

    sut.adapt(metadata.dataServices);

    expect(schema.association).toHaveLength(1);
    expect(schema.association[0].name).toBe('Product_Supplier_Supplier_Products');

    expect(schema.association[0].end).toContainEqual(
      expect.objectContaining({
        multiplicity: '1',
        role: 'Product_Supplier'
      })
    );

    expect(schema.association[0].end).toContainEqual(
      expect.objectContaining({
        multiplicity: '*',
        role: 'Supplier_Products'
      })
    );
  });

  it('should not override navigation property relationship', () => {
    schema.entityType = getOneToManyEntityTypes();
    const relationship = 'Test_Relationship';
    const navProp = schema.entityType[1].navigationProperty[0];
    navProp.relationship = relationship;
    sut.adapt(metadata.dataServices);

    expect(navProp.relationship).toBe(relationship);
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
    expect(schema.association[0].name).toBe('Supplier_RootSupplier_Supplier_RootSupplierPartner');

    expect(schema.association[0].end).toContainEqual(
      expect.objectContaining({
        multiplicity: '1',
        role: 'Supplier_RootSupplier'
      })
    );

    expect(schema.association[0].end).toContainEqual(
      expect.objectContaining({
        multiplicity: '1',
        role: 'Supplier_RootSupplierPartner'
      })
    );
  });

  it('should add associations when adapt is called with a 1:M entity relationship (reversed)', () => {
    schema.entityType = getOneToManyEntityTypes().reverse();

    sut.adapt(metadata.dataServices);

    expect(schema.association).toHaveLength(1);
    expect(schema.association[0].name).toBe('Product_Supplier_Supplier_Products');

    expect(schema.association[0].end).toContainEqual(
      expect.objectContaining({
        multiplicity: '1',
        role: 'Product_Supplier'
      })
    );

    expect(schema.association[0].end).toContainEqual(
      expect.objectContaining({
        multiplicity: '*',
        role: 'Supplier_Products'
      })
    );
  });
});
