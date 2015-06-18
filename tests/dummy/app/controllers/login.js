import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    authenticate() {
      let data = this.getProperties('identification', 'password');
      this.get('session').authenticate('authenticator:oauth2-password-grant', data).catch((reason) => {
        this.set('errorMessage', reason.error);
      });
    }
  }
});