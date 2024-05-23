import { colors } from "https://deno.land/x/cliffy@v1.0.0-rc.4/ansi/mod.ts";
import { octokit } from "./main.ts";

export class Label {
  name: string;
  description?: string;
  public color?: string;

  constructor(name: string, description?: string, color?: string) {
    this.name = name;
    this.description = description;
    this.color = color;
  }

  async create(owner: string, repo: string) {
    await octokit.rest.issues.createLabel({
      name: this.name,
      owner,
      repo,
      color: this.color?.replace("#", ""),
      description: this.description,
    });
  }

  ansi() {
    return colors.bgRgb24(this.name, parseInt("0x" + this.color));
  }

  async delete(owner: string, repo: string) {
    await octokit.rest.issues.deleteLabel({ owner, repo, name: this.name });
  }
}
