const fs = require('fs');
const path = require('path');

const configDir = path.join(__dirname, '..', 'js');
const configPath = path.join(configDir, 'config.js');

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// Safely preserve local config.js if no environment variables are set
if (!supabaseUrl && !supabaseAnonKey) {
    if (fs.existsSync(configPath)) {
        console.log('No Supabase environment variables detected, and js/config.js already exists. Skipping config generation to protect local credentials.');
        process.exit(0);
    }
}

const content = `// Generated at build time from environment variables
window.CONFIG = {
    SUPABASE_URL: ${JSON.stringify(supabaseUrl)},
    SUPABASE_ANON_KEY: ${JSON.stringify(supabaseAnonKey)}
};
`;

try {
    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
    }
    fs.writeFileSync(configPath, content, 'utf8');
    console.log('Successfully generated js/config.js from environment variables.');
} catch (err) {
    console.error('Failed to generate js/config.js:', err);
    process.exit(1);
}
