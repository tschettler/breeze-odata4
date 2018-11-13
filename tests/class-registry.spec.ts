import { ClassRegistry } from '../src/class-registry';
import { DisplayNameDecorator } from '../src/decorators/display-name-decorator';
import { AnnotationAdapter } from '../src/adapters/annotation-adapter';

describe('ClassRegistry', () => {
    it('should have annotation decorators', () => {
      expect(ClassRegistry.AnnotationDecorators).toBeTruthy();
    });
  
    it('should allow adding annotation decorators', () => {
      ClassRegistry.AnnotationDecorators.add(DisplayNameDecorator);
      expect(ClassRegistry.AnnotationDecorators.types).toContain(
        DisplayNameDecorator
      );
    });
  
    it('should allow retrieving annotation decorators', () => {
      ClassRegistry.AnnotationDecorators.add(DisplayNameDecorator);
      expect(ClassRegistry.AnnotationDecorators.get()[0]).toEqual(
        jasmine.any(DisplayNameDecorator)
      );
    });
  
    it('should have metadata adapters', () => {
      expect(ClassRegistry.MetadataAdapters).toBeTruthy();
    });
  
    it('should allow adding metadata adapters', () => {
      ClassRegistry.MetadataAdapters.add(AnnotationAdapter);
      expect(ClassRegistry.MetadataAdapters.types).toContain(AnnotationAdapter);
    });
  
    it('should allow retrieving metadata adapters', () => {
      ClassRegistry.MetadataAdapters.add(AnnotationAdapter);
      expect(ClassRegistry.MetadataAdapters.get()[0]).toEqual(
        jasmine.any(AnnotationAdapter)
      );
    });
  });
  