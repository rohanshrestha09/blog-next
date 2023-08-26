import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import passport, { Profile } from 'passport';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: '/api/auth/google/callback',
    },
    async (_accessToken, _refreshToken, profile: Profile, cb) => {
      try {
        console.log(profile);
        // await saveUser(profile);
        return cb(null, profile);
      } catch (e: any) {
        return cb(e, false);
      }
    },
  ),
);

export { passport };
