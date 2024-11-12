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

import { PaginatedStudentList } from '../model/models';
import { PatchedStudent } from '../model/models';
import { Student } from '../model/models';


import { Configuration }                                     from '../configuration';



export interface StudentServiceInterface {
    defaultHeaders: HttpHeaders;
    configuration: Configuration;

    /**
     * 
     * 
     * @param student 
     */
    studentCreate(student: Student, extraHttpRequestParams?: any): Observable<Student>;

    /**
     * 
     * 
     * @param id A unique integer value identifying this student.
     */
    studentDestroy(id: number, extraHttpRequestParams?: any): Observable<{}>;

    /**
     * 
     * 
     * @param page A page number within the paginated result set.
     * @param pageSize Number of results to return per page.
     */
    studentList(page?: number, pageSize?: number, extraHttpRequestParams?: any): Observable<PaginatedStudentList>;

    /**
     * 
     * 
     * @param id A unique integer value identifying this student.
     * @param patchedStudent 
     */
    studentPartialUpdate(id: number, patchedStudent?: PatchedStudent, extraHttpRequestParams?: any): Observable<Student>;

    /**
     * 
     * 
     * @param id A unique integer value identifying this student.
     */
    studentRetrieve(id: number, extraHttpRequestParams?: any): Observable<Student>;

    /**
     * 
     * 
     * @param id A unique integer value identifying this student.
     * @param student 
     */
    studentUpdate(id: number, student: Student, extraHttpRequestParams?: any): Observable<Student>;

}
