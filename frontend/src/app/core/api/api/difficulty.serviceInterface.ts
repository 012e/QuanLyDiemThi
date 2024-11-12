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

import { Difficulty } from '../model/models';
import { PaginatedDifficultyList } from '../model/models';
import { PatchedDifficulty } from '../model/models';


import { Configuration }                                     from '../configuration';



export interface DifficultyServiceInterface {
    defaultHeaders: HttpHeaders;
    configuration: Configuration;

    /**
     * 
     * 
     * @param difficulty 
     */
    difficultyCreate(difficulty: Difficulty, extraHttpRequestParams?: any): Observable<Difficulty>;

    /**
     * 
     * 
     * @param id A unique integer value identifying this difficulty.
     */
    difficultyDestroy(id: number, extraHttpRequestParams?: any): Observable<{}>;

    /**
     * 
     * 
     * @param page A page number within the paginated result set.
     * @param pageSize Number of results to return per page.
     */
    difficultyList(page?: number, pageSize?: number, extraHttpRequestParams?: any): Observable<PaginatedDifficultyList>;

    /**
     * 
     * 
     * @param id A unique integer value identifying this difficulty.
     * @param patchedDifficulty 
     */
    difficultyPartialUpdate(id: number, patchedDifficulty?: PatchedDifficulty, extraHttpRequestParams?: any): Observable<Difficulty>;

    /**
     * 
     * 
     * @param id A unique integer value identifying this difficulty.
     */
    difficultyRetrieve(id: number, extraHttpRequestParams?: any): Observable<Difficulty>;

    /**
     * 
     * 
     * @param id A unique integer value identifying this difficulty.
     * @param difficulty 
     */
    difficultyUpdate(id: number, difficulty: Difficulty, extraHttpRequestParams?: any): Observable<Difficulty>;

}
