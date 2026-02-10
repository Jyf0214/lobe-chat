import { beforeEach, describe, expect, it, vi } from 'vitest';

import { lambdaClient } from '@/libs/trpc/client';

import { memoryCRUDService } from './crud';

vi.mock('@/libs/trpc/client', () => ({
  lambdaClient: {
    userMemory: {
      createIdentity: { mutate: vi.fn() },
      deleteIdentity: { mutate: vi.fn() },
      getIdentities: { query: vi.fn() },
      updateIdentity: { mutate: vi.fn() },
      deleteContext: { mutate: vi.fn() },
      getContexts: { query: vi.fn() },
      updateContext: { mutate: vi.fn() },
      deleteActivity: { mutate: vi.fn() },
      getActivities: { query: vi.fn() },
      updateActivity: { mutate: vi.fn() },
      deleteExperience: { mutate: vi.fn() },
      getExperiences: { query: vi.fn() },
      updateExperience: { mutate: vi.fn() },
      deletePreference: { mutate: vi.fn() },
      getPreferences: { query: vi.fn() },
      updatePreference: { mutate: vi.fn() },
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('MemoryCRUDService', () => {
  describe('Identity CRUD', () => {
    describe('createIdentity', () => {
      it('should call lambdaClient createIdentity with correct params', async () => {
        // Arrange
        const newIdentity = { description: 'Test', role: 'developer' } as any;
        const mockResult = { id: '123' } as any;
        vi.spyOn(lambdaClient.userMemory.createIdentity, 'mutate').mockResolvedValue(mockResult);

        // Act
        await memoryCRUDService.createIdentity(newIdentity);

        // Assert
        expect(lambdaClient.userMemory.createIdentity.mutate).toHaveBeenCalledWith(newIdentity);
      });
    });

    describe('deleteIdentity', () => {
      it('should call lambdaClient deleteIdentity with correct id', async () => {
        // Arrange
        const identityId = 'identity-123';
        vi.spyOn(lambdaClient.userMemory.deleteIdentity, 'mutate').mockResolvedValue(true as any);

        // Act
        await memoryCRUDService.deleteIdentity(identityId);

        // Assert
        expect(lambdaClient.userMemory.deleteIdentity.mutate).toHaveBeenCalledWith({
          id: identityId,
        });
      });
    });

    describe('getIdentities', () => {
      it('should call lambdaClient getIdentities', async () => {
        // Arrange
        const mockIdentities = [] as any;
        vi.spyOn(lambdaClient.userMemory.getIdentities, 'query').mockResolvedValue(mockIdentities);

        // Act
        await memoryCRUDService.getIdentities();

        // Assert
        expect(lambdaClient.userMemory.getIdentities.query).toHaveBeenCalled();
      });
    });

    describe('updateIdentity', () => {
      it('should call lambdaClient updateIdentity with correct params', async () => {
        // Arrange
        const identityId = 'identity-123';
        const updateData = { role: 'senior developer' } as any;
        vi.spyOn(lambdaClient.userMemory.updateIdentity, 'mutate').mockResolvedValue(true as any);

        // Act
        await memoryCRUDService.updateIdentity(identityId, updateData);

        // Assert
        expect(lambdaClient.userMemory.updateIdentity.mutate).toHaveBeenCalledWith({
          id: identityId,
          data: updateData,
        });
      });
    });
  });

  describe('Context CRUD', () => {
    describe('deleteContext', () => {
      it('should call lambdaClient deleteContext with correct id', async () => {
        // Arrange
        const contextId = 'context-123';
        vi.spyOn(lambdaClient.userMemory.deleteContext, 'mutate').mockResolvedValue({} as any);

        // Act
        await memoryCRUDService.deleteContext(contextId);

        // Assert
        expect(lambdaClient.userMemory.deleteContext.mutate).toHaveBeenCalledWith({
          id: contextId,
        });
      });
    });

    describe('getContexts', () => {
      it('should call lambdaClient getContexts', async () => {
        // Arrange
        vi.spyOn(lambdaClient.userMemory.getContexts, 'query').mockResolvedValue([] as any);

        // Act
        await memoryCRUDService.getContexts();

        // Assert
        expect(lambdaClient.userMemory.getContexts.query).toHaveBeenCalled();
      });
    });

    describe('updateContext', () => {
      it('should call lambdaClient updateContext with correct params', async () => {
        // Arrange
        const contextId = 'context-123';
        const updateData = { title: 'Updated Project' };
        vi.spyOn(lambdaClient.userMemory.updateContext, 'mutate').mockResolvedValue({} as any);

        // Act
        await memoryCRUDService.updateContext(contextId, updateData);

        // Assert
        expect(lambdaClient.userMemory.updateContext.mutate).toHaveBeenCalledWith({
          id: contextId,
          data: updateData,
        });
      });
    });
  });

  describe('Activity CRUD', () => {
    describe('deleteActivity', () => {
      it('should call lambdaClient deleteActivity with correct id', async () => {
        // Arrange
        const activityId = 'activity-123';
        vi.spyOn(lambdaClient.userMemory.deleteActivity, 'mutate').mockResolvedValue({} as any);

        // Act
        await memoryCRUDService.deleteActivity(activityId);

        // Assert
        expect(lambdaClient.userMemory.deleteActivity.mutate).toHaveBeenCalledWith({
          id: activityId,
        });
      });
    });

    describe('getActivities', () => {
      it('should call lambdaClient getActivities', async () => {
        // Arrange
        vi.spyOn(lambdaClient.userMemory.getActivities, 'query').mockResolvedValue([] as any);

        // Act
        await memoryCRUDService.getActivities();

        // Assert
        expect(lambdaClient.userMemory.getActivities.query).toHaveBeenCalled();
      });
    });

    describe('updateActivity', () => {
      it('should call lambdaClient updateActivity with correct params', async () => {
        // Arrange
        const activityId = 'activity-123';
        const updateData = { narrative: 'Updated narrative' };
        vi.spyOn(lambdaClient.userMemory.updateActivity, 'mutate').mockResolvedValue({} as any);

        // Act
        await memoryCRUDService.updateActivity(activityId, updateData);

        // Assert
        expect(lambdaClient.userMemory.updateActivity.mutate).toHaveBeenCalledWith({
          id: activityId,
          data: updateData,
        });
      });
    });
  });

  describe('Experience CRUD', () => {
    describe('deleteExperience', () => {
      it('should call lambdaClient deleteExperience with correct id', async () => {
        // Arrange
        const experienceId = 'experience-123';
        vi.spyOn(lambdaClient.userMemory.deleteExperience, 'mutate').mockResolvedValue({} as any);

        // Act
        await memoryCRUDService.deleteExperience(experienceId);

        // Assert
        expect(lambdaClient.userMemory.deleteExperience.mutate).toHaveBeenCalledWith({
          id: experienceId,
        });
      });
    });

    describe('getExperiences', () => {
      it('should call lambdaClient getExperiences', async () => {
        // Arrange
        vi.spyOn(lambdaClient.userMemory.getExperiences, 'query').mockResolvedValue([] as any);

        // Act
        await memoryCRUDService.getExperiences();

        // Assert
        expect(lambdaClient.userMemory.getExperiences.query).toHaveBeenCalled();
      });
    });

    describe('updateExperience', () => {
      it('should call lambdaClient updateExperience with correct params', async () => {
        // Arrange
        const experienceId = 'experience-123';
        const updateData = { situation: 'Critical bug' };
        vi.spyOn(lambdaClient.userMemory.updateExperience, 'mutate').mockResolvedValue({} as any);

        // Act
        await memoryCRUDService.updateExperience(experienceId, updateData);

        // Assert
        expect(lambdaClient.userMemory.updateExperience.mutate).toHaveBeenCalledWith({
          id: experienceId,
          data: updateData,
        });
      });
    });
  });

  describe('Preference CRUD', () => {
    describe('deletePreference', () => {
      it('should call lambdaClient deletePreference with correct id', async () => {
        // Arrange
        const preferenceId = 'preference-123';
        vi.spyOn(lambdaClient.userMemory.deletePreference, 'mutate').mockResolvedValue({} as any);

        // Act
        await memoryCRUDService.deletePreference(preferenceId);

        // Assert
        expect(lambdaClient.userMemory.deletePreference.mutate).toHaveBeenCalledWith({
          id: preferenceId,
        });
      });
    });

    describe('getPreferences', () => {
      it('should call lambdaClient getPreferences', async () => {
        // Arrange
        vi.spyOn(lambdaClient.userMemory.getPreferences, 'query').mockResolvedValue([] as any);

        // Act
        await memoryCRUDService.getPreferences();

        // Assert
        expect(lambdaClient.userMemory.getPreferences.query).toHaveBeenCalled();
      });
    });

    describe('updatePreference', () => {
      it('should call lambdaClient updatePreference with correct params', async () => {
        // Arrange
        const preferenceId = 'preference-123';
        const updateData = { suggestions: 'Updated suggestion' };
        vi.spyOn(lambdaClient.userMemory.updatePreference, 'mutate').mockResolvedValue({} as any);

        // Act
        await memoryCRUDService.updatePreference(preferenceId, updateData);

        // Assert
        expect(lambdaClient.userMemory.updatePreference.mutate).toHaveBeenCalledWith({
          id: preferenceId,
          data: updateData,
        });
      });
    });
  });

  describe('Error handling', () => {
    it('should propagate errors from lambdaClient', async () => {
      // Arrange
      const error = new Error('Network error');
      vi.spyOn(lambdaClient.userMemory.createIdentity, 'mutate').mockRejectedValue(error);

      // Act & Assert
      await expect(memoryCRUDService.createIdentity({} as any)).rejects.toThrow('Network error');
    });
  });
});
