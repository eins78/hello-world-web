# Testing GitHub Actions Workflows Locally with Act

This guide explains how to test our GitHub Actions workflows locally, particularly the Playwright E2E tests with matrix strategies.

## What is Act?

[Act](https://github.com/nektos/act) allows you to run GitHub Actions locally. It uses Docker to create environments similar to GitHub Actions runners.

## Installation

### macOS (Homebrew)
```bash
brew install act
```

### Other platforms
- **Arch Linux**: `pacman -Syu act`
- **Windows (Chocolatey)**: `choco install act-cli`
- **From source**: Requires Go 1.20+
  ```bash
  git clone https://github.com/nektos/act.git
  cd act
  make build
  ```

## Initial Setup

On first run, act will prompt you to choose a default Docker image:

```bash
act
```

Choose based on your needs:
- **Micro** (~200MB): Minimal, Node.js only
- **Medium** (~500MB): Basic tools included (recommended)
- **Large** (~17GB): Full GitHub Actions environment

## Running Our Workflows

### Using Helper Scripts (Recommended)

We provide helper scripts to make running workflows easier:

```bash
# Run tests for a single browser
./scripts/run-workflow-e2e-browser.sh chromium
./scripts/run-workflow-e2e-browser.sh firefox
./scripts/run-workflow-e2e-browser.sh webkit

# Run tests for all browsers
./scripts/run-workflow-e2e-all.sh
```

### Direct act Commands

```bash
# Run all E2E tests (all browsers)
act -W .github/workflows/e2e-tests.yml

# Run specific browser from matrix (with container reuse)
act -W .github/workflows/e2e-tests.yml --matrix browser:chromium --reuse
act -W .github/workflows/e2e-tests.yml --matrix browser:firefox --reuse
act -W .github/workflows/e2e-tests.yml --matrix browser:webkit --reuse

# Run Docker E2E tests
act -W .github/workflows/docker-e2e-tests.yml
```

## Important Limitations

1. **Matrix runs sequentially**: Unlike GitHub Actions, act runs matrix jobs one after another, not in parallel
2. **No services support**: Database services aren't supported yet
3. **Different performance**: Local runs may be slower/faster than GitHub runners
4. **Docker required**: Must have Docker running locally
5. **Artifact upload fails**: This is expected - act doesn't have GitHub's runtime token (tests still run successfully)

## Tips

- **Use `--reuse` flag**: Avoids re-downloading dependencies on each run
- **The project's `.actrc` file**: Configures Playwright Docker image and architecture for consistency

## Troubleshooting

### Common Issues

1. **Docker not running**
   ```bash
   # Start Docker Desktop or Docker daemon
   sudo systemctl start docker  # Linux
   ```

2. **Permission errors**
   ```bash
   # Run with sudo or add user to docker group
   sudo usermod -aG docker $USER
   ```

3. **Out of disk space**
   ```bash
   # Clean up Docker images
   docker system prune -a
   ```

### Debugging

- Use `-v` flag for verbose output: `act -v`
- Check specific job: `act -j test`
- List available workflows: `act -l`

## Alternative: Run Tests Directly

For faster local testing without the full GitHub Actions environment:

```bash
# Run all browsers locally
cd packages/e2e-tests
pnpm install
npx playwright install
pnpm run generate
pnpm run e2e

# Run specific browser
pnpm run e2e -- --project=chromium
pnpm run e2e -- --project=firefox
pnpm run e2e -- --project=webkit
```

## Best Practices

1. **Test matrix changes**: Always test with `--matrix` flag when modifying matrix strategies
2. **Use Medium image**: Provides good balance of features and download size
3. **Cache Docker images**: Speeds up subsequent runs
4. **Check CI environment**: Some tests may behave differently locally vs CI

## Resources

- [Act Documentation](https://nektosact.com/)
- [Act GitHub Repository](https://github.com/nektos/act)
- [Playwright CI Documentation](https://playwright.dev/docs/ci)
