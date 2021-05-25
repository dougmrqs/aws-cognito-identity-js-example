const Axios = require('axios');
const jsonwebtoken = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');

const { promisify } = require('util');

class Cognito {
  constructor() {
    this.region = process.env.AWS_REGION;
    this.poolId = process.env.POOL_ID;
  }

  getIssuer() {
    return `https://cognito-idp.${this.region}.amazonaws.com/${this.poolId}`;
  }

  getKeys() {
    return `${this.getIssuer()}/.well-known/jwks.json`;
  }
}

class TokenValidationService {
  constructor(accessToken) {
    this.objCognito = new Cognito();
    this.clocktime = Math.floor((new Date()).valueOf() / 1000);
    this.accessToken = accessToken || '';

    this.cacheKeys;
  }

  async validate() {
    try {
      const tokenSections = (this.accessToken).split('.');

      if (tokenSections.length < 2) {
        throw new Error('requested token is invalid');
      }

      const headerJSON = Buffer.from(tokenSections[0], 'base64').toString('utf8');
      const header = JSON.parse(headerJSON);
      const keys = await this.getCacheKeys();
      const key = keys[header.kid];

      if (key === undefined) {
        throw new Error('claim made for unknown kid');
      }

      const claim = await this.getClaim(this.accessToken, key);

      this.checkExpiration(claim);
      this.checkIssuer(claim);
      this.checkTokenUse(claim);

      return true;
    } catch (error) {
      return false;
    }
  }

  async getClaim(token, key) {
    return promisify(
      jsonwebtoken.verify.bind(jsonwebtoken)
    )(token, key.pem, { clockTimestamp: this.clocktime });
  }

  checkExpiration(claim) {
    if (this.clocktime > claim.exp || this.clocktime < claim.auth_time) {
      throw new Error();
    }
  }

  checkIssuer(claim) {
    if (claim.iss !== this.objCognito.getIssuer()) {
      throw new Error();
    }
  }

  checkTokenUse(claim) {
    if (claim.token_use !== 'access') {
      throw new Error();
    }
  }

  async getCacheKeys() {
    if (this.cacheKeys) return this.cacheKeys;

    const { data } = await Axios.default.get(
      this.objCognito.getKeys()
    );

    this.cacheKeys = data.keys.reduce((agg, current) => {
      const pem = jwkToPem(current);

      agg[current.kid] = { instance: current, pem };

      return agg;
    }, {});

    return this.cacheKeys;
  }
}

module.exports = TokenValidationService;
