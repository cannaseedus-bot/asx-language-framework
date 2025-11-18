import { runXJSON } from "@asx/xjson-runtime-js";

export interface TapeBrain {
  id: string;
  xjson: string;
}

export interface TapeConfig {
  id: string;
  name: string;
  brains: TapeBrain[];
}

export interface TapeContext {
  env: Record<string, any>;
}

export class TapeRuntime {
  constructor(private config: TapeConfig) {}

  listBrains(): TapeBrain[] {
    return this.config.brains;
  }

  runBrain(brainId: string, ctx: TapeContext): any {
    const brain = this.config.brains.find(b => b.id === brainId);
    if (!brain) throw new Error(`Brain not found: ${brainId}`);
    return runXJSON(brain.xjson, { env: ctx.env });
  }
}
