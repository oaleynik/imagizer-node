# Repo Modernization Instructions

This repository is being modernized for the next major release of `imagizer-node`.

## Release Direction

- Ship the package as an ESM-only major release.
- Keep the `ImagizerClient` runtime behavior compatible unless there is a strong reason to change it.
- Treat the module-system change as the primary intentional breaking change.

## Tooling Direction

- Use `pnpm` for dependency management and project scripts.
- Use Vite library mode for the JavaScript bundle.
- Use Vitest for tests.
- Use TypeScript for source authoring and declaration output.
- Use Oxc for linting and formatting.
- Target Node `>=20.19.0`.

## Packaging Direction

- Build into `dist/`.
- Publish only `dist/` and required package metadata.
- Do not ship tests, raw source, or repo-only config files in the npm tarball.

## Execution Rules

- Capture current behavior with tests before meaningful refactors.
- Prefer focused, incremental changes over one large rewrite.

## Current Checklist

- [x] Port the legacy constructor, path sanitization, query building, and `buildURL()` coverage from Mocha to Vitest.
- [x] Delete the legacy Mocha test file after parity is in place.
- [x] Replace the old npm/Mocha metadata in `package.json` with pnpm, Vite, Vitest, and TypeScript.
- [x] Generate `pnpm-lock.yaml` and remove `package-lock.json`.
- [x] Remove obsolete repo-era config files that no longer match the toolchain.
- [x] Configure the build to emit into `dist/` with Vite library mode.
- [x] Configure the package to publish only `dist/` and package metadata.
- [x] Verify the packed tarball no longer includes tests, source, or repo config files.
- [x] Replace `js-base64` with native Node base64url encoding.
- [x] Move the runtime source to an ESM entrypoint.
- [x] Port the existing `ImagizerClient` behavior into the new implementation.
- [x] Author the source in TypeScript.
- [x] Configure `.d.ts` emission into `dist/`.
- [x] Convert the published package metadata to ESM-only exports.
- [x] Update examples and docs to use ESM imports.
- [x] Add Oxc-based lint and format scripts.
- [x] Run the Vitest suite.
- [x] Run the production build.
- [x] Run a tarball dry run against the new package metadata.
