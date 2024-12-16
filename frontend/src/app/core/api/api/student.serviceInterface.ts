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

import { PatchedStudent } from '../model/models';
import { Student } from '../model/models';
import { StudentList200Response } from '../model/models';
import { StudentList200ResponseResultsInner } from '../model/models';


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
     * Retrieve a list of students with detailed classroom information. Supports ordering by &#x60;name&#x60; and searching by &#x60;name&#x60;, &#x60;student_code&#x60;, and &#x60;classroom__name&#x60;.
     * @param limit Number of results to return per page.
     * @param offset The initial index from which to return the results.
     * @param ordering Which field to use when ordering the results.
     * @param search A search term.
     */
    studentList(limit?: number, offset?: number, ordering?: string, search?: string, extraHttpRequestParams?: any): Observable<StudentList200Response>;

    /**
     * 
     * 
     * @param id A unique integer value identifying this student.
     * @param patchedStudent 
     */
    studentPartialUpdate(id: number, patchedStudent?: PatchedStudent, extraHttpRequestParams?: any): Observable<Student>;

    /**
     * 
     * Retrieve a single student with detailed classroom information.
     * @param id A unique integer value identifying this student.
     */
    studentRetrieve(id: number, extraHttpRequestParams?: any): Observable<StudentList200ResponseResultsInner>;

    /**
     * 
     * 
     * @param id A unique integer value identifying this student.
     * @param student 
     */
    studentUpdate(id: number, student: Student, extraHttpRequestParams?: any): Observable<Student>;

}
