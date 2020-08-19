import { domainStack } from '../../domain'

Promise.prototype.__originThen = Promise.prototype.then
Promise.prototype.__originCatch = Promise.prototype.catch
Promise.prototype.__originFinally = Promise.prototype.finally


Promise.prototype.then = function<TResult1, TResult2> (onfulfilled, onrejected) {

  const fulfilledWarp = (value) => {
    domainStack()
    return onfulfilled(value)
  }

  if (onrejected && typeof onrejected === 'function') {
    const rejectedWarp = (res: any) => {
      domainStack()
      return onrejected(res)
    }

    return this.__originThen(fulfilledWarp, rejectedWarp)
  }

  return this.__originThen(fulfilledWarp)
}

Promise.prototype.catch = function (onrejected) {
  const rejectedWarp = (res: any) => {
    domainStack()
    return onrejected(res)
  }

  return this.__originCatch(rejectedWarp)
}

Promise.prototype.finally = function (onfinally) {
  const finallyWrap = () => {
    domainStack()
    onfinally()
  }

  return this.__originFinally(finallyWrap)
}
