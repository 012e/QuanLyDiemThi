/**
 * 
 *
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { HttpHeaders }                                       from '@angular/common/http';

import { Observable }                                        from 'rxjs';

import { PatchedResult } from '../model/models';
import { Result } from '../model/models';


import { Configuration }                                     from '../configuration';



export interface ResultsServiceInterface {
    defaultHeaders: HttpHeaders;
    configuration: Configuration;

    /**
     * 
     * 
     * @param result 
     */
    resultsCreate(result: Result, extraHttpRequestParams?: any): Observable<Result>;

    /**
     * 
     * 
     * @param id A unique integer value identifying this result.
     */
    resultsDestroy(id: number, extraHttpRequestParams?: any): Observable<{}>;

    /**
     * 
     * 
     */
    resultsList(extraHttpRequestParams?: any): Observable<Array<Result>>;

    /**
     * 
     * 
     * @param id A unique integer value identifying this result.
     * @param patchedResult 
     */
    resultsPartialUpdate(id: number, patchedResult?: PatchedResult, extraHttpRequestParams?: any): Observable<Result>;

    /**
     * 
     * 
     * @param id A unique integer value identifying this result.
     */
    resultsRetrieve(id: number, extraHttpRequestParams?: any): Observable<Result>;

    /**
     * 
     * 
     * @param id A unique integer value identifying this result.
     * @param result 
     */
    resultsUpdate(id: number, result: Result, extraHttpRequestParams?: any): Observable<Result>;

}
