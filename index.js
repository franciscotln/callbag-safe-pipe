const safePipe = (...cbs) => {
  const originalSource = cbs.shift();
  const originalSink = cbs.pop();
  const reducer = (source, operator) => operator((start, sink) => {
    if (start !== 0) return;
    let talkBack;
    let done;
    const endWithError = (err) => {
      done = true;
      sink(2, err);
      if (typeof talkBack === 'function') talkBack(2);
    };
    try {
      source(0, (t, d) => {
        if (done) return;
        if (t === 0) talkBack = d;
        try {
          sink(t, d);
        } catch (e) {
          endWithError(e);
        }
      });
    } catch(err) {
      endWithError(err);
    }
  });
  const composedSource = cbs.reduce(reducer, originalSource);

  return typeof originalSink === 'function' ? originalSink(composedSource) : composedSource;
};

module.exports = safePipe;
