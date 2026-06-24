import bcrypt from 'bcryptjs';

export const verifyAdminPassword = async (password) => {
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!passwordHash || !password) {
    return false;
  }

  return bcrypt.compare(password, passwordHash);
};
