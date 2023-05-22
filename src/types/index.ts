export interface Options {
  preid?: string;
  commit?: string;
  quiet?: boolean;
}

export type CmdType = "npm" | "yarn" | "pnpm";
