import crypto from 'crypto';

export function makeHash(ts: number, privateKey: string, publicKey: string) {
  return crypto
    .createHash('md5')
    .update(ts + privateKey + publicKey)
    .digest('hex')
    .toString();
}
