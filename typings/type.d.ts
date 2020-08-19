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
  interface Global {
    __originSetTimeout: typeof setTimeout
    __originSetInterval: typeof setInterval
    __originSetImmediate: typeof setImmediate
  }

  interface EventEmitter {
    __originEmit(event: string | symbol, ...args: any[]): boolean
  }

  interface Process {
    __originNextTick(callback: Function, ...args: any[]): void
  }
}



declare interface Promise<T> {
  __originThen<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
  __originCatch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
  __originFinally(onfinally?: (() => void) | undefined | null): Promise<T>
}
