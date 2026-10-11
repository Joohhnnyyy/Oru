import { expect, it } from 'vitest';
import { printableQrPayload } from '../lib/qr';
it('prints only the server-issued static signature for the selected source', () => {
  const signed = JSON.stringify({ v: 1, sourceId: 'bin-1', token: 'a'.repeat(64) });
  expect(printableQrPayload('bin-1', signed)).toBe(signed);
  expect(printableQrPayload('other-bin', signed)).toBeNull();
  expect(printableQrPayload('bin-1', JSON.stringify({ v: 1, sourceId: 'bin-1', token: '' }))).toBeNull();
  expect(printableQrPayload('bin-1', JSON.stringify({ sourceId: 'bin-1', secretKey: 'not-a-printable-code' }))).toBeNull();
  expect(printableQrPayload('bin-1', 'malformed')).toBeNull();
});
