/**
 * 
 *
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


/**
 * User model w/o password
 */
export interface UserDetails { 
    readonly pk: number;
    /**
     * Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.
     */
    username: string;
    readonly email: string;
    first_name?: string;
    last_name?: string;
}

