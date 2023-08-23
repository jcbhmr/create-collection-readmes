#!/usr/bin/env -S deno run -A
import process from "node:process";
import { readFile, writeFile, readdir } from "node:fs/promises";
import * as core from "@actions/core";

const optionsTable = (options: Record<string, object>) =>
  `## Options

| Options Id | Description | Type | Default Value |
| ---------- | ----------- | ---- | ------------- |
${Object.entries(options)
  .map(
    ([id, { description, type, default: defaultValue }]) =>
      `| ${id} ` +
      `| ${description || "-"} ` +
      `| ${type || "-"} ` +
      `| ${defaultValue || "-"} |`
  )
  .join("\n")}`;

const featureReadme = (
  { name, description, id, version, options, customizations },
  { collection, notes }
) => `# ${name}

${description}

## Example Usage

~~~json
"features": {
    "${collection}/${id}:${version}": {}
}
~~~

${optionsTable(options)}
${customizations ? createCustomizationsSection(customizations) : ""}
${notes}

---

_Note: This file was auto-generated from the \`devcontainer-feature.json\`.  Add additional notes to a \`NOTES.md\`._
`;

const templateReadme = ({ name, description, options }, { notes }) => `
# ${name}

${description}

${optionsTable(options)}

${notes}

---

_Note: This file was auto-generated from the \`devcontainer-feature.json\`.  Add additional notes to a \`NOTES.md\`._
`;

async function generateReadme(folder: string, collection: string) {
  let md = await readFile(new URL("README.md", folder), "utf8");
  const feature = JSON.parse(
    await readFile(new URL("devcontainer-feature.json", folder), "utf8")
  );
  const notes = await readFile(new URL("NOTES.md", folder), "utf8");

  md = featureReadme(feature, { collection, notes });
}

const path = core.getInput("path");
process.chdir(path);

for (const id of readdir(".")) {
  const folder = pathToFileURL(process.cwd());
  folder.pathname += "/";
  const collection = `ghcr.io/${process.env.GITHUB_REPOSITORY}`;

  await generateReadme(folder, collection);
}
