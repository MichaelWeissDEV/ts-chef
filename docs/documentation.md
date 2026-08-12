# Documentation development

The documentation is a Sphinx site written primarily in MyST Markdown. Read the Docs reads `.readthedocs.yaml`, installs pinned Python dependencies from `docs/requirements.txt`, and builds `docs/conf.py`.

## Local setup

Create an isolated Python environment outside the repository or in `.venv`, then install the documentation requirements:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -r docs/requirements.txt
```

On Windows PowerShell, activate with `.venv\Scripts\Activate.ps1`.

## Build HTML

```bash
python -m sphinx -W --keep-going -b html docs docs/_build/html
```

Open `docs/_build/html/index.html` in a browser. `-W` turns warnings into failures, matching the hosted build.

## Check links

```bash
python -m sphinx -W --keep-going -b linkcheck docs docs/_build/linkcheck
```

External services occasionally throttle automated checks. Add an ignore only when a stable URL cannot be checked mechanically; do not hide broken internal links.

## Regenerate the operation catalog

The checked-in catalog is derived from `src/opsRegistry.ts`:

```bash
npm run docs:catalog
```

Commit catalog changes alongside registry changes. CI verifies that regeneration leaves the working tree unchanged.

## Authoring rules

- Use relative `{doc}` links for pages in this site.
- Use descriptive link text for external URLs.
- Put screenshots in `docs/_static/screenshots/` and supply meaningful alternative text.
- Prefer tables for exact references and prose for concepts.
- Mark commands, setting keys, operation names, and pipeline expressions as code.
- Keep headings unique within a page so generated anchors remain predictable.
- Test HTML and linkcheck before opening a pull request.

## Read the Docs project setup

1. Sign in to [Read the Docs](https://readthedocs.org/) with the GitHub account that can access the repository.
2. Import `MichaelWeissDEV/ts-chef`.
3. Use the repository's `.readthedocs.yaml`; no dashboard build command is required.
4. Set the default branch to `master` and enable pull-request builds if desired.
5. Add the canonical custom domain only after DNS and TLS are ready; otherwise use `https://ts-chef.readthedocs.io/`.
6. Enable GitHub webhook integration so pushes and pull requests trigger builds.

The theme exposes **Edit on GitHub** links through `html_context`. Versioned Read the Docs builds provide stable `/en/latest/`, `/en/stable/`, and release paths when those versions are activated.
