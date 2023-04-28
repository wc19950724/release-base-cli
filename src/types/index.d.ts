export interface ProgramOptions {
  config: string;
  preId: string;
  test: boolean;
  version: boolean;
}

export interface StandardChangelogConfig {
  outfile: string;
  params: unknown[];
}
