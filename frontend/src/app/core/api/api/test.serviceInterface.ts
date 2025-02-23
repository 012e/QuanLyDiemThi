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

import { PaginatedTestList } from '../model/models';
import { PatchedTest } from '../model/models';
import { Test } from '../model/models';


import { Configuration }                                     from '../configuration';



export interface TestServiceInterface {
    defaultHeaders: HttpHeaders;
    configuration: Configuration;

    /**
     * 
     * 
     * @param test 
     */
    testCreate(test: Test, extraHttpRequestParams?: any): Observable<Test>;

    /**
     * 
     * 
     * @param id A unique integer value identifying this test.
     */
    testDestroy(id: number, extraHttpRequestParams?: any): Observable<{}>;

    /**
     * 
     * 
     * @param limit Number of results to return per page.
     * @param offset The initial index from which to return the results.
     * @param ordering Which field to use when ordering the results.
     * @param search A search term.
     * @param subjectId 
     */
    testList(limit?: number, offset?: number, ordering?: string, search?: string, subjectId?: number, extraHttpRequestParams?: any): Observable<PaginatedTestList>;

    /**
     * 
     * 
     * @param id A unique integer value identifying this test.
     * @param patchedTest 
     */
    testPartialUpdate(id: number, patchedTest?: PatchedTest, extraHttpRequestParams?: any): Observable<Test>;

    /**
     * 
     * 
     * @param id A unique integer value identifying this test.
     */
    testRetrieve(id: number, extraHttpRequestParams?: any): Observable<Test>;

    /**
     * 
     * 
     * @param id A unique integer value identifying this test.
     * @param test 
     */
    testUpdate(id: number, test: Test, extraHttpRequestParams?: any): Observable<Test>;

}
