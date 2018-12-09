const test = require('tape');
const { interval, fromIter, fromPromise, map } = require('callbag-basics');
const subscribe = require('callbag-subscribe');
const safePipe = require('.');

test('Listenable: it catches the error thrown in the map operator and redirects it to observer\'s error(){} method', t => {
  safePipe(
    interval(100),
    map(n => n.thisIsUndefined.b),
    subscribe({
      next() {
        t.equals(true, false, 'never gets called');
        t.end();
      },
      error(e) {
        t.equals("Cannot read property 'b' of undefined", e.message);
        t.end();
      }
    })
  );
});

test('Listenable: it unsubscribes from the source if an error is thrown in some operator inside the chain', t => {
  let n = 0;

  safePipe(
    interval(100),
    map(n => n.thisIsUndefined.b),
    subscribe({
      next() {
        t.equals(true, false, 'never gets called');
        t.end();
      },
      error(e) {
        n++;
        t.equals("Cannot read property 'b' of undefined", e.message);
      }
    })
  );

  setTimeout(() => {
    t.equals(1, n, 'called once and unsubscribed');
    t.end();
  }, 300);
});

test('Listenable: sources that emit an error still passes it to the observer\'s error(){} method', t => {
  safePipe(
    fromPromise(Promise.reject('bad code')),
    map(x => x.y.z),
    subscribe({
      next() {
        t.equals(true, false, 'never gets called');
        t.end();
      },
      error(e) {
        t.equals(e, 'bad code');
        t.end();
      }
    })
  );
});

test('Iterable: it catches the error thrown in the map operator and redirects it to observer\'s error(){} method', t => {
  safePipe(
    fromIter([0, 1, 2]),
    map(n => n.thisIsUndefined.b),
    subscribe({
      next() {
        t.equals(true, false, 'never gets called');
        t.end();
      },
      error(e) {
        t.equals("Cannot read property 'b' of undefined", e.message);
        t.end();
      }
    })
  );
});

test('Iterable: it catches the error thrown by the source fromIter() being called without argument', t => {
  safePipe(
    fromIter(),
    map(n => n + 1),
    subscribe({
      next() {
        t.equals(true, false, 'never gets called');
        t.end();
      },
      error(e) {
        t.equals("Cannot read property 'Symbol(Symbol.iterator)' of undefined", e.message);
        t.end();
      }
    })
  );
});

test('Iterable: it catches the error thrown inside the subscriber', t => {
  safePipe(
    fromIter([1, 2, 3]),
    map(n => n + 1),
    subscribe({
      next(number) {
        const throwing = number.a.doesntExist;
      },
      error(e) {
        t.equals("Cannot read property 'doesntExist' of undefined", e.message);
        t.end();
      }
    })
  );
});

test('Iterable: it does NOT catch the error when subscribing outside the safePipe function', t => {
  const stream = safePipe(
    fromIter([0, 1, 2]),
    map(n => n.thisIsUndefined.b)
  );

  t.throws(() => {
    subscribe(() => {})(stream);
  });
  t.end();
});
