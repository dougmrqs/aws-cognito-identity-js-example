const AmazonCognitoIdentity = require('amazon-cognito-identity-js');

const POOL_DATA = {
  UserPoolId: process.env.POOL_ID,
  ClientId: process.env.CLIENT_ID
};

class AuthenticatedOperations {
  constructor({ username, idToken, accessToken, refreshToken }) {
    this.username = username;
    this.pool = new AmazonCognitoIdentity.CognitoUserPool(POOL_DATA);
    this.user = new AmazonCognitoIdentity.CognitoUser(
      { Username: username, Pool: this.pool }
    );
    this.session = new AmazonCognitoIdentity.CognitoUserSession({
      IdToken: new AmazonCognitoIdentity.CognitoIdToken({ IdToken: idToken }),
      AccessToken: new AmazonCognitoIdentity.CognitoAccessToken({ AccessToken: accessToken }),
      RefreshToken: new AmazonCognitoIdentity.CognitoRefreshToken({ RefreshToken: refreshToken })
    });
  }

  // Kills all the issued RefreshToken everywhere for this user.
  signOut() {
    this.user.setSignInUserSession(this.session);
    return new Promise((resolve, reject) => {
      this.user.globalSignOut({
        onSuccess: resolve,
        onFailure: reject
      });
    });
  }

  changePassword({ currentPassword, newPassword }) {
    this.user.setSignInUserSession(session);
    return new Promise((resolve, reject) => {
      this.user.changePassword(currentPassword, newPassword, (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      });
    });
  }

  refreshSession() {
    return new Promise((resolve, reject) => {
      this.user.refreshSession(this.session.getRefreshToken(), (err, session) => {
        if (err) {
          reject(err);
        } else {
          // To get the tokens from the session:
          // session.getAccessToken().getJwtToken()
          // session.getIdToken().getJwtToken()
          resolve(session);
        }
      });
    });
  }
}

module.exports = AuthenticatedOperations;
