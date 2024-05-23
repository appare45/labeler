import { Octokit } from "https://esm.sh/octokit@4.0.2?dts";
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";
import { Confirm } from "https://deno.land/x/cliffy@v1.0.0-rc.4/prompt/confirm.ts";
import { Label } from "./Label.ts";
import { parse } from "jsr:@std/yaml";
import Spinner from "https://deno.land/x/cli_spinners@v0.0.2/mod.ts";

const spinner = Spinner.getInstance();
const fileName = Deno.args[1];

if (typeof fileName !== "string") {
  throw new Error("File name is required");
}

const data = parse(await Deno.readTextFile(fileName)) as {
  labels: {
    name: string;
    description?: string;
    color?: string;
  }[];
};

const labelsToCreate = data.labels.map(
  (label) => new Label(label.name, label.description, label.color)
);

const env = await load();
const TOKEN = Deno.env.get("GITHUB_TOKEN") || env["GITHUB_TOKEN"];

if (TOKEN === undefined) {
  throw new Error("GITHUB_TOKEN is not set");
}

export const octokit = new Octokit({ auth: TOKEN });

const {
  data: { login },
} = await octokit.rest.users.getAuthenticated();

console.log(`GitHub> Hello, ${login}!`);

const repoName = Deno.args[0];

if (typeof repoName !== "string") {
  throw new Error("Repository name is required");
}

if (repoName.split("/").length !== 2) {
  throw new Error("Invalid repository name");
}

const owner = repoName.split("/")[0];
const repo = repoName.split("/")[1];

const repos = (await octokit.rest.repos.get({ owner, repo })).data;

console.log(`Repository: ${repos.full_name}`);

const exist_labels = (
  await octokit.rest.issues.listLabelsForRepo({ repo, owner })
).data.map(
  (label) => new Label(label.name, label.description ?? undefined, label.color)
);

console.log(
  `Existing labels: ${exist_labels.map((label) => label.ansi()).join(", ")}`
);

if (await Confirm.prompt("Are you sure to remove all existing labels?")) {
  spinner.start("Removing existing labels...");
  for (const label of exist_labels) {
    spinner.setText(`Removing ${label.name}...`);
    await label.delete(owner, repo);
  }
  await spinner.succeed("Existing labels removed");
}

spinner.start("Creating new labels...");
for (const label of labelsToCreate) {
  spinner.setText(`Creating ${label.name}...`);
  await label.create(owner, repo);
}
spinner.succeed("New labels created");

Deno.exit();
