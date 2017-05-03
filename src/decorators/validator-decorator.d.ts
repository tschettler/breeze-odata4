import { AnnotationDecorator } from "./annotation-decorator";
export declare class ValidatorDecorator implements AnnotationDecorator {
    annotation: string;
    private dataTypeMap;
    decorate(property: any, annotation: any): void;
    private getDataType(key);
}
