#!/usr/bin/env python3
"""Serve local drafts with an EDS-like HTML shell.

Why:
- `aem up --url ...` proxies responses as-is.
- `.plain.html` files are section fragments and need head/scripts/styles wrapping.
"""
import mimetypes
import os
import posixpath
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import unquote, urlparse

DRAFTS_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_DIR = os.path.dirname(DRAFTS_DIR)
HEAD_HTML_PATH = os.path.join(REPO_DIR, "head.html")


def _safe_repo_path(path: str) -> str | None:
    """Map URL path to a file under repo dir, or None if unsafe/missing."""
    rel = posixpath.normpath(unquote(path).lstrip("/"))
    full = os.path.normpath(os.path.join(REPO_DIR, rel))
    if not full.startswith(REPO_DIR):
        return None
    if os.path.isfile(full):
        return full
    return None


def _resolve_draft_plain(url_path: str) -> str | None:
    """Resolve /foo to drafts/foo.plain.html (or explicit html file)."""
    rel = url_path.lstrip("/")
    candidates = [f"{rel}.plain.html", rel]
    for c in candidates:
        full = os.path.normpath(os.path.join(DRAFTS_DIR, c))
        if full.startswith(DRAFTS_DIR) and os.path.isfile(full):
            return full
    return None


def _wrap_with_eds_shell(fragment_html: str) -> bytes:
    with open(HEAD_HTML_PATH, "r", encoding="utf-8") as f:
        head = f.read()
    doc = (
        "<!DOCTYPE html>\n"
        "<html>\n"
        "<head>\n"
        f"{head}\n"
        "</head>\n"
        "<body>\n"
        "<header></header>\n"
        "<main>\n"
        f"{fragment_html}\n"
        "</main>\n"
        "<footer></footer>\n"
        "</body>\n"
        "</html>\n"
    )
    return doc.encode("utf-8")


class DraftsHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        url_path = parsed.path

        # Serve repo assets directly (/styles, /scripts, /blocks, /icons, ...)
        static_file = _safe_repo_path(url_path)
        if static_file:
            with open(static_file, "rb") as f:
                data = f.read()
            ctype = mimetypes.guess_type(static_file)[0] or "application/octet-stream"
            self.send_response(200)
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return

        # Serve draft fragments as full EDS-like documents
        draft_file = _resolve_draft_plain(url_path if url_path != "/" else "/index")
        if draft_file:
            with open(draft_file, "r", encoding="utf-8") as f:
                fragment = f.read()
            data = _wrap_with_eds_shell(fragment)
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return

        self.send_error(404, "File not found")

    def log_message(self, fmt, *args):
        print(f"  {self.address_string()} - {fmt % args}")


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8888
    print(f"Serving repo assets from {REPO_DIR}")
    print(f"Serving drafts fragments from {DRAFTS_DIR}")
    print(f"Open: http://127.0.0.1:{port}/index")
    HTTPServer(("127.0.0.1", port), DraftsHandler).serve_forever()
