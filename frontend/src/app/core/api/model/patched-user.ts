/**
 * 
 *
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { UserTypeEnum } from './user-type-enum';


export interface PatchedUser { 
    readonly id?: number;
    /**
     * Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.
     */
    username?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    user_type?: UserTypeEnum;
    roles?: Array<string>;
    password?: string;
    readonly permissions?: string;
}
export namespace PatchedUser {
}


