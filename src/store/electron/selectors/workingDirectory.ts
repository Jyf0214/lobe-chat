import { type ElectronState } from '@/store/electron/initialState';

const agentWorkingDirectory = (agentId: string) => (s: ElectronState) =>
  s.workingDirectories[`agent:${agentId}`];

const topicWorkingDirectory = (topicId: string) => (s: ElectronState) =>
  s.workingDirectories[`topic:${topicId}`];

export const workingDirectorySelectors = {
  agentWorkingDirectory,
  topicWorkingDirectory,
};
