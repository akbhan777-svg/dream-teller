const { spawnSync } = require('child_process');
const fs = require('fs');

console.log('Running python generate_chat_export.py...');
const result = spawnSync('python', ['generate_chat_export.py'], {
  stdio: ['ignore', 'pipe', 'pipe']
});

let output = '';
if (result.stdout) output += result.stdout.toString();
if (result.stderr) output += result.stderr.toString();

fs.writeFileSync('export_log.txt', output || 'No output');
console.log(output);
