# End-to-End Tests

This directory contains Playwright E2E tests for the WebMCP application.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in UI mode (interactive)
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed

# Run tests in debug mode
npm run test:debug
```

## Test Suites

### App Loading (`app-loading.spec.ts`)
- Tests that the application loads without errors
- Verifies page title
- Checks that the root element renders properly

### MCP Initialization (`mcp-initialization.spec.ts`)
- Validates MCP server initialization
- Checks database initialization
- Ensures no initialization errors

### Build Validation (`build-validation.spec.ts`)
- Verifies all critical assets load successfully
- Checks for JavaScript errors
- Validates React components render without crashes

## Configuration

Test configuration is in `playwright.config.ts` at the project root.

## CI/CD

Tests run automatically on:
- Pull requests to main/master/develop branches
- Pushes to main/master/develop branches

See `.github/workflows/e2e-tests.yml` for the CI configuration.
