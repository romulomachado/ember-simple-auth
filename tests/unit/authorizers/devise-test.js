/* jshint expr:true */
import { it } from 'ember-mocha';
import { describe, beforeEach } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import Devise from 'ember-simple-auth/authorizers/devise';
import Session from 'ember-simple-auth/session';
import EphemeralStore from 'ember-simple-auth/stores/ephemeral';

let authorizer;
let session;
let block;

describe('Devise', () => {
  beforeEach(() => {
    session    = Session.create({ store: EphemeralStore.create() });
    authorizer = Devise.create({ session });
    block      = sinon.spy();
  });

  describe('#authorize', () => {
    function itDoesNotAuthorizeTheRequest() {
      it('does not call the block', () => {
        authorizer.authorize(block);

        expect(block).to.not.have.been.called;
      });
    }

    describe('when the session is authenticated', () => {
      beforeEach(() => {
        authorizer.set('session.isAuthenticated', true);
      });

      describe('when the session contains a non empty token and email', () => {
        beforeEach(() => {
          authorizer.set('session.authenticated.token', 'secret token!');
          authorizer.set('session.authenticated.email', 'user@email.com');
        });

        it('calls the block with a header containing "token" and "email"', () => {
          authorizer.authorize(block);

          expect(block).to.have.been.calledWith('Authorization', 'Token token="secret token!", email="user@email.com"');
        });
      });

      describe('when custom identification and token attribute names are configured', () => {
        beforeEach(() => {
          authorizer = Devise.extend({ tokenAttributeName: 'employee_token', identificationAttributeName: 'employee_email' }).create();
        });

        describe('when the session contains a non empty employee_token and employee_email', () => {
          beforeEach(() => {
            authorizer.set('session', session);
            authorizer.set('session.authenticated.employee_token', 'secret token!');
            authorizer.set('session.authenticated.employee_email', 'user@email.com');
          });

          it('calls the block with a header containing "employee_token" and "employee_email"', () => {
            authorizer.authorize(block);

            expect(block).to.have.been.calledWith('Authorization', 'Token employee_token="secret token!", employee_email="user@email.com"');
          });
        });
      });

      describe('when the session does not contain a token', () => {
        beforeEach(() => {
          authorizer.set('session.authenticated.token', null);
        });

        itDoesNotAuthorizeTheRequest();
      });

      describe('when the session does not contain an email', () => {
        beforeEach(() => {
          authorizer.set('session.authenticated.email', null);
        });

        itDoesNotAuthorizeTheRequest();
      });
    });

    describe('when the session is not authenticated', () => {
      beforeEach(() => {
        authorizer.set('session.isAuthenticated', false);
      });

      itDoesNotAuthorizeTheRequest();
    });
  });
});