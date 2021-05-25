# Minimum working example for AWS Cognito Identity

This package extends an article I've wrote about a problem we've solved with AWS Cognito.
The main resource used here is the [aws-cognito-identity-js](https://www.npmjs.com/package/amazon-cognito-identity-js)
package.

In general lines, this repository implements the mentioned package as back-end or server-side 
and probably will be just a feature or detail of implementation in your app's infrastructure.

This repository will assume you have a AWS account and access to Cognito service.

## What does this repository do?

* Assumes you have an already registered user. Either waiting for the first sign in flow (FORCE_CHANGE_PASSWORD status)
or to sign in the confirmed user. Use `UnauthenticatedOperations.authenticate` method.

* Invalidates the issued Refresh Token globally, with the `AuthenticatedOperations.signOut` method.

* Change the current password for the signed in user, with the `AuthenticatedOperations.changePassword` method.

* Get new Access and Id token to refresh your session, with the `AuthenticatedOperations.refreshSession` method.

* Verify if your session is still valid, with the `TokenValidationService.validate` method
