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

import { JWT } from '../model/models';
import { Login } from '../model/models';
import { PasswordChange } from '../model/models';
import { PasswordReset } from '../model/models';
import { PasswordResetConfirm } from '../model/models';
import { PatchedUserDetails } from '../model/models';
import { RestAuthDetail } from '../model/models';
import { TokenRefresh } from '../model/models';
import { TokenVerify } from '../model/models';
import { UserDetails } from '../model/models';


import { Configuration }                                     from '../configuration';



export interface AuthServiceInterface {
    defaultHeaders: HttpHeaders;
    configuration: Configuration;

    /**
     * 
     * Check the credentials and return the REST Token if the credentials are valid and authenticated. Calls Django Auth login method to register User ID in Django session framework  Accept the following POST parameters: username, password Return the REST Framework Token Object\&#39;s key.
     * @param login 
     */
    authLoginCreate(login: Login, extraHttpRequestParams?: any): Observable<JWT>;

    /**
     * 
     * Calls Django logout method and delete the Token object assigned to the current User object.  Accepts/Returns nothing.
     */
    authLogoutCreate(extraHttpRequestParams?: any): Observable<RestAuthDetail>;

    /**
     * 
     * Calls Django Auth SetPasswordForm save method.  Accepts the following POST parameters: new_password1, new_password2 Returns the success/fail message.
     * @param passwordChange 
     */
    authPasswordChangeCreate(passwordChange: PasswordChange, extraHttpRequestParams?: any): Observable<RestAuthDetail>;

    /**
     * 
     * Password reset e-mail link is confirmed, therefore this resets the user\&#39;s password.  Accepts the following POST parameters: token, uid,     new_password1, new_password2 Returns the success/fail message.
     * @param passwordResetConfirm 
     */
    authPasswordResetConfirmCreate(passwordResetConfirm: PasswordResetConfirm, extraHttpRequestParams?: any): Observable<RestAuthDetail>;

    /**
     * 
     * Calls Django Auth PasswordResetForm save method.  Accepts the following POST parameters: email Returns the success/fail message.
     * @param passwordReset 
     */
    authPasswordResetCreate(passwordReset: PasswordReset, extraHttpRequestParams?: any): Observable<RestAuthDetail>;

    /**
     * 
     * Takes a refresh type JSON web token and returns an access type JSON web token if the refresh token is valid.
     * @param tokenRefresh 
     */
    authTokenRefreshCreate(tokenRefresh: TokenRefresh, extraHttpRequestParams?: any): Observable<TokenRefresh>;

    /**
     * 
     * Takes a token and indicates if it is valid.  This view provides no information about a token\&#39;s fitness for a particular use.
     * @param tokenVerify 
     */
    authTokenVerifyCreate(tokenVerify: TokenVerify, extraHttpRequestParams?: any): Observable<TokenVerify>;

    /**
     * 
     * Reads and updates UserModel fields Accepts GET, PUT, PATCH methods.  Default accepted fields: username, first_name, last_name Default display fields: pk, username, email, first_name, last_name Read-only fields: pk, email  Returns UserModel fields.
     * @param patchedUserDetails 
     */
    authUserPartialUpdate(patchedUserDetails?: PatchedUserDetails, extraHttpRequestParams?: any): Observable<UserDetails>;

    /**
     * 
     * Reads and updates UserModel fields Accepts GET, PUT, PATCH methods.  Default accepted fields: username, first_name, last_name Default display fields: pk, username, email, first_name, last_name Read-only fields: pk, email  Returns UserModel fields.
     */
    authUserRetrieve(extraHttpRequestParams?: any): Observable<UserDetails>;

    /**
     * 
     * Reads and updates UserModel fields Accepts GET, PUT, PATCH methods.  Default accepted fields: username, first_name, last_name Default display fields: pk, username, email, first_name, last_name Read-only fields: pk, email  Returns UserModel fields.
     * @param userDetails 
     */
    authUserUpdate(userDetails: UserDetails, extraHttpRequestParams?: any): Observable<UserDetails>;

}