import bcrypt from 'bcryptjs';
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

const SALT_ROUNDS = 12;

const promptForPassword = async () => {
  const passwordFromArgs = process.argv[2];

  if (passwordFromArgs) {
    return passwordFromArgs;
  }

  const readlineInterface = readline.createInterface({ input, output });

  try {
    return await readlineInterface.question('Admin password to hash: ');
  } finally {
    readlineInterface.close();
  }
};

const main = async () => {
  const password = await promptForPassword();

  if (!password) {
    console.error('Password is required.');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  console.log('\nAdd this to .env.local and Vercel:\n');
  console.log(`ADMIN_PASSWORD_HASH=${passwordHash}`);
};

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
