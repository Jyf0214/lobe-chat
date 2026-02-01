import { BuiltinToolManifest } from '@lobechat/types';

import { isDesktop } from './const';
import { systemPrompt } from './systemRole';
import { SkillsApiName, SkillsIdentifier } from './types';

export const SkillsManifest: BuiltinToolManifest = {
  api: [
    {
      description:
        'Activate a skill by name to load its instructions. Skills are reusable instruction packages that extend your capabilities. Returns the skill content that you should follow to complete the task. If the skill is not found, returns a list of available skills.',
      name: SkillsApiName.runSkill,
      parameters: {
        properties: {
          name: {
            description: 'The exact name of the skill to activate.',
            type: 'string',
          },
        },
        required: ['name'],
        type: 'object',
      },
    },
    {
      description:
        "Read a reference file attached to a skill. Use this to load additional context files mentioned in a skill's content. Requires the id returned by runSkill and the file path.",
      name: SkillsApiName.readReference,
      parameters: {
        properties: {
          id: {
            description: 'The skill ID or name returned by runSkill.',
            type: 'string',
          },
          path: {
            description:
              'The virtual path of the reference file to read. Must be a path mentioned in the skill content.',
            type: 'string',
          },
        },
        required: ['id', 'path'],
        type: 'object',
      },
    },
    {
      description:
        "Execute a shell command or script specified in a skill's instructions. Use this when a skill's content instructs you to run CLI commands (e.g., npx, npm, pip). Returns the command output.",
      humanIntervention: 'required',
      name: SkillsApiName.execScript,
      parameters: {
        properties: {
          command: {
            description: 'The shell command to execute.',
            type: 'string',
          },
          description: {
            description:
              'Clear description of what this command does (5-10 words, in active voice). Use the same language as the user input.',
            type: 'string',
          },
          ...(isDesktop && {
            runInClient: {
              description:
                'Whether to run on the desktop client (for local shell access). MUST be true when command requires local-system tools. Default is false (cloud sandbox execution).',
              type: 'boolean',
            },
          }),
        },
        required: ['description', 'command'],
        type: 'object',
      },
    },
    {
      description:
        'Import/install a skill from a URL. Supports SKILL.md URLs, GitHub repository URLs, and ZIP package URLs. Requires user confirmation before installation.',
      humanIntervention: 'required',
      name: SkillsApiName.importSkill,
      parameters: {
        properties: {
          type: {
            description:
              'The type of the URL: "url" for SKILL.md or GitHub links, "zip" for ZIP package URLs.',
            enum: ['url', 'zip'],
            type: 'string',
          },
          url: {
            description: 'The URL of the skill resource to import.',
            type: 'string',
          },
        },
        required: ['url', 'type'],
        type: 'object',
      },
    },
  ],
  identifier: SkillsIdentifier,
  meta: {
    avatar: '🛠️',
    description: 'Activate and use reusable skill packages',
    title: 'Skills',
  },
  systemRole: systemPrompt,
  type: 'builtin',
};
