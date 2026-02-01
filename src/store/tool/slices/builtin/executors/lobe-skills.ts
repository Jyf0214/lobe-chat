/**
 * Lobe Skills Executor
 *
 * Creates and exports the SkillsExecutor instance for registration.
 * Injects agentSkillService as dependency.
 */
import { builtinSkills } from '@lobechat/builtin-skills';
import { SkillsExecutionRuntime } from '@lobechat/builtin-tool-skills/executionRuntime';
import { SkillsExecutor } from '@lobechat/builtin-tool-skills/executor';
import { isDesktop } from '@lobechat/const';

import { localFileService } from '@/services/electron/localFileService';
import { agentSkillService } from '@/services/skill';

// Create runtime with client-side service
const runtime = new SkillsExecutionRuntime({
  builtinSkills,
  service: {
    findAll: () => agentSkillService.list(),
    findById: (id) => agentSkillService.getById(id),
    findByName: (name) => agentSkillService.getByName(name),
    importFromGitHub: async (gitUrl) => {
      const result = await agentSkillService.importFromGitHub({ gitUrl });
      if (!result) throw new Error('Import failed');
      return { skill: { id: result.skill.id, name: result.skill.name }, status: result.status };
    },
    importFromUrl: async (url) => {
      const result = await agentSkillService.importFromUrl({ url });
      if (!result) throw new Error('Import failed');
      return { skill: { id: result.skill.id, name: result.skill.name }, status: result.status };
    },
    importFromZipUrl: async (url) => {
      const result = await agentSkillService.importFromUrl({ url });
      if (!result) throw new Error('Import failed');
      return { skill: { id: result.skill.id, name: result.skill.name }, status: result.status };
    },
    onSkillImported: async () => {
      // Dynamic import to avoid circular dependency (this file is inside the tool store)
      const { getToolStoreState } = await import('@/store/tool/store');
      await getToolStoreState().refreshAgentSkills();
    },
    readResource: (id, path) => agentSkillService.readResource(id, path),
    runCommand: async ({ command, timeout }) => {
      // 暂时将 runInClient 注释掉
      // if (isDesktop && runInClient) {
      if (isDesktop) {
        const result = await localFileService.runCommand({ command, timeout });
        return {
          exitCode: result.exit_code ?? 1,
          output: result.stdout || result.output || '',
          stderr: result.stderr,
          success: result.success,
        };
      }

      // TODO: Cloud sandbox execution
      throw new Error('Cloud sandbox execution is not yet implemented for skills');
    },
  },
});

// Create executor instance with the runtime
export const skillsExecutor = new SkillsExecutor(runtime);
