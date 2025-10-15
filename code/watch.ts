import { watch as _watch, toValue } from 'vue'

// 封装 watch 记录引用数据类型的旧值
function watch(source: any, cb: (...args: any) => void, options: Record<string, any>) {
  let oldValue = structuredClone(toValue(source))
  return _watch(
    source,
    (val, _, onCleanup) => {
      cb(val, oldValue, onCleanup)
      oldValue = structuredClone(val)
    },
    options,
  )
}
