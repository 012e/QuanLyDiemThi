import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function floatValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    // If the value is empty, validation is not required (use required validator separately if needed)
    if (value === null || value === undefined || value === '') {
      return null;
    }

    // Check if the value is a valid float
    const isFloat = /^-?\d+(\.\d+)?$/.test(value);

    return isFloat ? null : { invalidFloat: true };
  };
}
