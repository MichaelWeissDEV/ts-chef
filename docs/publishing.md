# Publishing a release

The extension identifier is `michaelweiss.vscode-ts-chef`. Keep it unchanged so existing installations receive updates. A GitHub Release supplies downloadable files; Marketplace and Open VSX listings are separate publishing destinations.

## GitHub Releases

1. Update `package.json` and both root version fields in `package-lock.json` together. For the next patch, use `npm version patch --no-git-tag-version`.
2. Update `CHANGELOG.md` and write English notes at `reports/v<VERSION>-release-notes.md`. Run the normal checks and commit the release changes.
3. Push the commit and require a green CI run on Ubuntu, macOS ARM64 and macOS Intel. CI validates source, real host/UI behavior, documentation, the installed VSIX and the official 0.8.1 upgrade path.
4. Tag that exact commit, using the package version, and push only that tag:

   ```sh
   git tag -a v0.9.0 -m "ts-chef 0.9.0"
   git push origin v0.9.0
   ```

The **Release** workflow validates the immutable tag and runs the same gates again. Only then does it create an English GitHub Release with the verified VSIX, offline documentation, artifact manifest and `SHA256SUMS`. Failed or skipped required gates prevent publication. A manual run on a branch is rejected. Do not move a published tag or silently replace an existing version.

Download the VSIX from the release's **Assets** section or its release-note link. Install it through **Extensions: Install from VSIX...**. Match its SHA-256 with `SHA256SUMS` before publishing that same file to a registry. Do not rebuild between registry uploads.

## Visual Studio Marketplace

Use the existing `michaelweiss` publisher and extension entry. Sign in to [publisher management](https://marketplace.visualstudio.com/manage/publishers/), open the extension and upload the verified release VSIX as its new version. This manual route avoids storing a publishing token in this repository.

For CLI publishing, authenticate for that publisher and upload the existing artifact:

```sh
npx vsce login michaelweiss
npx vsce publish --packagePath vscode-ts-chef-0.9.0.vsix
```

Publisher access is required. A PAT needs Marketplace Manage scope; keep it outside Git and chat. Microsoft's current guidance recommends Microsoft Entra ID for automated publishing, and global Azure DevOps PATs retire on December 1, 2026. See the [official publishing guide](https://code.visualstudio.com/api/working-with-extensions/publishing-extension) before configuring long-term automation.

## Open VSX

Sign in to [Open VSX](https://open-vsx.org/) with GitHub, connect an Eclipse account and accept the publisher agreement yourself. Create an access token in your account settings. Ensure your account can publish under the `michaelweiss` namespace; create it once if absent, and claim ownership if appropriate.

Use the same verified VSIX, supplying the token privately through your terminal's environment:

```sh
npx ovsx create-namespace michaelweiss
npx ovsx publish vscode-ts-chef-0.9.0.vsix
```

The CLI reads `OVSX_PAT`; set it in your local environment without committing it. Skip namespace creation if it already exists. Existing installations receive the new version under the unchanged namespace and extension name. Check the registry listing after processing. See the [official Open VSX publishing instructions](https://github.com/eclipse-openvsx/openvsx/wiki/Publishing-Extensions).

## After publication and the next patch

Verify the GitHub asset links and both registry versions. Registry validation and update propagation may take time. Record the successful tag workflow URL in the readiness report. The next planned patch is described in [Next release](next-release.md); its package version is deliberately not activated before 0.9.0 ships.

Screenshots must show only the application window with synthetic, shareable content. Never capture the desktop, unrelated windows, notifications or personal data. No new screenshots are required to publish this release.
