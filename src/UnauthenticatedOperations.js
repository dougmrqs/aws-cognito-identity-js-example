const AmazonCognitoIdentity = require('amazon-cognito-identity-js');

const POOL_DATA = {
  UserPoolId: process.env.POOL_ID,
  ClientId: process.env.CLIENT_ID
};

class UnauthenticatedOperations {
  constructor({ username }) {
    this.username = username;
    this.pool = new AmazonCognitoIdentity.CognitoUserPool(POOL_DATA);
    this.user = new AmazonCognitoIdentity.CognitoUser(
      { Username: username, Pool: this.pool }
    );
  }

  authenticate({ password, newPassword }) {
    const details = new AmazonCognitoIdentity.AuthenticationDetails({
      Username: this.username,
      Password: password
    });

    return new Promise((resolve, reject) =>
      this.user.authenticateUser(details, {
        onSuccess: resolve,
        onFailure: reject,
        newPasswordRequired: () => {
          return this._setNewPassword(newPassword)
            .then(resolve)
            .catch(reject);
        }
      })
    );
  }

  _setNewPassword(newPassword) {
    return new Promise((resolve, reject) => {
      this.user.completeNewPasswordChallenge(
        newPassword, {},
        {
          onSuccess: resolve,
          onFailure: reject,
        }
      );
    });
  }
}

module.exports = UnauthenticatedOperations;
