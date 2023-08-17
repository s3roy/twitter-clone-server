import axios from 'axios';
import { prismaClient } from '../../clients/db';
import JWTService from '../../services/jwt';
import { GraphqlContext } from '../../interfaces';
import { User } from '@prisma/client';

interface GoogleTokenResult {
  iss?: string; // Issuer
  nbf?: number; // Not Before, a timestamp indicating when the token starts being valid
  aud?: string; // Audience, which client IDs the ID token is intended for
  sub?: string; // Subject Identifier, a unique identifier for the user
  email: string; // User's email
  email_verified: string; // If the user's email address is verified or not
  azp?: string; // Authorized party, the client ID of the app making the authentication request
  name?: string; // User's full name
  picture?: string; // URL of the user's profile picture
  given_name: string; // User's first name
  family_name?: string; // User's last name
  iat?: string; // Issued at time, timestamp of when the token was issued
  exp?: string; // Expiration time, timestamp of when the token will expire
  jti?: string; // JWT ID, a unique identifier for the token
  alg?: string; // Algorithm, typically indicates the cryptographic algorithm used
  kid?: string; // Key ID, used to select the correct key for verifying the token's signature
  typ?: string; // Type, usually "JWT"
}

const queries = {
  verifyGoogleToken: async (parent: any, { token }: { token: string }) => {
    const googleToken = token;
    const googleOauthURL = new URL('https://oauth2.googleapis.com/tokeninfo');
    googleOauthURL.searchParams.set('id_token', googleToken);

    const { data } = await axios.get<GoogleTokenResult>(
      googleOauthURL.toString(),
      {
        responseType: 'json',
      }
    );

    const user = await prismaClient.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      await prismaClient.user.create({
        data: {
          email: data.email,
          firstName: data.given_name,
          lastName: data.family_name,
          profileImageURL: data.picture,
        },
      });
    }

    const userInDb = await prismaClient.user.findUnique({
      where: { email: data.email },
    });

    if (!userInDb) throw new Error('User with email not found');

    const userToken = await JWTService.generateTokenForUser(userInDb);

    return userToken;
  },

  getCurrentUser: async (parent: any, args: any, ctx: GraphqlContext) => {
    const id = ctx.user?.id;
    if (!id) return null;

    const user = await prismaClient.user.findUnique({ where: { id } });
    return user;
  },
};

const extraResolvers = {
  User: {
    tweets: (parent: User) =>
      prismaClient.tweet.findMany({ where: { author: { id: parent.id } } }),
  },
};

export const resolvers = { queries, extraResolvers };
