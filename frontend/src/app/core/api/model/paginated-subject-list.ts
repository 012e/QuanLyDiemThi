/**
 * 
 *
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { Subject } from './subject';


export interface PaginatedSubjectList { 
    count: number;
    next?: string | null;
    previous?: string | null;
    results: Array<Subject>;
}

