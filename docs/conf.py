"""Sphinx configuration for the ts-chef documentation."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PACKAGE = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))

project = "ts-chef"
author = "Michael Weiss and ts-chef contributors"
copyright = "2024–2026, Michael Weiss and ts-chef contributors"
release = PACKAGE["version"]
version = ".".join(release.split(".")[:2])

extensions = [
    "myst_parser",
    "sphinx.ext.extlinks",
    "sphinx.ext.intersphinx",
    "sphinx.ext.todo",
    "sphinx_copybutton",
    "sphinx_design",
]

source_suffix = {".md": "markdown", ".rst": "restructuredtext"}
master_doc = "index"
exclude_patterns = ["README.md", "api", "_build", "Thumbs.db", ".DS_Store"]
templates_path = ["_templates"]
language = "en"

myst_enable_extensions = [
    "attrs_block",
    "colon_fence",
    "deflist",
    "fieldlist",
    "linkify",
    "substitution",
    "tasklist",
]
myst_heading_anchors = 4
myst_url_schemes = ("http", "https", "mailto")

html_theme = "sphinx_rtd_theme"
html_logo = "_static/logo.jpg"
html_favicon = "_static/icon.svg"
html_static_path = ["_static"]
html_css_files = ["custom.css"]
html_title = f"ts-chef {release} documentation"
html_baseurl = "https://ts-chef.readthedocs.io/en/latest/"
html_theme_options = {
    "logo_only": True,
    "prev_next_buttons_location": "bottom",
    "style_external_links": True,
    "style_nav_header_background": "#111827",
    "collapse_navigation": False,
    "sticky_navigation": True,
    "navigation_depth": 4,
    "includehidden": True,
    "titles_only": False,
}
html_context = {
    "display_github": True,
    "github_user": "MichaelWeissDEV",
    "github_repo": "ts-chef",
    "github_version": "master",
    "conf_py_path": "/docs/",
}

extlinks = {
    "issue": ("https://github.com/MichaelWeissDEV/ts-chef/issues/%s", "issue #%s"),
    "source": ("https://github.com/MichaelWeissDEV/ts-chef/blob/master/%s", "%s"),
}
intersphinx_mapping = {
    "python": ("https://docs.python.org/3", None),
    "sphinx": ("https://www.sphinx-doc.org/en/master", None),
}
todo_include_todos = False

linkcheck_ignore = [
    r"https://marketplace\.visualstudio\.com/.*",
    # GitHub rate-limits Sphinx's parallel HEAD requests. These links are
    # deterministic repository paths and are reviewed by the catalog generator.
    r"https://github\.com/MichaelWeissDEV/ts-chef.*",
]
linkcheck_anchors_ignore_for_url = [r"https://github\.com/.*"]
linkcheck_timeout = 20
linkcheck_retries = 2

latex_documents = [(master_doc, "ts-chef.tex", "ts-chef Documentation", author, "manual")]
epub_title = project
epub_author = author
