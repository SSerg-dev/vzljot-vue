export default function throttle (func, interval) {
  let isThrottled = false
  let savedArgs = null
  let savedThis = null

  function wrapper () {
    if (isThrottled) {
      savedArgs = arguments
      savedThis = this
      return
    }

    func.apply(this, arguments)
    isThrottled = true

    setTimeout(function () {
      isThrottled = false
      if (savedArgs) {
        wrapper.apply(savedThis, savedArgs)
        savedArgs = null
        savedThis = null
      }
    }, interval)
  }
  return wrapper
}
