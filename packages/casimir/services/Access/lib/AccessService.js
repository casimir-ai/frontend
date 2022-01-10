import decode from 'jwt-decode';
import { ACCESS_TOKEN_KEY, OWNER_PRIVATE_KEY, OWNER_PUBLIC_KEY } from '@deip/constants';
import { createInstanceGetter } from '@deip/toolbox';

export class AccessService {
  getTokenExpirationDate(jwt) {
    const token = decode(jwt);
    if (!token.exp) { return null; }

    const date = new Date(0);
    date.setUTCSeconds(token.exp);

    return date;
  }

  isTokenExpired(jwt) {
    const expirationDate = this.getTokenExpirationDate(jwt);
    return expirationDate < new Date();
  }

  getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getOwnerPrivKey() {
    return localStorage.getItem(OWNER_PRIVATE_KEY);
  }

  getOwnerPubKey() {
    return localStorage.getItem(OWNER_PUBLIC_KEY);
  }

  setOwnerKeysPair(privKey, pubKey) {
    localStorage.setItem(OWNER_PRIVATE_KEY, privKey);
    localStorage.setItem(OWNER_PUBLIC_KEY, pubKey);
  }

  clearAccessToken() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(OWNER_PRIVATE_KEY);
    localStorage.removeItem(OWNER_PUBLIC_KEY);
  }

  setAccessToken(jwt, privKey, pubKey) {
    localStorage.setItem(ACCESS_TOKEN_KEY, jwt);
    this.setOwnerKeysPair(privKey, pubKey);
  }

  isLoggedIn() {
    const jwt = this.getAccessToken();
    return !!jwt && !this.isTokenExpired(jwt);
  }

  getDecodedToken() {
    const jwt = this.getAccessToken();
    if (!jwt) return null;
    return decode(jwt);
  }

  decodedToken = (jwt) => decode(jwt)

  /** @type {() => AccessService} */
  static getInstance = createInstanceGetter(AccessService)
}