import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { expect, it } from 'vitest';
import { writeEnvFiles } from '../export-env';

it('exports only public frontend settings without replacing custom settings or backend files', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'oru-env-'));
  try {
    mkdirSync(path.join(root, 'frontend'));
    const output = path.join(root, 'frontend/.env.local');
    writeFileSync(output, 'VITE_SITE_URL=https://oru.example.test\nVITE_API_URL=https://old.example.test\n');
    writeEnvFiles({ VITE_API_URL: 'https://api.example.test', VITE_COGNITO_REGION: 'ap-south-1', AWS_SECRET_ACCESS_KEY: 'must-not-reach-browser' }, root, true);
    const content = readFileSync(output, 'utf8');
    expect(content).toContain('VITE_SITE_URL=https://oru.example.test');
    expect(content).toContain('VITE_API_URL=https://api.example.test');
    expect(content).not.toContain('old.example.test');
    expect(content).not.toContain('must-not-reach-browser');
    expect(existsSync(path.join(root, '.env'))).toBe(false);
    expect(existsSync(path.join(root, 'services'))).toBe(false);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
