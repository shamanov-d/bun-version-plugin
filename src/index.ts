import type { BunPlugin } from "bun";
import { Version } from "./version";

interface VersionPluginOptions {
  generator?: (old: string) => string;
  inputFile?: string;
  outFile?: string;
}

export const VersionPlugin = ({
  generator = (old) => new Version(old).next().toString(),
  inputFile = "./package.json",
  outFile = "./package.json",
}: VersionPluginOptions = {}) =>
  ({
    name: "versionPlugin",
    async setup(): Promise<void> {
      const file = (await Bun.file(inputFile).json()) as { version: string };
      const newVersion = generator(file.version);
      console.log(`🚀 Bumping version: ${file.version} -> ${newVersion}`);
      file.version = newVersion;
      await Bun.write(outFile, JSON.stringify(file, null, 2));
    },
  }) as BunPlugin;
