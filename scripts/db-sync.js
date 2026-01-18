const { execSync } = require('child_process');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load .env.local
const envConfig = dotenv.parse(fs.readFileSync(path.resolve(__dirname, '../.env.local')));

const env = { ...process.env, ...envConfig };

try {
    console.log('Running prisma generate with loaded .env.local...');
    execSync('npx prisma generate', {
        env: env,
        stdio: 'inherit'
    });

    console.log('Running prisma db push with loaded .env.local...');
    execSync('npx prisma db push', {
        env: env,
        stdio: 'inherit'
    });
} catch (error) {
    console.error('Command failed:', error.message);
    process.exit(1);
}
