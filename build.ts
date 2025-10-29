import { CopyPackagePlugin } from "bun-filter-package-plugin";
import { VersionPlugin } from "./src/index.ts";

CopyPackagePlugin({
  excludeFields: ["devDependencies", "scripts", "publishConfig"],
  outFile: `./dist/package.json`,
}).setup({} as any);
VersionPlugin().setup({} as any);
