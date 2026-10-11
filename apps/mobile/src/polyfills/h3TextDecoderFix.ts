// h3-js's wasm glue code constructs `new TextDecoder('utf-16le')` at import time
// (to build a UTF16ToString helper it never actually calls). React Native's
// TextDecoder polyfill only supports utf-8 and throws RangeError on construction,
// crashing app startup before any screen renders. Patch the constructor to accept
// utf-16le as an alias for utf-8 — safe since h3-js never decodes with it.
const OriginalTextDecoder = (globalThis as any).TextDecoder;

if (OriginalTextDecoder) {
  class PatchedTextDecoder extends OriginalTextDecoder {
    constructor(encoding?: string, options?: TextDecoderOptions) {
      super(encoding === 'utf-16le' ? 'utf-8' : encoding, options);
    }
  }
  (globalThis as any).TextDecoder = PatchedTextDecoder;
}

export {};
