import { beforeEach, describe, expect, it, vi } from 'vitest';

import { lambdaClient } from '@/libs/trpc/client';

import { userMemoryService } from './index';

vi.mock('@/libs/trpc/client', () => ({
  lambdaClient: {
    userMemories: {
      toolAddActivityMemory: { mutate: vi.fn() },
      toolAddContextMemory: { mutate: vi.fn() },
      toolAddExperienceMemory: { mutate: vi.fn() },
      toolAddIdentityMemory: { mutate: vi.fn() },
      toolAddPreferenceMemory: { mutate: vi.fn() },
      toolRemoveIdentityMemory: { mutate: vi.fn() },
      toolUpdateIdentityMemory: { mutate: vi.fn() },
      getMemoryDetail: { query: vi.fn() },
      queryExperiences: { query: vi.fn() },
      queryActivities: { query: vi.fn() },
      queryIdentities: { query: vi.fn() },
      toolSearchMemory: { query: vi.fn() },
      retrieveMemoryForTopic: { query: vi.fn() },
      queryTags: { query: vi.fn() },
      queryIdentityRoles: { query: vi.fn() },
      queryIdentitiesForInjection: { query: vi.fn() },
      queryMemories: { query: vi.fn() },
    },
    userMemory: {
      getPersona: { query: vi.fn() },
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('UserMemoryService', () => {
  describe('Add Memory Operations', () => {
    it('should call addActivityMemory', async () => {
      // Arrange
      const params = { narrative: 'Meeting' } as any;
      vi.spyOn(lambdaClient.userMemories.toolAddActivityMemory, 'mutate').mockResolvedValue(
        {} as any,
      );

      // Act
      await userMemoryService.addActivityMemory(params);

      // Assert
      expect(lambdaClient.userMemories.toolAddActivityMemory.mutate).toHaveBeenCalledWith(params);
    });

    it('should call addContextMemory', async () => {
      // Arrange
      const params = { title: 'Project' } as any;
      vi.spyOn(lambdaClient.userMemories.toolAddContextMemory, 'mutate').mockResolvedValue(
        {} as any,
      );

      // Act
      await userMemoryService.addContextMemory(params);

      // Assert
      expect(lambdaClient.userMemories.toolAddContextMemory.mutate).toHaveBeenCalledWith(params);
    });

    it('should call addExperienceMemory', async () => {
      // Arrange
      const params = { situation: 'Bug fix' } as any;
      vi.spyOn(lambdaClient.userMemories.toolAddExperienceMemory, 'mutate').mockResolvedValue(
        {} as any,
      );

      // Act
      await userMemoryService.addExperienceMemory(params);

      // Assert
      expect(lambdaClient.userMemories.toolAddExperienceMemory.mutate).toHaveBeenCalledWith(params);
    });

    it('should call addIdentityMemory', async () => {
      // Arrange
      const params = { description: 'Developer' } as any;
      vi.spyOn(lambdaClient.userMemories.toolAddIdentityMemory, 'mutate').mockResolvedValue(
        {} as any,
      );

      // Act
      await userMemoryService.addIdentityMemory(params);

      // Assert
      expect(lambdaClient.userMemories.toolAddIdentityMemory.mutate).toHaveBeenCalledWith(params);
    });

    it('should call addPreferenceMemory', async () => {
      // Arrange
      const params = { conclusionDirectives: 'Be concise' } as any;
      vi.spyOn(lambdaClient.userMemories.toolAddPreferenceMemory, 'mutate').mockResolvedValue(
        {} as any,
      );

      // Act
      await userMemoryService.addPreferenceMemory(params);

      // Assert
      expect(lambdaClient.userMemories.toolAddPreferenceMemory.mutate).toHaveBeenCalledWith(params);
    });
  });

  describe('Remove and Update Operations', () => {
    it('should call removeIdentityMemory', async () => {
      // Arrange
      const params = { id: '123' } as any;
      vi.spyOn(lambdaClient.userMemories.toolRemoveIdentityMemory, 'mutate').mockResolvedValue(
        {} as any,
      );

      // Act
      await userMemoryService.removeIdentityMemory(params);

      // Assert
      expect(lambdaClient.userMemories.toolRemoveIdentityMemory.mutate).toHaveBeenCalledWith(
        params,
      );
    });

    it('should call updateIdentityMemory', async () => {
      // Arrange
      const params = { id: '123', description: 'Updated' } as any;
      vi.spyOn(lambdaClient.userMemories.toolUpdateIdentityMemory, 'mutate').mockResolvedValue(
        {} as any,
      );

      // Act
      await userMemoryService.updateIdentityMemory(params);

      // Assert
      expect(lambdaClient.userMemories.toolUpdateIdentityMemory.mutate).toHaveBeenCalledWith(
        params,
      );
    });
  });

  describe('Query Operations', () => {
    it('should call getMemoryDetail', async () => {
      // Arrange
      const params = { id: '123', layer: 'identity' as any };
      vi.spyOn(lambdaClient.userMemories.getMemoryDetail, 'query').mockResolvedValue({} as any);

      // Act
      await userMemoryService.getMemoryDetail(params);

      // Assert
      expect(lambdaClient.userMemories.getMemoryDetail.query).toHaveBeenCalledWith(params);
    });

    it('should call getPersona', async () => {
      // Arrange
      vi.spyOn(lambdaClient.userMemory.getPersona, 'query').mockResolvedValue({} as any);

      // Act
      await userMemoryService.getPersona();

      // Assert
      expect(lambdaClient.userMemory.getPersona.query).toHaveBeenCalled();
    });

    it('should call queryExperiences', async () => {
      // Arrange
      const params = { page: 1, pageSize: 10 };
      vi.spyOn(lambdaClient.userMemories.queryExperiences, 'query').mockResolvedValue({} as any);

      // Act
      await userMemoryService.queryExperiences(params);

      // Assert
      expect(lambdaClient.userMemories.queryExperiences.query).toHaveBeenCalledWith(params);
    });

    it('should call queryActivities', async () => {
      // Arrange
      const params = { q: 'meeting' } as any;
      vi.spyOn(lambdaClient.userMemories.queryActivities, 'query').mockResolvedValue({} as any);

      // Act
      await userMemoryService.queryActivities(params);

      // Assert
      expect(lambdaClient.userMemories.queryActivities.query).toHaveBeenCalledWith(params);
    });

    it('should call queryIdentities', async () => {
      // Arrange
      const params = { sort: 'name' } as any;
      vi.spyOn(lambdaClient.userMemories.queryIdentities, 'query').mockResolvedValue({} as any);

      // Act
      await userMemoryService.queryIdentities(params);

      // Assert
      expect(lambdaClient.userMemories.queryIdentities.query).toHaveBeenCalledWith(params);
    });
  });

  describe('Search and Retrieve Operations', () => {
    it('should call retrieveMemory', async () => {
      // Arrange
      const params = { query: 'test' } as any;
      vi.spyOn(lambdaClient.userMemories.toolSearchMemory, 'query').mockResolvedValue({} as any);

      // Act
      await userMemoryService.retrieveMemory(params);

      // Assert
      expect(lambdaClient.userMemories.toolSearchMemory.query).toHaveBeenCalledWith(params);
    });

    it('should call retrieveMemoryForTopic', async () => {
      // Arrange
      const topicId = 'topic-123';
      vi.spyOn(lambdaClient.userMemories.retrieveMemoryForTopic, 'query').mockResolvedValue(
        {} as any,
      );

      // Act
      await userMemoryService.retrieveMemoryForTopic(topicId);

      // Assert
      expect(lambdaClient.userMemories.retrieveMemoryForTopic.query).toHaveBeenCalledWith({
        topicId,
      });
    });

    it('should call searchMemory', async () => {
      // Arrange
      const params = { query: 'typescript' } as any;
      vi.spyOn(lambdaClient.userMemories.toolSearchMemory, 'query').mockResolvedValue({} as any);

      // Act
      await userMemoryService.searchMemory(params);

      // Assert
      expect(lambdaClient.userMemories.toolSearchMemory.query).toHaveBeenCalledWith(params);
    });
  });

  describe('Additional Query Operations', () => {
    it('should call queryTags', async () => {
      // Arrange
      const params = { page: 1, size: 20 };
      vi.spyOn(lambdaClient.userMemories.queryTags, 'query').mockResolvedValue([] as any);

      // Act
      await userMemoryService.queryTags(params);

      // Assert
      expect(lambdaClient.userMemories.queryTags.query).toHaveBeenCalledWith(params);
    });

    it('should call queryIdentityRoles', async () => {
      // Arrange
      const params = { page: 1, size: 10 };
      vi.spyOn(lambdaClient.userMemories.queryIdentityRoles, 'query').mockResolvedValue({} as any);

      // Act
      await userMemoryService.queryIdentityRoles(params);

      // Assert
      expect(lambdaClient.userMemories.queryIdentityRoles.query).toHaveBeenCalledWith(params);
    });

    it('should call queryIdentitiesForInjection', async () => {
      // Arrange
      const params = { limit: 5 };
      vi.spyOn(lambdaClient.userMemories.queryIdentitiesForInjection, 'query').mockResolvedValue(
        [] as any,
      );

      // Act
      await userMemoryService.queryIdentitiesForInjection(params);

      // Assert
      expect(lambdaClient.userMemories.queryIdentitiesForInjection.query).toHaveBeenCalledWith(
        params,
      );
    });

    it('should call queryMemories', async () => {
      // Arrange
      const params = { q: 'coding', page: 1, pageSize: 10 };
      vi.spyOn(lambdaClient.userMemories.queryMemories, 'query').mockResolvedValue({} as any);

      // Act
      await userMemoryService.queryMemories(params);

      // Assert
      expect(lambdaClient.userMemories.queryMemories.query).toHaveBeenCalledWith(params);
    });
  });

  describe('Error handling', () => {
    it('should propagate errors from add operations', async () => {
      // Arrange
      const error = new Error('Add failed');
      vi.spyOn(lambdaClient.userMemories.toolAddActivityMemory, 'mutate').mockRejectedValue(error);

      // Act & Assert
      await expect(userMemoryService.addActivityMemory({} as any)).rejects.toThrow('Add failed');
    });

    it('should propagate errors from query operations', async () => {
      // Arrange
      const error = new Error('Query failed');
      vi.spyOn(lambdaClient.userMemories.queryExperiences, 'query').mockRejectedValue(error);

      // Act & Assert
      await expect(userMemoryService.queryExperiences()).rejects.toThrow('Query failed');
    });
  });
});
