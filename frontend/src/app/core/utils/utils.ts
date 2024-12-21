export class Utils {
  static titleCase(str: string): string {
    console.log(str);
    if (!str) {
      return '';
    }
    return str.replace(
      /\w\S*/g,
      (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase(),
    );
  }
  static prettyError(error: object): string {
    let result = '';
    if ("detail" in error) {
      return error["detail"] as string;
    }
    for (const key in error) {
      if (error.hasOwnProperty(key)) {
        result += `${Utils.titleCase(key)}: `;

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const allErrors = error[key];

        console.log("what", allErrors);
        for (let i = 0; i < allErrors.length; i++) {
          console.log("yaya:w ", allErrors[i]);
          result += `\t${allErrors[i]}\n`;
        }
      }
    }
    return result;
  }
}
