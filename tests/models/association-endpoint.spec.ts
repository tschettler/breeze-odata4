import { Edm } from 'ts-odatajs';

import { AssociationEndpoint } from '../../src/models';

describe('AssociationEndpoint', () => {

    describe('ctor', () => {
        it('should set containingEntityType', () => {
            const props: Partial<AssociationEndpoint> = {
                containingEntityType: 'Test'
            };

            const result = new AssociationEndpoint(props);

            expect(result.containingEntityType).toBe(props.containingEntityType);
        });

        it('should set navigationProperty', () => {
            const props: Partial<AssociationEndpoint> = {
                navigationProperty: <Edm.NavigationProperty>{}
            };

            const result = new AssociationEndpoint(props);

            expect(result.navigationProperty).toBe(props.navigationProperty);
        });

        it('should set partnerEntityType', () => {
            const props: Partial<AssociationEndpoint> = {
                partnerEntityType: 'Partner'
            };

            const result = new AssociationEndpoint(props);

            expect(result.partnerEntityType).toBe(props.partnerEntityType);
        });

        it('should set propertyName', () => {
            const props: Partial<AssociationEndpoint> = {
                propertyName: 'TestProperty'
            };

            const result = new AssociationEndpoint(props);

            expect(result.propertyName).toBe(props.propertyName);
        });
    });

    describe('containingEntityShortName', () => {
        it('should return entity short name', () => {
            const nameespace = 'Test';
            const entityName = 'Entity';

            const props: Partial<AssociationEndpoint> = {
                containingEntityType: `${nameespace}.${entityName}`
            };

            const sut = new AssociationEndpoint(props);

            const result = sut.containingEntityShortName;

            expect(result).toEqual(entityName);
        });
    });

    describe('isCollection', () => {
        it('should return false with no navigation property', () => {
            const sut = new AssociationEndpoint();

            const result = sut.isCollection;

            expect(result).toBeFalsy();
        });

        it('should return false for a non-collection', () => {
            const entityName = 'Test.Entity';

            const props: Partial<AssociationEndpoint> = {
                navigationProperty: <Edm.NavigationProperty>{
                    type: entityName
                }
            };

            const sut = new AssociationEndpoint(props);

            const result = sut.isCollection;

            expect(result).toBeFalsy();
        });

        it('should return true for a collection', () => {
            const entityName = 'Collection(Test.Entity)';

            const props: Partial<AssociationEndpoint> = {
                navigationProperty: <Edm.NavigationProperty>{
                    type: entityName
                }
            };

            const sut = new AssociationEndpoint(props);

            const result = sut.isCollection;

            expect(result).toBeTruthy();
        });
    });

    describe('isMapped', () => {
        it('should return false with no navigation property', () => {
            const sut = new AssociationEndpoint();

            const result = sut.isMapped;

            expect(result).toBeFalsy();
        });

        it('should return true with navigation property', () => {
            const entityName = 'Test.Entity';

            const props: Partial<AssociationEndpoint> = {
                navigationProperty: <Edm.NavigationProperty>{
                    type: entityName
                }
            };

            const sut = new AssociationEndpoint(props);

            const result = sut.isMapped;

            expect(result).toBeTruthy();
        });
    });

    describe('multiplicity', () => {
        it('should return 1 with no navigation property', () => {
            const sut = new AssociationEndpoint();

            const result = sut.multiplicity;

            expect(result).toEqual('1');
        });

        it('should return 1 for a non-collection', () => {
            const entityName = 'Test.Entity';

            const props: Partial<AssociationEndpoint> = {
                navigationProperty: <Edm.NavigationProperty>{
                    type: entityName
                }
            };

            const sut = new AssociationEndpoint(props);

            const result = sut.multiplicity;

            expect(result).toEqual('1');
        });

        it('should return * for a collection', () => {
            const entityName = 'Collection(Test.Entity)';

            const props: Partial<AssociationEndpoint> = {
                navigationProperty: <Edm.NavigationProperty>{
                    type: entityName
                }
            };

            const sut = new AssociationEndpoint(props);

            const result = sut.multiplicity;

            expect(result).toEqual('*');
        });
    });

    describe('order', () => {
        it('should return 0 when is mapped and not collection', () => {
            const entityName = 'Test.Entity';

            const props: Partial<AssociationEndpoint> = {
                navigationProperty: <Edm.NavigationProperty>{
                    type: entityName
                }
            };

            const sut = new AssociationEndpoint(props);

            const result = sut.order;

            expect(result).toEqual(0);
        });

        it('should return 1 when is mapped and collection', () => {
            const entityName = 'Collection(Test.Entity)';

            const props: Partial<AssociationEndpoint> = {
                navigationProperty: <Edm.NavigationProperty>{
                    type: entityName
                }
            };

            const sut = new AssociationEndpoint(props);

            const result = sut.order;

            expect(result).toEqual(1);
        });

        it('should return 2 when not mapped', () => {
            const sut = new AssociationEndpoint();

            const result = sut.order;

            expect(result).toEqual(2);
        });
    });


    describe('partnerEntityShortName', () => {
        it('should return entity short name', () => {
            const nameespace = 'Test';
            const entityName = 'Entity';

            const props: Partial<AssociationEndpoint> = {
                partnerEntityType: `${nameespace}.${entityName}`
            };

            const sut = new AssociationEndpoint(props);

            const result = sut.partnerEntityShortName;

            expect(result).toEqual(entityName);
        });
    });

    describe('propertyName', () => {
        it('should return navigation property name', () => {
            const props: Partial<AssociationEndpoint> = {
                navigationProperty: <Edm.NavigationProperty>{
                    name: 'Item'
                }
            };

            const sut = new AssociationEndpoint(props);

            const result = sut.propertyName;

            expect(result).toBe(props.navigationProperty.name);
        });

        it('should return set property name', () => {
            const propertyName = 'Item';
            const sut = new AssociationEndpoint();
            sut.propertyName = propertyName;

            const result = sut.propertyName;

            expect(result).toBe(propertyName);
        });
    });

    describe('role', () => {
        it('should return role with property name with no navigation property', () => {
            const props: Partial<AssociationEndpoint> = {
                containingEntityType: 'Test.Entity',
                propertyName: 'TestProperty'
            };

            const sut = new AssociationEndpoint(props);
            const result = sut.role;

            expect(result).toEqual(`${sut.containingEntityShortName}_${sut.propertyName}`);
        });

        it('should return role with navigation property name with no navigation property', () => {
            const props: Partial<AssociationEndpoint> = {
                containingEntityType: 'Test.Entity',
                navigationProperty: <Edm.NavigationProperty>{
                    name: 'TestProperty'
                }
            };

            const sut = new AssociationEndpoint(props);
            const result = sut.role;

            expect(result).toEqual(`${sut.containingEntityShortName}_${sut.navigationProperty.name}`);
        });
    });

});
