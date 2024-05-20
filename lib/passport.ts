import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import passport from 'passport';
import { Secret, sign } from 'jsonwebtoken';
import { prisma } from './prisma';
import { Provider } from 'interface/enums';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: process.env.NEXT_PUBLIC_BASE_URL + '/api/auth/google/callback',
    },
    async (_accessToken, _refreshToken, profile, cb) => {
      try {
        const { id, email, displayName, picture } = profile;

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          user = await prisma.user.create({
            data: {
              name: displayName,
              email,
              password: id,
              image: picture,
              dateOfBirth: new Date(2000, 1, 1),
              isSSO: true,
              provider: Provider.GOOGLE,
              isVerified: false,
            },
          });
        }

        const token = sign({ id: user.id, email: user.email }, process.env.JWT_TOKEN as Secret, {
          expiresIn: '30d',
        });

        return cb(null, { token });
      } catch (e: any) {
        return cb(e, false);
      }
    },
  ),
);

export { passport };
