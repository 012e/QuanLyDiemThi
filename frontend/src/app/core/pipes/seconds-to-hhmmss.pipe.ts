import { Pipe, PipeTransform } from '@angular/core';
/*
 * Transform seconds (number) yo hh:mm:ss string
 */

@Pipe({ name: 'secondsToHhmmss', standalone: true })
export class SecondsToHhmmssPipe implements PipeTransform {
  transform(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600) + 'h';
    const minutes = Math.floor((totalSeconds % 3600) / 60) + 'm';
    const seconds = (totalSeconds % 60) + 's';
    let result = `${minutes
      .toString()
      .padStart(1, '0')}:${seconds.toString().padStart(2, '0')}`;
    if (!!hours) {
      result = `${hours.toString()}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return result;
  }
}
