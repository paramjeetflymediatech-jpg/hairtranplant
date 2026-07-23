import dotenv from 'dotenv';
import readline from 'readline';
import { User, sequelize } from '../db/models';
import { hashPassword } from '../lib/auth';

dotenv.config();

function parseArgs(): Record<string, string> {
  const args: Record<string, string> = {};
  const argv = process.argv.slice(2);

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      if (arg.includes('=')) {
        const [key, ...valParts] = arg.slice(2).split('=');
        args[key] = valParts.join('=');
      } else {
        const key = arg.slice(2);
        const nextArg = argv[i + 1];
        if (nextArg && !nextArg.startsWith('--')) {
          args[key] = nextArg;
          i++;
        } else {
          args[key] = 'true';
        }
      }
    }
  }
  return args;
}

function promptQuestion(rl: readline.Interface, query: string, isSecret = false): Promise<string> {
  return new Promise((resolve) => {
    if (isSecret && process.stdin.isTTY) {
      process.stdout.write(query);
      let input = '';
      const onData = (char: Buffer) => {
        const str = char.toString('utf-8');
        switch (str) {
          case '\n':
          case '\r':
          case '\u0004':
            process.stdin.removeListener('data', onData);
            if (process.stdin.setRawMode) process.stdin.setRawMode(false);
            process.stdout.write('\n');
            resolve(input.trim());
            break;
          case '\u0003': // Ctrl+C
            process.exit(1);
            break;
          default:
            if (str.charCodeAt(0) === 127 || str.charCodeAt(0) === 8) { // Backspace
              if (input.length > 0) {
                input = input.slice(0, -1);
              }
            } else {
              input += str;
            }
            break;
        }
      };
      if (process.stdin.setRawMode) process.stdin.setRawMode(true);
      process.stdin.on('data', onData);
    } else {
      rl.question(query, (answer) => {
        resolve(answer.trim());
      });
    }
  });
}

async function run() {
  console.log('\n👑 GraftDesk Super Admin Creation Script');
  console.log('----------------------------------------');

  const cliArgs = parseArgs();

  let email = cliArgs.email || process.env.ADMIN_EMAIL || process.env.SUPER_ADMIN_EMAIL;
  let password = cliArgs.password || process.env.ADMIN_PASSWORD || process.env.SUPER_ADMIN_PASSWORD;
  let name = cliArgs.name || process.env.ADMIN_NAME || process.env.SUPER_ADMIN_NAME;
  let phone = cliArgs.phone || process.env.ADMIN_PHONE || process.env.SUPER_ADMIN_PHONE;

  const isInteractive = process.stdin.isTTY && !cliArgs.nonInteractive;

  if (isInteractive && (!email || !password)) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    if (!email) {
      email = await promptQuestion(rl, 'Enter Super Admin Email [default: superadmin@graftdesk.com]: ');
      if (!email) email = 'superadmin@graftdesk.com';
    }

    if (!name) {
      name = await promptQuestion(rl, 'Enter Super Admin Full Name [default: Platform Super Admin]: ');
      if (!name) name = 'Platform Super Admin';
    }

    if (!password) {
      password = await promptQuestion(rl, 'Enter Super Admin Password [default: password123]: ', true);
      if (!password) password = 'password123';
    }

    rl.close();
  }

  // Fallback defaults if still missing
  email = (email || 'superadmin@graftdesk.com').toLowerCase().trim();
  name = name || 'Platform Super Admin';
  password = password || 'password123';

  if (!email || !password) {
    console.error('❌ Error: Email and password are required.');
    process.exit(1);
  }

  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();

    console.log(`🔍 Checking user account for email: ${email}`);
    const existingUser = await User.findOne({ where: { email } });

    const hashedPassword = await hashPassword(password);

    if (existingUser) {
      console.log(`⚠️ User found (ID: ${existingUser.id}, Current Role: ${existingUser.role}).`);
      console.log('🔄 Updating account to SUPER_ADMIN...');

      existingUser.role = 'SUPER_ADMIN';
      existingUser.password = hashedPassword;
      existingUser.isActive = true;
      if (name) existingUser.name = name;
      if (phone) existingUser.phone = phone;

      await existingUser.save();

      console.log('\n✅ Super Admin account updated successfully!');
      console.log(`  - User ID: ${existingUser.id}`);
      console.log(`  - Name:    ${existingUser.name}`);
      console.log(`  - Email:   ${existingUser.email}`);
      console.log(`  - Role:    ${existingUser.role}`);
      console.log(`  - Status:  ${existingUser.isActive ? 'Active' : 'Inactive'}`);
    } else {
      console.log('✨ Creating new Super Admin account...');

      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        phone: phone || null,
        isActive: true,
      });

      console.log('\n✅ Super Admin created successfully!');
      console.log(`  - User ID: ${newUser.id}`);
      console.log(`  - Name:    ${newUser.name}`);
      console.log(`  - Email:   ${newUser.email}`);
      console.log(`  - Role:    ${newUser.role}`);
      console.log(`  - Status:  ${newUser.isActive ? 'Active' : 'Inactive'}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create/update Super Admin user:', error);
    process.exit(1);
  }
}

run();
