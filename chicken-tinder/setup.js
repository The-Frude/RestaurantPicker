/**
 * Setup script for Chicken Tinder app
 * 
 * This script helps with initial project setup by:
 * 1. Installing dependencies
 * 2. Creating necessary directories
 * 3. Setting up environment variables
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  fg: {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
  },
  
  bg: {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m'
  }
};

/**
 * Main function to run the script
 */
async function main() {
  console.log(`${colors.bright}${colors.fg.cyan}=== Chicken Tinder Setup ===${colors.reset}\n`);
  
  try {
    // Check if node_modules exists
    const hasNodeModules = fs.existsSync(path.join(__dirname, 'node_modules'));
    
    if (!hasNodeModules) {
      console.log(`${colors.fg.yellow}Installing dependencies...${colors.reset}`);
      
      try {
        execSync('npm install', { stdio: 'inherit' });
        console.log(`${colors.fg.green}Dependencies installed successfully!${colors.reset}\n`);
      } catch (error) {
        console.error(`${colors.fg.red}Failed to install dependencies. Please run 'npm install' manually.${colors.reset}`);
        process.exit(1);
      }
    } else {
      console.log(`${colors.fg.green}Dependencies already installed.${colors.reset}\n`);
    }
    
    // Check if .env file exists
    const hasEnvFile = fs.existsSync(path.join(__dirname, '.env'));
    
    if (!hasEnvFile) {
      console.log(`${colors.fg.yellow}Setting up environment variables...${colors.reset}`);
      
      const setupEnv = await askQuestion(`Would you like to set up your .env file now? (y/n) `);
      
      if (setupEnv.toLowerCase() === 'y') {
        await createEnvFile();
      } else {
        console.log(`\n${colors.fg.yellow}Skipping .env setup. You'll need to create a .env file manually.${colors.reset}`);
        console.log(`${colors.fg.yellow}See .env.example for the required variables.${colors.reset}\n`);
      }
    } else {
      console.log(`${colors.fg.green}.env file already exists.${colors.reset}\n`);
    }
    
    // Check if assets directories exist
    const assetsDir = path.join(__dirname, 'assets');
    const hasAssetsDir = fs.existsSync(assetsDir);
    
    if (!hasAssetsDir) {
      console.log(`${colors.fg.yellow}Creating assets directories...${colors.reset}`);
      
      try {
        fs.mkdirSync(path.join(assetsDir, 'images'), { recursive: true });
        fs.mkdirSync(path.join(assetsDir, 'fonts'), { recursive: true });
        console.log(`${colors.fg.green}Assets directories created successfully!${colors.reset}\n`);
      } catch (error) {
        console.error(`${colors.fg.red}Failed to create assets directories: ${error.message}${colors.reset}`);
      }
    } else {
      console.log(`${colors.fg.green}Assets directories already exist.${colors.reset}\n`);
    }
    
    console.log(`${colors.bright}${colors.fg.green}Setup complete!${colors.reset}\n`);
    console.log(`${colors.fg.cyan}Next steps:${colors.reset}`);
    console.log(`1. Set up your Supabase project (run 'npm run prepare-db')`);
    console.log(`2. Start the development server (run 'npm start')`);
    console.log(`3. Open the app in Expo Go on your device\n`);
    
    console.log(`${colors.fg.green}Happy coding! 🚀${colors.reset}`);
    rl.close();
  } catch (error) {
    console.error(`${colors.fg.red}Error: ${error.message}${colors.reset}`);
    rl.close();
    process.exit(1);
  }
}

/**
 * Create .env file with user input
 */
async function createEnvFile() {
  console.log(`\n${colors.fg.cyan}Please enter your API keys and configuration:${colors.reset}`);
  
  const supabaseUrl = await askQuestion('Supabase URL: ');
  const supabaseKey = await askQuestion('Supabase Anon Key: ');
  const yelpApiKey = await askQuestion('Yelp API Key (optional, press Enter to skip): ');
  const googleMapsApiKey = await askQuestion('Google Maps API Key (optional, press Enter to skip): ');
  
  const envContent = `# Supabase configuration
EXPO_PUBLIC_SUPABASE_URL=${supabaseUrl}
EXPO_PUBLIC_SUPABASE_KEY=${supabaseKey}

# Yelp API configuration
EXPO_PUBLIC_YELP_API_KEY=${yelpApiKey}

# Google Maps configuration (optional)
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=${googleMapsApiKey}

# App configuration
EXPO_PUBLIC_APP_NAME=Chicken Tinder
EXPO_PUBLIC_APP_VERSION=1.0.0
`;
  
  try {
    fs.writeFileSync(path.join(__dirname, '.env'), envContent);
    console.log(`\n${colors.fg.green}.env file created successfully!${colors.reset}\n`);
  } catch (error) {
    console.error(`${colors.fg.red}Failed to create .env file: ${error.message}${colors.reset}`);
  }
}

/**
 * Helper function to ask a question and get user input
 */
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Run the main function
main().catch(error => {
  console.error(`${colors.fg.red}Unhandled error: ${error.message}${colors.reset}`);
  rl.close();
  process.exit(1);
});
