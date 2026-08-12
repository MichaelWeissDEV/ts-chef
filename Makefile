.PHONY: build test lint docs docs-api docs-html docs-linkcheck release package upload clean help

help:
	@echo "ts-chef development commands:"
	@echo "  make build    - Build the project"
	@echo "  make test     - Run all tests"
	@echo "  make lint     - Run linting and formatting"
	@echo "  make docs     - Regenerate the Sphinx operation catalog"
	@echo "  make docs-api - Generate TypeDoc API documentation"
	@echo "  make docs-html - Build the Sphinx HTML site"
	@echo "  make docs-linkcheck - Validate documentation links"
	@echo "  make release  - Build, test, and package (.vsix)"
	@echo "  make clean    - Remove build artifacts"

build:
	npm run build

test:
	npm run test

lint:
	npm run lint:fix
	npm run format

docs:
	npm run docs

docs-api:
	npm run docs:api

docs-html:
	python -m sphinx -W --keep-going -b html docs docs/_build/html

docs-linkcheck:
	python -m sphinx -W --keep-going -b linkcheck docs docs/_build/linkcheck

package:
	npm run package

release:
	npm run release

upload:
	npm run upload

clean:
	rm -rf dist/ out/ coverage/ docs/api/ *.vsix
