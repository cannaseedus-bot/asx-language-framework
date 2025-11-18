export interface RuntimeEnv {
  [key: string]: any;
}

export interface RuntimeHooks {
  renderBlock?: (block: any) => void;
  log?: (message: string, data?: any) => void;
}

export interface RuntimeContext {
  env: RuntimeEnv;
  hooks: RuntimeHooks;
}
