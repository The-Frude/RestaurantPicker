# Contributing to Chicken Tinder

Thank you for considering contributing to Chicken Tinder! This document outlines the process for contributing to the project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and considerate of others.

## How Can I Contribute?

### Reporting Bugs

If you find a bug, please create an issue with the following information:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment information (OS, device, app version)

### Suggesting Features

We welcome feature suggestions! Please create an issue with:

- A clear, descriptive title
- A detailed description of the proposed feature
- Any relevant mockups or examples
- Why this feature would be useful to most users

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`npm run test && npm run lint`)
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Development Setup

1. Clone the repository
   ```
   git clone https://github.com/yourusername/chicken-tinder.git
   cd chicken-tinder
   ```

2. Run the setup script
   ```
   npm run setup
   ```

3. Start the development server
   ```
   npm start
   ```

## Project Structure

```
chicken-tinder/
├── app/                    # App-wide components and navigation
├── assets/                 # Static assets (images, fonts)
├── features/               # Feature-based modules
├── lib/                    # Shared utilities and services
├── providers/              # Context providers for state management
└── supabase/               # Supabase database setup
```

## Coding Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Include comments for complex logic
- Write tests for new features
- Update documentation when necessary

## Testing

- Run tests with `npm test`
- Ensure all tests pass before submitting a PR
- Add new tests for new features

## Documentation

- Update the README.md if necessary
- Document new features or changes in behavior
- Include JSDoc comments for functions and components

## Review Process

1. A maintainer will review your PR
2. They may request changes or ask questions
3. Once approved, your PR will be merged
4. Your contribution will be acknowledged in the release notes

## Questions?

If you have any questions, feel free to create an issue or reach out to the maintainers.

Thank you for contributing to Chicken Tinder!
