/** In-memory localStorage stand-in with optional quota / failure simulation. */
export function installMemoryStorage({ quotaBytes = Infinity, broken = false } = {}) {
  const data = new Map()
  const used = () => [...data].reduce((n, [k, v]) => n + k.length + v.length, 0)
  const quotaError = () => Object.assign(new Error('quota'), { name: 'QuotaExceededError' })
  const storage = {
    getItem: (k) => {
      if (broken) throw new Error('SecurityError')
      return data.has(k) ? data.get(k) : null
    },
    setItem: (k, v) => {
      if (broken) throw new Error('SecurityError')
      const next = used() - (data.get(k)?.length ?? 0) - (data.has(k) ? k.length : 0) + k.length + String(v).length
      if (next > quotaBytes) throw quotaError()
      data.set(k, String(v))
    },
    removeItem: (k) => data.delete(k),
    clear: () => data.clear(),
    key: (i) => [...data.keys()][i] ?? null,
    get length() {
      return data.size
    },
  }
  // Object.keys(localStorage) must list the stored keys, like the real thing.
  const proxy = new Proxy(storage, {
    ownKeys: () => [...data.keys()],
    getOwnPropertyDescriptor: (_, k) => (data.has(k) ? { enumerable: true, configurable: true, value: data.get(k) } : undefined),
  })
  globalThis.localStorage = proxy
  globalThis.window ??= new EventTarget()
  return { data, setQuota: (q) => (quotaBytes = q) }
}
