"use strict";

const http = require("node:http");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");

// 默认只监听本机；设置 PROMPT_STUDIO_HOST=0.0.0.0 可让同一 Wi-Fi 下的手机/平板访问
const host = process.env.PROMPT_STUDIO_HOST || "127.0.0.1";
const port = Number(process.env.PROMPT_STUDIO_PORT || 4317);
const lanMode = host === "0.0.0.0" || host === "::";
const root = __dirname;
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon"
};

function send(response, status, body, contentType = "text/plain; charset=utf-8") {
  response.writeHead(status, {
    "Content-Type": contentType,
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  response.end(body);
}

const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, `http://${host}:${port}`).pathname);
  const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const filePath = path.resolve(root, relative);

  if (!filePath.startsWith(`${root}${path.sep}`) && filePath !== path.join(root, "index.html")) {
    send(response, 403, "Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      send(response, error.code === "ENOENT" ? 404 : 500, error.code === "ENOENT" ? "Not found" : "Server error");
      return;
    }
    const contentType = mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream";
    send(response, 200, data, contentType);
  });
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    const url = lanMode ? `http://127.0.0.1:${port}/` : `http://${host}:${port}/`;
    console.log(`Prompt Studio is already running at ${url}`);
    if (process.argv.includes("--open")) {
      spawn("cmd.exe", ["/c", "start", "", url], {
        detached: true,
        stdio: "ignore",
        windowsHide: true
      }).unref();
      process.exitCode = 0;
      return;
    }
    process.exitCode = 1;
  } else {
    console.error(error);
    process.exitCode = 1;
  }
});

function lanUrls() {
  const urls = [];
  for (const list of Object.values(os.networkInterfaces())) {
    for (const item of list || []) {
      if (item.family === "IPv4" && !item.internal) urls.push(`http://${item.address}:${port}/`);
    }
  }
  return urls;
}

function openBrowser(url) {
  if (!process.argv.includes("--open")) return;
  spawn("cmd.exe", ["/c", "start", "", url], {
    detached: true,
    stdio: "ignore",
    windowsHide: true
  }).unref();
}

server.listen(port, host, () => {
  if (lanMode) {
    console.log("Prompt Studio 已开启局域网访问（同一 Wi-Fi 下的设备可用）：");
    const urls = lanUrls();
    if (urls.length) {
      for (const url of urls) console.log(`  ${url}`);
    } else {
      console.log(`  http://<本机IP>:${port}/`);
    }
    console.log("首次访问如果打不开，请在 Windows 防火墙提示里允许 Node.js。");
    openBrowser(`http://127.0.0.1:${port}/`);
    return;
  }
  const url = `http://${host}:${port}/`;
  console.log(`Prompt Studio running at ${url}`);
  openBrowser(url);
});
