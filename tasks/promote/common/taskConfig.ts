export class TaskConfig {
  public constructor(pat: string, apiVersion = '5.0-preview.1') {
    this.pat = pat;
    this.azDevopsApiVersion = apiVersion;
  }
  azDevopsApiVersion: string;
  pat: string;
}
