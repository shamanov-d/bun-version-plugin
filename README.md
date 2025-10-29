# Bun Version Plugin

<p align="center">
<a href="https://www.npmjs.com/package/bun-version-plugin"><img src="https://img.shields.io/npm/v/bun-version-plugin.svg?style=flat-square" alt="NPM version"></a>
<a href="https://www.npmjs.com/package/bun-version-plugin"><img src="https://img.shields.io/npm/dt/bun-version-plugin.svg?style=flat-square" alt="NPM downloads"></a>
</p>

Плагин для автоматического увеличения версий в `package.json` с использованием системы версионирования год.квартал.спринт во время сборки с Bun.

[Github Repo](https://github.com/shamanov-d/bun-version-plugin)

## Setup

```bash
bun add @shamanov-d/bun-version-plugin
```

## Use

```typescript
import { VersionPlugin } from "@shamanov-d/bun-version-plugin";

Bun.build({
  entrypoints: ["src/index.ts"],
  outdir: "dist",
  plugins: [
    VersionPlugin(),
  ],
});
```