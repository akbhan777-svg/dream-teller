const { spawnSync } = require('child_process');
const fs = require('fs');

const result = spawnSync('npx.cmd', ['tsc', '--noEmit'], {
  stdio: ['ignore', 'pipe', 'pipe']
});

let output = '';
if (result.stdout) output += result.stdout.toString();
if (result.stderr) output += result.stderr.toString();

fs.writeFileSync('tsc_output.txt', output || 'No output');
console.log('Done');
