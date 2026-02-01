import { builtinSkills } from '@lobechat/builtin-skills';
import { SkillsIdentifier } from '@lobechat/builtin-tool-skills';
import {
  type SkillImportServiceResult,
  type SkillRuntimeService,
  SkillsExecutionRuntime,
} from '@lobechat/builtin-tool-skills/executionRuntime';
import type { SkillItem, SkillListItem, SkillResourceContent } from '@lobechat/types';

import { AgentSkillModel } from '@/database/models/agentSkill';
import { SkillImporter } from '@/server/services/skill/importer';
import { SkillResourceService } from '@/server/services/skill/resource';

import { type ServerRuntimeRegistration } from './types';

class SkillServerRuntimeService implements SkillRuntimeService {
  private importer: SkillImporter;
  private resourceService: SkillResourceService;
  private skillModel: AgentSkillModel;

  constructor(options: {
    importer: SkillImporter;
    resourceService: SkillResourceService;
    skillModel: AgentSkillModel;
  }) {
    this.skillModel = options.skillModel;
    this.resourceService = options.resourceService;
    this.importer = options.importer;
  }

  findAll = (): Promise<{ data: SkillListItem[]; total: number }> => {
    return this.skillModel.findAll();
  };

  findById = (id: string): Promise<SkillItem | undefined> => {
    return this.skillModel.findById(id);
  };

  findByName = (name: string): Promise<SkillItem | undefined> => {
    return this.skillModel.findByName(name);
  };

  importFromGitHub = async (gitUrl: string): Promise<SkillImportServiceResult> => {
    const result = await this.importer.importFromGitHub({ gitUrl });
    return { skill: { id: result.skill.id, name: result.skill.name }, status: result.status };
  };

  importFromUrl = async (url: string): Promise<SkillImportServiceResult> => {
    const result = await this.importer.importFromUrl({ url });
    return { skill: { id: result.skill.id, name: result.skill.name }, status: result.status };
  };

  importFromZipUrl = async (url: string): Promise<SkillImportServiceResult> => {
    const result = await this.importer.importFromUrl({ url });
    return { skill: { id: result.skill.id, name: result.skill.name }, status: result.status };
  };

  readResource = async (id: string, path: string): Promise<SkillResourceContent> => {
    const skill = await this.skillModel.findById(id);
    if (!skill) throw new Error(`Skill not found: ${id}`);
    if (!skill.resources) throw new Error(`Skill has no resources: ${id}`);
    return this.resourceService.readResource(skill.resources, path);
  };
}

/**
 * Skills Server Runtime
 * Per-request runtime (needs serverDB, userId)
 */
export const skillsRuntime: ServerRuntimeRegistration = {
  factory: (context) => {
    if (!context.serverDB) {
      throw new Error('serverDB is required for Skills execution');
    }
    if (!context.userId) {
      throw new Error('userId is required for Skills execution');
    }

    const skillModel = new AgentSkillModel(context.serverDB, context.userId);
    const resourceService = new SkillResourceService(context.serverDB, context.userId);
    const importer = new SkillImporter(context.serverDB, context.userId);

    const service = new SkillServerRuntimeService({ importer, resourceService, skillModel });

    return new SkillsExecutionRuntime({ builtinSkills, service });
  },
  identifier: SkillsIdentifier,
};
