# callbag-safe-pipe

Callbag utility like callbag-pipe but wraps the operators calls in a tryCatch block, sending an eventual exception to the sink. Check out the tests for more details.

`npm install callbag-safe-pipe`

## Examples

### Catch error thrown in the map operator
```js
const map = require('callbag-map');
const fromIter = require('callbag-from-iter');
const subscribe = require('callbag-subscribe');
const safePipe = require('callbag-safe-pipe');

safePipe(
  fromIter([0, 1, 2]),
  map(x => x.thisIsUndefined.y),
  subscribe({
    next() {},
    error(err) {
      console.log(err.message) // Cannot read property 'b' of undefined
    }
  })
);
```
