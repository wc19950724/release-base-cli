export interface Options {
  preid?: string;
  commit?: string;
  quiet?: boolean;
  test?: boolean;
}

export type CmdType = "npm" | "yarn" | "pnpm";
