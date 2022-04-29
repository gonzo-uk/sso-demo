const { Issuer, Strategy } = require('openid-client')
const passport = require('passport');
const jose = require('node-jose');
const fs = require('fs');

const privateKEY = fs.readFileSync(process.env.SSO_PRIVATE_KEY || './private_key.pem', 'utf8');

const getConfiguredPassport = async () => {
  const govukIssuer = await Issuer.discover(process.env.SSO_DISCOVERY_URI);
  
  const key = await jose.JWK.asKey(privateKEY, 'pem', { use: 'sig', alg: 'RS256' });

  const client = new govukIssuer.Client({
    client_id: process.env.SSO_CLIENT_ID,
    redirect_uris: [process.env.SSO_REDIRECT_URIS],
    token_endpoint_auth_method: 'private_key_jwt',
    token_endpoint_auth_signing_alg: 'RS256',
    id_token_signed_response_alg: 'ES256',
    response_types: ['code']
  },
    {
      // keystore
      keys: [key.toJSON(true)],
    }
  );

  const oidcStrategy = new Strategy({ client }, (tokenSet, userInfo, done) => {
    console.log('running oidcStrategy fucntion', tokenSet, userInfo);
    // return done(null, tokenSet.claims());
    return done(null, userInfo);
  });

  passport.use('oidc', oidcStrategy);

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });

  return passport;
}

module.exports = {
  getConfiguredPassport: getConfiguredPassport,
}
