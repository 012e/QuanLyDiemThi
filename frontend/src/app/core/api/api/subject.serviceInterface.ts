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

import { PaginatedSubjectList } from '../model/models';
import { PatchedSubject } from '../model/models';
import { Subject } from '../model/models';


import { Configuration }                                     from '../configuration';



export interface SubjectServiceInterface {
    defaultHeaders: HttpHeaders;
    configuration: Configuration;

    /**
     * 
     * 
     * @param subject 
     */
    subjectCreate(subject: Subject, extraHttpRequestParams?: any): Observable<Subject>;

    /**
     * 
     * 
     * @param id A unique integer value identifying this subject.
     */
    subjectDestroy(id: number, extraHttpRequestParams?: any): Observable<{}>;

    /**
     * 
     * 
     * @param page A page number within the paginated result set.
     * @param pageSize Number of results to return per page.
     */
    subjectList(page?: number, pageSize?: number, extraHttpRequestParams?: any): Observable<PaginatedSubjectList>;

    /**
     * 
     * 
     * @param id A unique integer value identifying this subject.
     * @param patchedSubject 
     */
    subjectPartialUpdate(id: number, patchedSubject?: PatchedSubject, extraHttpRequestParams?: any): Observable<Subject>;

    /**
     * 
     * 
     * @param id A unique integer value identifying this subject.
     */
    subjectRetrieve(id: number, extraHttpRequestParams?: any): Observable<Subject>;

    /**
     * 
     * 
     * @param id A unique integer value identifying this subject.
     * @param subject 
     */
    subjectUpdate(id: number, subject: Subject, extraHttpRequestParams?: any): Observable<Subject>;

}
