# Express View Cache Clean

Express enables view template compilation caching in production (when `NODE_ENV` is `production`) which can improve performance. `express-view-cache-clean` can watch view file changes to clean relative caches.

`NOTICE: only supported ejs template!!`

## Installation

```shell
yarn add express-view-cache-clean
```

or

```shell
npm i express-view-cache-clean --save
```

## Example

```js
const express = require('express')
const expressViewCacheClean = require('express-view-cache-clean')

const app = express()

expressViewCacheClean({
  app,
  viewPath: './views',
  // when filename includes 'page/home' view file changes, it will clean name includes 'page/home' cache
  rules: ['page/home', 'page/category'],
  recursive: true
})

```

## Options

**Clean Up Options**

* `app: Express` (required)
* `viewPath: String` (required)
* `rules: Object | Array<String> | Array<Object>` (required)

   Multiple `rules` configuration formats:

   ```js
   // when filename includes 'page' view file changes, it will clean name includes 'page/home' cache
   rules: {
     'page/home': 'page/home',
   }

   rules: [
     'page/home',
     'page/category'
   ]

   rules: [{
     filename: 'page/home',
     cache: 'page/home'
   }]
   ```

   Multiple `filename` configuration formats:

   ```js
   // String
   filename: 'page/home'

   // Function
   filename: (filename) => {
     return filename.includes('page/home')
   }

   // Regex
   filename: /page\/home/
   ```

   Multiple `cache` configuration formats:

   ```js
   // String
   cache: 'page/home'

   // Function
   cache: (view, filename, app) => {
     return view.name.includes('page/home')
   }

   // RegExp
   cache: /page\/home/

   // Array<String | Function | RegExp>
   cache: [
     'page/home',
     (view, filename, app) => {
       return view.name.includes('page/second')
     },
     cache: /page\/other/
   ]
   ```


**Watch Options**

The usage and options are compatible with [fs.watch](https://nodejs.org/dist/latest-v7.x/docs/api/fs.html#fs_fs_watch_filename_options_listener).
* `persistent: Boolean` (default **true**)
* `recursive: Boolean` (default **false**)
* `encoding: String` (default **'utf8'**)
* `filter: RegExp | Function` (default **null**)

   Return that matches the filter expression.

    ```js
    // filter with regular expression
    filter: /\.json$/

    // filter with custom function
    filter: f => !/node_modules/.test(f)
    ```

* `delay: Number` (in ms, default **200**)

   Delay time of the callback function.

   ```js
   // log after 5 seconds
   delay: 5000
   ```

* `events: Array<String>` (default **['update']**)

   Watch file events, `update` or `remove`.

   ```js
   // only watch file update event
   events: ['update']
   // watch file all event
   events: ['update', 'remove']
   ```

## License

[MIT](./LICENSE)
