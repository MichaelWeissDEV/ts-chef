# ts-chef documentation sources

The hosted documentation starts at [`index.md`](index.md) and is built with Sphinx plus MyST Markdown.

- Hosted site: <https://ts-chef.readthedocs.io/en/latest/>
- Local build and authoring instructions: [`documentation.md`](documentation.md)
- Read the Docs configuration: [`../.readthedocs.yaml`](../.readthedocs.yaml)
- Python dependencies: [`requirements.txt`](requirements.txt)

Run `npm run docs:catalog` after changing the operation registry, then build the site with:

```bash
python -m sphinx -W --keep-going -b html docs docs/_build/html
```
