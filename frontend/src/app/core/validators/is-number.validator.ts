import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function isNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    // Check if the value is a valid number
    const isNumber = !isNaN(value) && value !== null && value !== '';

    return isNumber ? null : { isNumber: true }; // Return error if not a number
  };
}
