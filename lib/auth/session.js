import { SignJWT, jwtVerify } from 'jose';

const SESSION_COOKIE_NAME = 'boiko_admin_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const getSessionSecret = () => {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error('SESSION_SECRET is not configured.');
  }

  return new TextEncoder().encode(secret);
};

export const getSessionCookieName = () => {
  return SESSION_COOKIE_NAME;
};

export const getSessionMaxAgeSeconds = () => {
  return SESSION_MAX_AGE_SECONDS;
};

export const createAdminSessionToken = async () => {
  return new SignJWT({ admin: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSessionSecret());
};

export const verifyAdminSessionToken = async (token) => {
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSessionSecret());

    if (payload.admin !== true) {
      return null;
    }

    return { admin: true };
  } catch {
    return null;
  }
};

export const getAdminSessionFromRequest = async (request) => {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  return verifyAdminSessionToken(token);
};

export const appendSessionCookie = (response, token) => {
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return response;
};

export const clearSessionCookie = (response) => {
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
};
