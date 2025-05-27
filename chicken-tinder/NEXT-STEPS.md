# Next Steps for Chicken Tinder Development

## Setting Up the Development Environment

To continue working on the Chicken Tinder app on a new machine, follow these steps:

### 1. Install Node.js and npm
- Download the installer from [Node.js official website](https://nodejs.org/en/download/).
- Run the installer and follow the prompts to install Node.js and npm.
- Verify the installation by running the following commands in your terminal:
  ```
  node --version
  npm --version
  ```

### 2. Clone the Repository
- Open your terminal and navigate to the directory where you want to clone the project.
- Run the following command to clone the repository:
  ```
  git clone https://github.com/The-Frude/RestaurantPicker.git
  ```

### 3. Navigate to the Project Directory
- Change into the project directory:
  ```
  cd RestaurantPicker/chicken-tinder
  ```

### 4. Install Project Dependencies
- Run the setup script to install all necessary dependencies:
  ```
  npm run setup
  ```

### 5. Configure Environment Variables
- Create a `.env` file in the project root directory using the provided `.env.example` as a template.
- Add the following environment variables:
  ```
  # Supabase configuration
  EXPO_PUBLIC_SUPABASE_URL=https://qusdmcnqqguzkhnvwpyx.supabase.co
  EXPO_PUBLIC_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1c2RtY25xcWd1emtobnZ3cHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMDg3ODksImV4cCI6MjA2MzU4NDc4OX0.Biq1MoyLQC0Q-viOAl5W9yofDshLhg-LKcuv9qCIm1A

  # Google Maps configuration
  EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyDhs3h0bn8kGl6KSBWTg7sHmNOdS_mi7A4
  ```

### 6. Set Up Android Development Environment
- **Install Android Studio**:
  - Download from [Android Studio official website](https://developer.android.com/studio).
  - Follow the installation instructions, ensuring that the Android SDK is installed.
  
- **Set ANDROID_HOME Environment Variable** (if necessary):
  - Find the SDK path (usually `C:\Users\YourUsername\AppData\Local\Android\Sdk`).
  - Set the environment variable:
    - Right-click on "This PC" or "My Computer" and select "Properties".
    - Click on "Advanced system settings".
    - Click on "Environment Variables".
    - Under "System variables", click "New" and add:
      - Variable name: `ANDROID_HOME`
      - Variable value: `C:\Users\YourUsername\AppData\Local\Android\Sdk`

### 7. Start the Development Server
- Run the following command to start the Expo development server:
  ```
  npm start
  ```

### 8. Open the App
- Use the Expo Go app on your mobile device to scan the QR code displayed in the terminal or browser to open the app.

## Additional Notes
- Ensure that you have the necessary permissions set up in your Google Cloud Console for the Google Maps API.
- If you encounter any issues, refer to the documentation for Expo and Google Maps API for troubleshooting.

By following these steps, you should be able to set up the Chicken Tinder app on your new machine and continue development seamlessly.
