/**
 * 
 *
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { StudentResult } from './student-result';


export interface PatchedResult { 
    readonly id?: number;
    test?: number;
    teacher?: number;
    classroom?: number;
    student_results?: Array<StudentResult>;
}

