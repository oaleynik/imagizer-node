# imagizer-node Repo Notes

## Project Shape

- `imagizer-node` is an ESM-only package.
- The package should keep `ImagizerClient` runtime behavior stable unless there is a strong reason to change it.
- The intentional breaking change already made is the move from CommonJS to ESM-only.

## Toolchain

- Use `pnpm` for dependency management and scripts.
- Source is authored in TypeScript.
- Use Vite library mode for the JavaScript bundle.
- Use Vitest for tests.
- Use Oxc for linting and formatting.
- Target Node `>=20.19.0`.

## Packaging

- Build output goes to `dist/`.
- Publish only `dist/` and required package metadata.
- Do not ship tests, raw source, or repo-only config files in the npm tarball.

## Verification

Run these before finishing meaningful changes:

- `pnpm format:check`
- `pnpm lint`
- `pnpm test`
- `pnpm build`

Use `pnpm pack:check` when validating the npm package contents.

## CI And Release

- GitHub Actions runs formatting, linting, tests, and build from `.github/workflows/ci.yml`.
- `pnpm publish:npm` is the gated local release command. It runs tests, lint, format check, and build before `pnpm publish`.
