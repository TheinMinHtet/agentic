import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Helper to parse .env file directly to bypass system environment overrides
function parseEnvFile(dir) {
  const envPath = path.join(dir, '.env');
  if (!fs.existsSync(envPath)) return {};
  
  try {
    const content = fs.readFileSync(envPath, 'utf-8');
    const env = {};
    content.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const index = trimmed.indexOf('=');
      if (index !== -1) {
        const key = trimmed.substring(0, index).trim();
        let value = trimmed.substring(index + 1).trim();
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        env[key] = value;
      }
    });
    return env;
  } catch (e) {
    console.error('Failed to parse .env file:', e);
    return {};
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const envFileVars = parseEnvFile(process.cwd());
  const env = loadEnv(mode, process.cwd(), '');
  
  // Prioritize the .env file values over pre-defined system environment variables
  const apiKey = envFileVars.GOOGLE_API_KEY || envFileVars.VITE_GOOGLE_API_KEY || env.GOOGLE_API_KEY || env.VITE_GOOGLE_API_KEY || '';

  return {
    plugins: [react()],
    define: {
      'process.env.GOOGLE_API_KEY': JSON.stringify(apiKey),
    }
  };
})
