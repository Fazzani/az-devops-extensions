export class TaskConfig {
  public constructor(pat: string, apiVersion = '6.0') {
    this.pat = pat;
    this.azDevopsApiVersion = apiVersion;
  }
  azDevopsApiVersion: string;
  pat: string;
}
