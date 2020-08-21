declare interface Console {
  __debug(message?: any, ...optionalParams: any[]): void;
  __log(message?: any, ...optionalParams: any[]): void;
  __info(message?: any, ...optionalParams: any[]): void;
  __warn(message?: any, ...optionalParams: any[]): void;
  __error(message?: any, ...optionalParams: any[]): void;
}

declare module NodeJS {
  interface Domain {
    currentContext?: any;
  }

}
