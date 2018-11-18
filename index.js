const safePipe = (...cbs) => {
  const originalSource = cbs.shift();
  const originalSink = cbs.pop();
  const reducer = (source, operator) => operator((start, sink) => {
    if (start !== 0) return;
    let talkBack;
    source(0, (t, d) => {
      if (t === 0) {
        talkBack = d;
      }
      try {
        sink(t, d);
      } catch (e) {
        sink(2, e);
        if (typeof talkBack === 'function') talkBack(2);
      }
    });
  });
  const composedSource = cbs.reduce(reducer, originalSource);

  return typeof originalSink === 'function' ? originalSink(composedSource) : composedSource;
};

module.exports = safePipe;
