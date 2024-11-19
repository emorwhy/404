#!/usr/bin/env node

const http = require('http');
const crypto = require('node:crypto');
const { config } = require('dotenv');
const url = require('url');

config();

const activeLicences = new Map();
console.log('Current Licenses:', Array.from(activeLicences.keys()));

function corsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

async function handleRequest(req, res) {
  corsHeaders(res);
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;

  if (path === '/licenses' && req.method === 'GET') {
    return getLicenses(req, res);
  } else if (path === '/licenses' && req.method === 'POST') {
    return createLicense(req, res);
  } else if (path.startsWith('/licenses/') && req.method === 'DELETE') {
    const licenseKey = path.split('/')[2];
    return deleteLicense(req, res, licenseKey);
  } else if (path === '/validate' && req.method === 'GET') {
    return validateID(req, res);
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: "Invalid route" }));
  }
}

async function getLicenses(req, res) {
  const licenses = Array.from(activeLicences.entries()).map(([key, value]) => ({
    key,
    ...value,
  }));
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(licenses));
}

async function createLicense(req, res) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    const { host, expires } = JSON.parse(body);
    const assignedKey = crypto.randomUUID().substring(0, 6);
    const expireTime = expires || Date.now() + (3 * 24 * 60 * 60 * 1000);
    
    if (!host) {
      return throwError(res, "No host defined in request body");
    }

    activeLicences.set(assignedKey, { host, expires: expireTime });

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ key: assignedKey, host, expires: expireTime }));
  });
}

async function deleteLicense(req, res, licenseKey) {
  if (activeLicences.has(licenseKey)) {
    activeLicences.delete(licenseKey);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true }));
  } else {
    throwError(res, "License not found");
  }
}

async function validateID(req, res) {
  const params = new URL(req.url, "http://localhost/").searchParams;
  const license = params.get("license");
  const host = params.get("host");

  if (!activeLicences.has(license)) {
    res.statusCode = 403;
    res.end(JSON.stringify({ error: "Invalid License" }));
    return;
  }

  const licenseData = activeLicences.get(license);

  if (licenseData.expires < Date.now()) {
    activeLicences.delete(license);
    res.statusCode = 403;
    res.end(JSON.stringify({ error: "Expired License" }));
    return;
  }

  if (licenseData.host !== host) {
    res.statusCode = 403;
    res.end(JSON.stringify({ error: "License for incorrect product" }));
    return;
  }

  res.statusCode = 200;
  res.end(JSON.stringify({ status: "License valid" }));
}

function throwError(res, error) {
  res.statusCode = 500;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ error: error }));
}

async function cleanupLicenses() {
  for (const [license, data] of activeLicences.entries()) {
    if (data.expires < Date.now()) {
      activeLicences.delete(license);
    }
  }
}

const server = http.createServer(handleRequest);

const PORT = process.env.PORT || 8004;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}/`);
});

// Run cleanupLicenses once per day to prevent a memory leak
setInterval(cleanupLicenses, 24 * 60 * 60 * 1000);