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

import { PaginatedResultList } from '../model/models';
import { PaginatedStandaloneStudentResultList } from '../model/models';
import { PatchedResult } from '../model/models';
import { PatchedStandaloneStudentResult } from '../model/models';
import { Result } from '../model/models';
import { StandaloneStudentResult } from '../model/models';


import { Configuration }                                     from '../configuration';



export interface ResultServiceInterface {
    defaultHeaders: HttpHeaders;
    configuration: Configuration;

    /**
     * 
     * 
     * @param result 
     */
    resultCreate(result: Result, extraHttpRequestParams?: any): Observable<Result>;

    /**
     * 
     * 
     * @param id A unique integer value identifying this result.
     */
    resultDestroy(id: number, extraHttpRequestParams?: any): Observable<{}>;

    /**
     * 
     * 
     * @param resultPk 
     * @param standaloneStudentResult 
     */
    resultDetailCreate(resultPk: number, standaloneStudentResult: StandaloneStudentResult, extraHttpRequestParams?: any): Observable<StandaloneStudentResult>;

    /**
     * 
     * 
     * @param id A unique integer value identifying this student result.
     * @param resultPk 
     */
    resultDetailDestroy(id: number, resultPk: number, extraHttpRequestParams?: any): Observable<{}>;

    /**
     * 
     * 
     * @param resultPk 
     * @param limit Number of results to return per page.
     * @param offset The initial index from which to return the results.
     * @param ordering Which field to use when ordering the results.
     * @param search A search term.
     */
    resultDetailList(resultPk: number, limit?: number, offset?: number, ordering?: string, search?: string, extraHttpRequestParams?: any): Observable<PaginatedStandaloneStudentResultList>;

    /**
     * 
     * 
     * @param id A unique integer value identifying this student result.
     * @param resultPk 
     * @param patchedStandaloneStudentResult 
     */
    resultDetailPartialUpdate(id: number, resultPk: number, patchedStandaloneStudentResult?: PatchedStandaloneStudentResult, extraHttpRequestParams?: any): Observable<StandaloneStudentResult>;

    /**
     * 
     * 
     * @param id A unique integer value identifying this student result.
     * @param resultPk 
     */
    resultDetailRetrieve(id: number, resultPk: number, extraHttpRequestParams?: any): Observable<StandaloneStudentResult>;

    /**
     * 
     * 
     * @param id A unique integer value identifying this student result.
     * @param resultPk 
     * @param standaloneStudentResult 
     */
    resultDetailUpdate(id: number, resultPk: number, standaloneStudentResult: StandaloneStudentResult, extraHttpRequestParams?: any): Observable<StandaloneStudentResult>;

    /**
     * 
     * 
     * @param limit Number of results to return per page.
     * @param offset The initial index from which to return the results.
     * @param ordering Which field to use when ordering the results.
     * @param search A search term.
     */
    resultList(limit?: number, offset?: number, ordering?: string, search?: string, extraHttpRequestParams?: any): Observable<PaginatedResultList>;

    /**
     * 
     * 
     * @param id A unique integer value identifying this result.
     * @param patchedResult 
     */
    resultPartialUpdate(id: number, patchedResult?: PatchedResult, extraHttpRequestParams?: any): Observable<Result>;

    /**
     * 
     * 
     * @param id A unique integer value identifying this result.
     */
    resultRetrieve(id: number, extraHttpRequestParams?: any): Observable<Result>;

    /**
     * 
     * 
     * @param id A unique integer value identifying this result.
     * @param result 
     */
    resultUpdate(id: number, result: Result, extraHttpRequestParams?: any): Observable<Result>;

}
