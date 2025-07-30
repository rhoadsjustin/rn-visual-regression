import { spawn } from 'child_process';
import path from 'path';

const run = (command, args, options = {}) => {
  const proc = spawn(command, args, { stdio: 'inherit', shell: true, ...options });
  proc.on('error', (err) => console.error(`${command} error:`, err));
};

// Run backend API
run('node', ['server.js']);

// Run the CLI test watcher
run('node', ['watchAndRun.js']);

// Run Vite dev server for viewer
run('npm', ['run', 'dev'], { cwd: path.join(process.cwd(), 'viewer') });
