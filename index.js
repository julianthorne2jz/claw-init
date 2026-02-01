#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const args = process.argv.slice(2);

// Parse flags
function parseFlags(args) {
    const flags = {};
    const positional = [];
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg.startsWith('--')) {
            const key = arg.slice(2);
            flags[key] = args[++i] || '';
        } else if (arg.startsWith('-')) {
            const key = arg.slice(1);
            flags[key] = args[++i] || '';
        } else {
            positional.push(arg);
        }
    }
    return { flags, positional };
}

const { flags, positional } = parseFlags(args);

const templates = {
    skill: {
        files: {
            'SKILL.md': `---
name: {{name}}
description: {{description}}
---

# {{name}}

{{description}}

## Usage

\`\`\`bash
# Example usage
\`\`\`
`,
            'index.js': `#!/usr/bin/env node
// {{name}} - {{description}}

const args = process.argv.slice(2);
const command = args[0];

if (command === 'help' || !command) {
    console.log(\`{{name}} - {{description}}

Usage:
  node index.js <command>

Commands:
  help    Show this help
\`);
} else {
    console.log('Unknown command:', command);
}
`,
            'package.json': `{
  "name": "{{name}}",
  "version": "1.0.0",
  "description": "{{description}}",
  "main": "index.js",
  "bin": {
    "{{name}}": "./index.js"
  },
  "keywords": [],
  "author": "{{author}}",
  "license": "MIT"
}
`,
            'README.md': `# {{name}}

{{description}}

## Install

\`\`\`bash
git clone https://github.com/{{github}}/{{name}}.git
cd {{name}}
\`\`\`

## Usage

\`\`\`bash
node index.js help
\`\`\`

## License

MIT
`
        }
    },
    cli: {
        files: {
            'index.js': `#!/usr/bin/env node
// {{name}} - {{description}}

const args = process.argv.slice(2);
const command = args[0];

function main() {
    switch(command) {
        case 'help':
        case undefined:
            console.log(\`{{name}} - {{description}}

Usage:
  {{name}} <command> [options]

Commands:
  help    Show this help
\`);
            break;
        default:
            console.error('Unknown command:', command);
            process.exit(1);
    }
}

main();
`,
            'package.json': `{
  "name": "{{name}}",
  "version": "1.0.0",
  "description": "{{description}}",
  "main": "index.js",
  "bin": {
    "{{name}}": "./index.js"
  },
  "author": "{{author}}",
  "license": "MIT"
}
`,
            'README.md': `# {{name}}

{{description}}

## Install

\`\`\`bash
npm install -g {{name}}
\`\`\`

## Usage

\`\`\`bash
{{name}} help
\`\`\`

## License

MIT
`
        }
    },
    static: {
        files: {
            'build.js': `#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = './public';

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const html = \`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{{name}}</title>
</head>
<body>
    <h1>{{name}}</h1>
    <p>{{description}}</p>
</body>
</html>\`;

fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), html);
console.log('Built -> public/index.html');
`,
            'package.json': `{
  "name": "{{name}}",
  "version": "1.0.0",
  "description": "{{description}}",
  "scripts": {
    "build": "node build.js"
  },
  "author": "{{author}}",
  "license": "MIT"
}
`,
            'README.md': `# {{name}}

{{description}}

## Build

\`\`\`bash
npm run build
\`\`\`

## License

MIT
`
        }
    }
};

function applyTemplate(content, vars) {
    return content.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || '');
}

async function prompt(question) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans); }));
}

async function init(type, name) {
    const template = templates[type];
    if (!template) {
        console.error(`Unknown template: ${type}`);
        console.log('Available: skill, cli, static');
        process.exit(1);
    }

    const dir = path.join(process.cwd(), name);
    if (fs.existsSync(dir)) {
        console.error(`Directory already exists: ${name}`);
        process.exit(1);
    }

    // Use flags if provided, otherwise prompt interactively
    const vars = {
        name,
        description: flags.description || flags.d || (process.stdin.isTTY ? await prompt('Description: ') : 'A new project'),
        author: flags.author || flags.a || (process.stdin.isTTY ? await prompt('Author: ') : 'Unknown'),
        github: flags.github || flags.g || (process.stdin.isTTY ? await prompt('GitHub username: ') : 'username')
    };

    fs.mkdirSync(dir, { recursive: true });

    for (const [file, content] of Object.entries(template.files)) {
        const filePath = path.join(dir, file);
        fs.writeFileSync(filePath, applyTemplate(content, vars));
        console.log(`  Created: ${file}`);
    }

    console.log(`\n✅ Created ${type} project: ${name}/`);
    console.log(`   cd ${name} && npm install`);
}

if (positional[0] === 'help' || !positional[0]) {
    console.log(`claw-init - Project scaffolder

Usage:
  claw-init <template> <name> [options]

Templates:
  skill    OpenClaw skill with SKILL.md
  cli      Node.js CLI tool
  static   Static site generator

Options:
  -d, --description <text>   Project description
  -a, --author <name>        Author name
  -g, --github <username>    GitHub username

Example:
  claw-init skill my-skill
  claw-init cli my-tool -d "A CLI tool" -a "Julian" -g "julianthorne2jz"
`);
} else {
    const [type, name] = positional;
    if (!name) {
        console.error('Usage: claw-init <template> <name>');
        process.exit(1);
    }
    init(type, name);
}
