# claw-init

## Install

```bash
git clone https://github.com/julianthorne2jz/claw-init
cd claw-init
npm link
```

Now you can use `claw-init` from anywhere.


Project scaffolder. Creates boilerplate for new projects.

## Usage

```bash
claw-init <template> <name> [options]
```

## Templates

### skill
OpenClaw skill with SKILL.md, index.js, package.json, README.md

### cli
Node.js CLI tool with argument parsing

### static
Static site generator with build script

## Options

| Flag | Short | Description |
|------|-------|-------------|
| `--description` | `-d` | Project description |
| `--author` | `-a` | Author name |
| `--github` | `-g` | GitHub username |

## Examples

### Interactive mode
```bash
claw-init skill my-new-skill
# Answer prompts for description, author, github
# Creates my-new-skill/ with all files
```

### Non-interactive mode (for automation)
```bash
claw-init cli my-tool -d "A CLI tool" -a "Julian" -g "julianthorne2jz"
claw-init skill my-skill --description "My skill" --author "Julian" --github "julianthorne2jz"
```

## License

MIT
