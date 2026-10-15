# Next release: 0.9.1

Version 0.9.1 is the next planned maintenance release, not a currently published version. The current package remains 0.9.0.

## Maintenance scope

- Address reproducible reports from 0.9.0 with focused regression tests.
- Recheck the retained node-forge advisory and update when a compatible upstream fix becomes available.
- Keep the three-platform CI and installed-package upgrade gates green.
- Refresh documentation for confirmed behavior changes; avoid unrelated feature or architecture work in the patch.

## Preparation checklist

After 0.9.0 is published, run `npm version patch --no-git-tag-version`, update the README version badge, move completed entries from the Unreleased changelog section into 0.9.1, and create `reports/v0.9.1-release-notes.md`. Include user-visible fixes, compatibility notes and remaining limitations in English. Commit, push and wait for CI before creating the matching version tag. The release workflow derives artifact filenames from the validated package version; no workflow filename edits are needed.

No release date or unimplemented feature is promised. See [Publishing a release](publishing.md) for the complete process.
