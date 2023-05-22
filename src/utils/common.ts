import { Options } from "@/types";

export const optionsDefault: Required<Options> = {
  preid: "beta",
  commit: "release: v",
  quiet: true,
};

const options = optionsDefault;

/** 设置配置选项 */
export const setOptions = async (params?: Options) => {
  Object.assign(options, params);
};

/** 获取配置选项 */
export const getOptions = () => options;
