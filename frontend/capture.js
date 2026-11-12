import { spawn, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const artifactDir = 'C:\\Users\\Sadan A\\.gemini\\antigravity\\brain\\6e0214d2-5a83-4e74-8cbc-898f1b34512a';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

console.log('Starting preview server...');
const previewProcess = spawn('npx', ['vite', 'preview', '--port', '4173', '--strictPort'], {
  cwd: path.resolve('frontend'),
  shell: true,
  stdio: 'pipe'
});

previewProcess.stdout.on('data', (d) => console.log(`[Vite] ${d}`));
previewProcess.stderr.on('data', (d) => console.error(`[Vite Error] ${d}`));

async function run() {
  // Wait 3 seconds for server to start
  await new Promise(r => setTimeout(r, 3000));

  const routes = [
    { url: 'http://localhost:4173/', file: 'landing_portal.png' },
    { url: 'http://localhost:4173/farmer/dashboard', file: 'farmer_dashboard.png' },
    { url: 'http://localhost:4173/farmer/disease-detection', file: 'farmer_disease_detection.png' },
    { url: 'http://localhost:4173/farmer/damage-assessment', file: 'farmer_damage_assessment.png' },
    { url: 'http://localhost:4173/officer/dashboard', file: 'officer_dashboard.png' },
    { url: 'http://localhost:4173/officer/claim-verification', file: 'officer_claim_verification.png' },
  ];

  for (const item of routes) {
    const outPath = path.join(artifactDir, item.file);
    console.log(`Capturing ${item.url} -> ${item.file}`);
    try {
      execSync(`"${edgePath}" --headless=new --disable-gpu --window-size=1400,900 --virtual-time-budget=3000 --screenshot="${outPath}" "${item.url}"`, {
        timeout: 15000,
      });
      console.log(`Saved: ${outPath} (${fs.statSync(outPath).size} bytes)`);
    } catch (err) {
      console.error(`Failed ${item.url}:`, err.message);
    }
  }

  // Terminate preview server
  previewProcess.kill();
  try {
    execSync('taskkill /F /IM node.exe /FI "WINDOWTITLE eq npx*"');
  } catch(e) {}
  console.log('Done!');
  process.exit(0);
}

run();

