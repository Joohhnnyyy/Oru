#!/usr/bin/env python3
"""
Page Cloner Local Dev Server with Auto-Fallback & Asset Caching
Serves cloned static assets with CORS enabled and automatically fetches
and caches any missing dynamic assets from the original origin.
"""

import os
import sys
import urllib.request
import urllib.parse
from http.server import HTTPServer, SimpleHTTPRequestHandler

ORIGINAL_ORIGIN = "https://www.butter.video"
PORT = 8080

MIME_TYPES = {
    ".wasm": "application/wasm",
    ".ktx2": "image/ktx2",
    ".drc": "application/octet-stream",
    ".glb": "model/gltf-binary",
    ".gltf": "model/gltf+json",
    ".bin": "application/octet-stream",
    ".json": "application/json",
    ".splinecode": "application/octet-stream",
    ".spline": "application/octet-stream",
    ".hdr": "image/vnd.radiance",
    ".exr": "image/x-exr",
    ".usdz": "model/vnd.usdz+zip",
    ".woff2": "font/woff2",
    ".woff": "font/woff",
    ".ttf": "font/ttf",
    ".otf": "font/otf",
    ".js": "application/javascript",
    ".mjs": "application/javascript",
    ".css": "text/css",
    ".svg": "image/svg+xml",
}

class ClonerHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS for local development, WebGL textures & Web Workers
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, HEAD")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.send_header("Cross-Origin-Opener-Policy", "same-origin-allow-popups")
        self.send_header("Cross-Origin-Embedder-Policy", "unsafe-none")
        super().end_headers()

    def guess_type(self, path):
        ext = os.path.splitext(path)[1].lower()
        if ext in MIME_TYPES:
            return MIME_TYPES[ext]
        return super().guess_type(path)

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        # Clean path
        parsed = urllib.parse.urlparse(self.path)
        clean_path = parsed.path.lstrip("/")
        if not clean_path:
            clean_path = "index.html"

        local_file = os.path.join(os.getcwd(), clean_path)

        # If file does not exist locally and original origin is available, fetch & cache it
        if not os.path.exists(local_file) and ORIGINAL_ORIGIN and ORIGINAL_ORIGIN.startswith("http"):
            remote_url = urllib.parse.urljoin(ORIGINAL_ORIGIN, parsed.path)
            if parsed.query:
                remote_url += "?" + parsed.query
            print(f"[404 -> Proxying & Caching]: {clean_path} from {remote_url}")
            try:
                req = urllib.request.Request(
                    remote_url,
                    headers={
                        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                        "Accept": "*/*",
                    }
                )
                with urllib.request.urlopen(req, timeout=12) as response:
                    data = response.read()
                    os.makedirs(os.path.dirname(local_file), exist_ok=True)
                    with open(local_file, "wb") as f:
                        f.write(data)
                    print(f"[Cached Successfully]: {clean_path} ({len(data)} bytes)")
            except Exception as e:
                print(f"[Proxy Failed]: {remote_url} ({e})")

        return super().do_GET()

def run(port=PORT):
    server_address = ("", port)
    httpd = HTTPServer(server_address, ClonerHandler)
    print("=" * 60)
    print(f"🚀 Cloned Site Server running at: http://localhost:{port}/")
    print(f"🔗 Original Origin Fallback: {ORIGINAL_ORIGIN}")
    print("📁 Missing assets will be automatically proxied and cached to ./assets/")
    print("=" * 60)
    print("Press Ctrl+C to stop.")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
        httpd.server_close()

if __name__ == "__main__":
    port = PORT
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass
    run(port)
