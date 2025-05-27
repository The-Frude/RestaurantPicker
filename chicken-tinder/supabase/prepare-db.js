/**
 * This script helps set up the Supabase database for the Chicken Tinder app.
 * It reads the SQL migration files and provides instructions for applying them.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');
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
  console.log(`${colors.bright}${colors.fg.cyan}=== Chicken Tinder Database Setup ===${colors.reset}\n`);
  
  try {
    // Check if migrations directory exists
    if (!fs.existsSync(MIGRATIONS_DIR)) {
      console.error(`${colors.fg.red}Error: Migrations directory not found at ${MIGRATIONS_DIR}${colors.reset}`);
      process.exit(1);
    }
    
    // Get all SQL migration files
    const migrationFiles = fs.readdirSync(MIGRATIONS_DIR)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure they're applied in order
    
    if (migrationFiles.length === 0) {
      console.error(`${colors.fg.red}Error: No SQL migration files found in ${MIGRATIONS_DIR}${colors.reset}`);
      process.exit(1);
    }
    
    console.log(`${colors.fg.green}Found ${migrationFiles.length} migration files:${colors.reset}`);
    migrationFiles.forEach((file, index) => {
      console.log(`${colors.fg.yellow}${index + 1}.${colors.reset} ${file}`);
    });
    
    console.log(`\n${colors.bright}${colors.fg.cyan}Instructions:${colors.reset}`);
    console.log(`1. Log in to your Supabase dashboard at https://app.supabase.com`);
    console.log(`2. Select your project`);
    console.log(`3. Go to the SQL Editor`);
    console.log(`4. Create a new query`);
    console.log(`5. Copy and paste the contents of each migration file`);
    console.log(`6. Execute the query\n`);
    
    const answer = await askQuestion(`${colors.fg.yellow}Would you like to view the contents of a migration file? (y/n)${colors.reset} `);
    
    if (answer.toLowerCase() === 'y') {
      await showMigrationContents(migrationFiles);
    } else {
      console.log(`\n${colors.fg.green}Happy coding! 🚀${colors.reset}`);
      rl.close();
    }
  } catch (error) {
    console.error(`${colors.fg.red}Error: ${error.message}${colors.reset}`);
    rl.close();
    process.exit(1);
  }
}

/**
 * Show the contents of a selected migration file
 */
async function showMigrationContents(migrationFiles) {
  const fileIndexStr = await askQuestion(`${colors.fg.yellow}Enter the number of the file to view (1-${migrationFiles.length}):${colors.reset} `);
  const fileIndex = parseInt(fileIndexStr, 10);
  
  if (isNaN(fileIndex) || fileIndex < 1 || fileIndex > migrationFiles.length) {
    console.log(`${colors.fg.red}Invalid selection. Please enter a number between 1 and ${migrationFiles.length}.${colors.reset}`);
    return showMigrationContents(migrationFiles);
  }
  
  const selectedFile = migrationFiles[fileIndex - 1];
  const filePath = path.join(MIGRATIONS_DIR, selectedFile);
  
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    console.log(`\n${colors.bright}${colors.fg.cyan}=== ${selectedFile} ===${colors.reset}\n`);
    console.log(fileContent);
    
    const answer = await askQuestion(`\n${colors.fg.yellow}View another file? (y/n)${colors.reset} `);
    if (answer.toLowerCase() === 'y') {
      await showMigrationContents(migrationFiles);
    } else {
      console.log(`\n${colors.fg.green}Happy coding! 🚀${colors.reset}`);
      rl.close();
    }
  } catch (error) {
    console.error(`${colors.fg.red}Error reading file: ${error.message}${colors.reset}`);
    rl.close();
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
