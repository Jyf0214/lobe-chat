import { builtinSkills } from '@lobechat/builtin-skills';
import { type BuiltinSkill, type LobeBuiltinTool } from '@lobechat/types';

import { builtinTools } from '@/tools';

export interface BuiltinToolState {
  builtinSkills: BuiltinSkill[];
  builtinToolLoading: Record<string, boolean>;
  builtinTools: LobeBuiltinTool[];
}

export const initialBuiltinToolState: BuiltinToolState = {
  builtinSkills,
  builtinToolLoading: {},
  builtinTools,
};
