/**
 * Starts mock-api/server.js, waits for /health, runs the given shell command, then stops the server.
 * Cross-platform (avoids start-server-and-test + wmic issues on Windows 11).
 */
'use strict';

const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PORT = Number(process.env.MOCK_PORT) || 34567;
const HEALTH_URL = `http://127.0.0.1:${PORT}/health`;

function waitForHealth(timeoutMs = 60000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const poll = () => {
      const req = http.get(HEALTH_URL, (res) => {
        res.resume();
        if (res.statusCode === 200) {
          resolve();
          return;
        }
        retry();
      });
      req.on('error', retry);
      function retry() {
        if (Date.now() - start > timeoutMs) {
          reject(new Error(`Mock API did not become ready at ${HEALTH_URL}`));
          return;
        }
        setTimeout(poll, 250);
      }
    };
    poll();
  });
}

const command = process.argv.slice(2).join(' ');
if (!command.trim()) {
  console.error('Usage: node scripts/run-with-mock.js <command>');
  process.exit(1);
}

const mock = spawn(process.execPath, [path.join(ROOT, 'mock-api', 'server.js')], {
  cwd: ROOT,
  stdio: 'inherit',
  env: { ...process.env, PORT: String(PORT) },
});

let mockReady = false;

mock.on('error', (err) => {
  console.error(err);
  process.exit(1);
});

mock.on('exit', (code, signal) => {
  if (!mockReady) {
    console.error(`Mock API exited before becoming ready (code=${code}, signal=${signal}). Is port ${PORT} in use?`);
    process.exit(1);
  }
});

function stopMockAndExit(code) {
  if (mock.pid && !mock.killed) {
    mock.kill('SIGTERM');
  }
  process.exit(code);
}

waitForHealth()
  .then(() => {
    mockReady = true;
    const test = spawn(command, {
      cwd: ROOT,
      stdio: 'inherit',
      shell: true,
      env: process.env,
    });
    test.on('exit', (code, signal) => {
      stopMockAndExit(code ?? (signal ? 1 : 0));
    });
    test.on('error', (err) => {
      console.error(err);
      stopMockAndExit(1);
    });
  })
  .catch((err) => {
    console.error(err);
    stopMockAndExit(1);
  });
