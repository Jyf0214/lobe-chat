import { resourcesTreePrompt } from '@lobechat/prompts';
import {
  type BuiltinServerRuntimeOutput,
  type BuiltinSkill,
  type SkillItem,
  type SkillListItem,
  type SkillResourceContent,
} from '@lobechat/types';

import {
  type CommandResult,
  type ExecScriptParams,
  type ImportSkillParams,
  type ReadReferenceParams,
  type RunCommandOptions,
  type RunSkillParams,
} from '../types';

/**
 * Unified skill service interface for dependency injection.
 * On client side, this is implemented by AgentSkillService.
 * On server side, this is composed from AgentSkillModel + SkillResourceService.
 */
export interface SkillImportServiceResult {
  skill: { id: string; name: string };
  status: 'created' | 'updated' | 'unchanged';
}

export interface SkillRuntimeService {
  findAll(): Promise<{ data: SkillListItem[]; total: number }>;
  findById(id: string): Promise<SkillItem | undefined>;
  findByName(name: string): Promise<SkillItem | undefined>;
  importFromGitHub(gitUrl: string): Promise<SkillImportServiceResult>;
  importFromUrl(url: string): Promise<SkillImportServiceResult>;
  importFromZipUrl(url: string): Promise<SkillImportServiceResult>;
  onSkillImported?(): Promise<void>;
  readResource(id: string, path: string): Promise<SkillResourceContent>;
  runCommand?(options: RunCommandOptions): Promise<CommandResult>;
}

export interface SkillsExecutionRuntimeOptions {
  builtinSkills?: BuiltinSkill[];
  service: SkillRuntimeService;
}

export class SkillsExecutionRuntime {
  private builtinSkills: BuiltinSkill[];
  private service: SkillRuntimeService;

  constructor(options: SkillsExecutionRuntimeOptions) {
    this.service = options.service;
    this.builtinSkills = options.builtinSkills || [];
  }

  async importSkill(args: ImportSkillParams): Promise<BuiltinServerRuntimeOutput> {
    const { url, type } = args;

    // Determine import method based on URL and type
    const isGitHub = url.includes('github.com');

    try {
      let result: SkillImportServiceResult;

      if (isGitHub && type === 'url') {
        result = await this.service.importFromGitHub(url);
      } else if (type === 'zip') {
        result = await this.service.importFromZipUrl(url);
      } else {
        result = await this.service.importFromUrl(url);
      }

      // Refresh skills list so the new skill becomes available
      await this.service.onSkillImported?.();

      return {
        content: `Skill "${result.skill.name}" ${result.status} successfully.`,
        state: {
          name: result.skill.name,
          skillId: result.skill.id,
          status: result.status,
          success: true,
        },
        success: true,
      };
    } catch (e) {
      return {
        content: `Failed to import skill: ${(e as Error).message}`,
        success: false,
      };
    }
  }

  async execScript(args: ExecScriptParams): Promise<BuiltinServerRuntimeOutput> {
    const { command, runInClient } = args;

    if (!this.service.runCommand) {
      return {
        content: 'Command execution is not available in this environment.',
        success: false,
      };
    }

    try {
      const result = await this.service.runCommand({ command, runInClient });

      const output = [result.output, result.stderr].filter(Boolean).join('\n');

      return {
        content: output || '(no output)',
        state: {
          command,
          exitCode: result.exitCode,
          success: result.success,
        },
        success: true,
      };
    } catch (e) {
      return {
        content: `Failed to execute command: ${(e as Error).message}`,
        success: false,
      };
    }
  }

  async readReference(args: ReadReferenceParams): Promise<BuiltinServerRuntimeOutput> {
    const { id, path } = args;

    // Validate path to prevent traversal attacks
    if (path.includes('..')) {
      return {
        content: 'Invalid path: path traversal is not allowed',
        success: false,
      };
    }

    try {
      // Resolve id: try findById first, fallback to findByName
      const skill = await this.service.findByName(id);
      if (!skill) {
        return {
          content: `Skill not found: "${id}"`,
          success: false,
        };
      }

      const resource = await this.service.readResource(skill.id, path);
      return {
        content: resource.content,
        state: {
          encoding: resource.encoding,
          fileType: resource.fileType,
          path: resource.path,
          size: resource.size,
        },
        success: true,
      };
    } catch (e) {
      return {
        content: `Failed to read resource: ${(e as Error).message}`,
        success: false,
      };
    }
  }

  async runSkill(args: RunSkillParams): Promise<BuiltinServerRuntimeOutput> {
    const { name } = args;

    // Check builtin skills first — no DB query needed
    const builtinSkill = this.builtinSkills.find((s) => s.name === name);
    if (builtinSkill) {
      return {
        content: builtinSkill.content,
        state: {
          description: builtinSkill.description,
          hasResources: false,
          identifier: builtinSkill.identifier,
          name: builtinSkill.name,
        },
        success: true,
      };
    }

    // Fall back to DB query for user/market skills
    const skill = await this.service.findByName(name);

    if (!skill) {
      const { data: allSkills } = await this.service.findAll();
      const availableSkills = allSkills.map((s) => ({
        description: s.description,
        name: s.name,
      }));

      return {
        content: `Skill not found: "${name}". Available skills: ${JSON.stringify(availableSkills)}`,
        success: false,
      };
    }

    const hasResources = !!(skill.resources && Object.keys(skill.resources).length > 0);
    let content = skill.content || '';

    if (hasResources && skill.resources) {
      content += '\n\n' + resourcesTreePrompt(skill.name, skill.resources);
    }

    return {
      content,
      state: {
        description: skill.description || undefined,
        hasResources,
        id: skill.id,
        name: skill.name,
      },
      success: true,
    };
  }
}
