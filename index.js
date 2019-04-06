const watch = require('node-watch')

const defaultOptions = {
  app: undefined,
  persistent: true,
  recursive: false,
  encoding: 'utf8',
  filter: undefined,
  delay: 200,
  viewPath: undefined,
  events: ['update'] // ['update', 'remove']
}

const checkExist = (options, key) => {
  const ext = key ? `.${key}` : ''
  const obj = key ? options[key] : options
  if (!obj) {
    throw new Error(`expressViewCacheClean options${ext} can not be null!`)
  }
}

const convertToArrayRules = (objRules) => Object.entries(objRules).map(([k, v]) => ({
  filename: k,
  cache: v
}))

const stringRuleMapper = (r) => {
  if (typeof r !== 'string') {
    return r
  }

  return {
    filename: r,
    cache: r
  }
}

const matchRule = (filename) => (r) => {
  const type = typeof r.filename
  if (type === 'string') {
    if (r.filename === '*') {
      return true
    }
    return filename.includes(r.filename)
  }
  if (type === 'function') {
    return r.filename(filename)
  }
  if (r.filename instanceof RegExp) {
    return r.filename.test(filename)
  }
  return false
}

const removeEjsCache = (key) => {
  try {
    const ejs = require('ejs')
    ejs.cache.set(key, undefined)
  } catch (e) {

  }
}

const removeCache = (filename, app) => (r) => {
  if (!r.cache) {
    throw new Error(`rule '${r.filename}', cache can not set empty.`)
  }

  if (!app.cache) {
    return
  }

  let caches
  if (!Array.isArray(r.cache)) {
    caches = [r.cache]
  } else {
    caches = r.cache
  }

  Object.entries(app.cache).forEach(([name, view]) => {
    const key = view.path || name || ''
    for (let i = 0; i < caches.length; i++) {
      const h = caches[i]
      if (typeof h === 'string') {
        if (h === '*' || key.includes(h)) {
          removeEjsCache(view.path)
          delete app.cache[name]
          break
        }
      } else if (typeof h === 'function') {
        if (h(view, filename, app)) {
          removeEjsCache(view.path)
          delete app.cache[name]
          break
        }
      } else if (h instanceof RegExp) {
        if (h.test(key)) {
          removeEjsCache(view.path)
          delete app.cache[name]
          break
        }
      }
    }
  })
}

const getCleaner = (options) => {
  let rules
  if (!Array.isArray(options.rules)) {
    rules = convertToArrayRules(options.rules)
  } else {
    rules = options.rules
  }

  return (filename) => {
    if (!filename) {
      return
    }

    rules
      .map(stringRuleMapper)
      .filter(matchRule(filename))
      .forEach(removeCache(filename, options.app))
  }
}

const expressViewCacheClean = (options) => {
  options = Object.assign({}, defaultOptions, options)

  checkExist(options)
  checkExist(options.app)
  checkExist(options.viewPath)
  checkExist(options.events)
  checkExist(options.rules)

  const cleaner = getCleaner(options)

  return watch(options.viewPath, {
    persistent: options.persistent,
    recursive: options.recursive,
    encoding: options.encoding,
    filter: options.filter,
    delay: options.delay
  }, (evt, name) => {
    if (options.events.includes(evt)) {
      cleaner(name)
    }
  })
}

module.exports = expressViewCacheClean
