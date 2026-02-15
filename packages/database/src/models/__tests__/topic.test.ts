// @vitest-environment node
import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getTestDB } from '../../core/getTestDB';
import {
  agents,
  agentsToSessions,
  chatGroups,
  messages,
  sessions,
  topics,
  users,
} from '../../schemas';
import type { LobeChatDatabase } from '../../type';
import { TopicModel } from '../topic';

const serverDB: LobeChatDatabase = await getTestDB();

const userId = 'topic-model-test-user-id';
const userId2 = 'topic-model-test-user-id-2';
const topicModel = new TopicModel(serverDB, userId);
const topicModel2 = new TopicModel(serverDB, userId2);

beforeEach(async () => {
  await serverDB.delete(users);
  await serverDB.insert(users).values([{ id: userId }, { id: userId2 }]);
});

afterEach(async () => {
  await serverDB.delete(users).where(eq(users.id, userId));
});

describe('TopicModel', () => {
  describe('create', () => {
    it('should create a new topic', async () => {
      const params = {
        title: 'Test Topic',
        favorite: false,
      };

      const result = await topicModel.create(params);
      expect(result.id).toBeDefined();
      expect(result.title).toBe(params.title);
      expect(result.userId).toBe(userId);

      const topic = await serverDB.query.topics.findFirst({
        where: eq(topics.id, result.id),
      });
      expect(topic).toMatchObject({ title: params.title, userId });
    });

    it('should create topic with metadata', async () => {
      const params = {
        title: 'Topic with Metadata',
        metadata: { cronJobId: 'job-123' },
      };

      const result = await topicModel.create(params);
      expect(result.metadata).toEqual(params.metadata);
    });

    it('should create topic with agentId', async () => {
      const agentId = 'test-agent-123';
      await serverDB.insert(agents).values({ id: agentId, userId });

      const result = await topicModel.create({ title: 'Agent Topic', agentId });
      expect(result.agentId).toBe(agentId);
    });

    it('should create topic with groupId', async () => {
      const groupId = 'test-group-123';
      await serverDB.insert(chatGroups).values({ id: groupId, name: 'Test Group', userId });

      const result = await topicModel.create({ title: 'Group Topic', groupId });
      expect(result.groupId).toBe(groupId);
    });

    it('should create topic and associate messages', async () => {
      const message1 = await serverDB
        .insert(messages)
        .values({ content: 'Message 1', role: 'user', userId })
        .returning();
      const message2 = await serverDB
        .insert(messages)
        .values({ content: 'Message 2', role: 'assistant', userId })
        .returning();

      const result = await topicModel.create({
        title: 'Topic with Messages',
        messages: [message1[0].id, message2[0].id],
      });

      const updatedMessage1 = await serverDB.query.messages.findFirst({
        where: eq(messages.id, message1[0].id),
      });
      const updatedMessage2 = await serverDB.query.messages.findFirst({
        where: eq(messages.id, message2[0].id),
      });

      expect(updatedMessage1?.topicId).toBe(result.id);
      expect(updatedMessage2?.topicId).toBe(result.id);
    });
  });

  describe('findById', () => {
    it('should find a topic by id', async () => {
      const created = await topicModel.create({ title: 'Find Me' });

      const found = await topicModel.findById(created.id);
      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.title).toBe('Find Me');
    });

    it('should return undefined for non-existent topic', async () => {
      const found = await topicModel.findById('non-existent-id');
      expect(found).toBeUndefined();
    });

    it('should not find topics from other users', async () => {
      const created = await topicModel2.create({ title: 'Other User Topic' });

      const found = await topicModel.findById(created.id);
      expect(found).toBeUndefined();
    });
  });

  describe('query', () => {
    beforeEach(async () => {
      await serverDB.delete(topics);
    });

    it('should query all topics for user', async () => {
      await topicModel.create({ title: 'Topic 1' });
      await topicModel.create({ title: 'Topic 2' });
      await topicModel2.create({ title: 'Other User Topic' });

      const result = await topicModel.query();
      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should query topics by agentId', async () => {
      const agentId = 'test-agent-query';
      await serverDB.insert(agents).values({ id: agentId, userId });

      await topicModel.create({ title: 'Agent Topic 1', agentId });
      await topicModel.create({ title: 'Agent Topic 2', agentId });
      await topicModel.create({ title: 'No Agent Topic' });

      const result = await topicModel.query({ agentId });
      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should query topics by groupId', async () => {
      const groupId = 'test-group-query';
      await serverDB.insert(chatGroups).values({ id: groupId, name: 'Test Group', userId });

      await topicModel.create({ title: 'Group Topic 1', groupId });
      await topicModel.create({ title: 'Group Topic 2', groupId });
      await topicModel.create({ title: 'No Group Topic' });

      const result = await topicModel.query({ groupId });
      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should exclude topics by trigger', async () => {
      await topicModel.create({ title: 'Cron Topic', trigger: 'cron' });
      await topicModel.create({ title: 'Chat Topic', trigger: 'chat' });
      await topicModel.create({ title: 'No Trigger Topic' });

      const result = await topicModel.query({ excludeTriggers: ['cron'] });
      expect(result.items).toHaveLength(2);
      expect(result.items.every((t) => t.title !== 'Cron Topic')).toBe(true);
    });

    it('should paginate results', async () => {
      for (let i = 0; i < 15; i++) {
        await topicModel.create({ title: `Topic ${i}` });
      }

      const page1 = await topicModel.query({ current: 0, pageSize: 5 });
      const page2 = await topicModel.query({ current: 1, pageSize: 5 });
      const page3 = await topicModel.query({ current: 2, pageSize: 5 });

      expect(page1.items).toHaveLength(5);
      expect(page2.items).toHaveLength(5);
      expect(page3.items).toHaveLength(5);
      expect(page1.total).toBe(15);
    });

    it('should order by favorite and updatedAt', async () => {
      const topic1 = await topicModel.create({ title: 'Topic 1', favorite: false });
      const topic2 = await topicModel.create({ title: 'Topic 2', favorite: true });
      await new Promise((resolve) => setTimeout(resolve, 10));
      const topic3 = await topicModel.create({ title: 'Topic 3', favorite: true });

      const result = await topicModel.query();

      expect(result.items[0].id).toBe(topic3.id); // favorite + most recent
      expect(result.items[1].id).toBe(topic2.id); // favorite + older
      expect(result.items[2].id).toBe(topic1.id); // not favorite
    });
  });

  describe('queryAll', () => {
    it('should return all topics for user', async () => {
      await topicModel.create({ title: 'Topic 1' });
      await topicModel.create({ title: 'Topic 2' });
      await topicModel2.create({ title: 'Other User Topic' });

      const result = await topicModel.queryAll();
      expect(result).toHaveLength(2);
    });
  });

  describe('queryByKeyword', () => {
    beforeEach(async () => {
      await serverDB.delete(topics);
      await serverDB.delete(messages);
    });

    it('should return empty array for empty keyword', async () => {
      const result = await topicModel.queryByKeyword('');
      expect(result).toEqual([]);
    });

    it('should find topics by title', async () => {
      await topicModel.create({ title: 'JavaScript Tutorial' });
      await topicModel.create({ title: 'Python Guide' });

      const result = await topicModel.queryByKeyword('javascript');
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('JavaScript Tutorial');
    });

    it('should be case insensitive', async () => {
      await topicModel.create({ title: 'TypeScript Advanced' });

      const result = await topicModel.queryByKeyword('TYPESCRIPT');
      expect(result).toHaveLength(1);
    });

    it('should find topics by message content', async () => {
      const topic = await topicModel.create({ title: 'Topic A' });

      await serverDB.insert(messages).values({
        content: 'This message talks about blockchain',
        role: 'user',
        userId,
        topicId: topic.id,
      });

      const result = await topicModel.queryByKeyword('blockchain');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(topic.id);
    });

    it('should merge and deduplicate results from title and message search', async () => {
      const topic = await topicModel.create({ title: 'React Tutorial' });

      await serverDB.insert(messages).values({
        content: 'Learning React hooks',
        role: 'user',
        userId,
        topicId: topic.id,
      });

      const result = await topicModel.queryByKeyword('react');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(topic.id);
    });
  });

  describe('count', () => {
    beforeEach(async () => {
      await serverDB.delete(topics);
    });

    it('should count all topics for user', async () => {
      await topicModel.create({ title: 'Topic 1' });
      await topicModel.create({ title: 'Topic 2' });
      await topicModel2.create({ title: 'Other User Topic' });

      const count = await topicModel.count();
      expect(count).toBe(2);
    });

    it('should count topics by agentId', async () => {
      const agentId = 'test-agent-count';
      await serverDB.insert(agents).values({ id: agentId, userId });

      await topicModel.create({ title: 'Agent Topic', agentId });
      await topicModel.create({ title: 'No Agent Topic' });

      const count = await topicModel.count({ agentId });
      expect(count).toBe(1);
    });
  });

  describe('rank', () => {
    beforeEach(async () => {
      await serverDB.delete(topics);
      await serverDB.delete(messages);
    });

    it('should rank topics by message count', async () => {
      const topic1 = await topicModel.create({ title: 'Topic 1' });
      const topic2 = await topicModel.create({ title: 'Topic 2' });
      const topic3 = await topicModel.create({ title: 'Topic 3' });

      // Topic 1: 5 messages
      for (let i = 0; i < 5; i++) {
        await serverDB.insert(messages).values({
          content: `Message ${i}`,
          role: 'user',
          userId,
          topicId: topic1.id,
        });
      }

      // Topic 2: 3 messages
      for (let i = 0; i < 3; i++) {
        await serverDB.insert(messages).values({
          content: `Message ${i}`,
          role: 'user',
          userId,
          topicId: topic2.id,
        });
      }

      // Topic 3: 1 message
      await serverDB.insert(messages).values({
        content: 'Message',
        role: 'user',
        userId,
        topicId: topic3.id,
      });

      const result = await topicModel.rank(3);
      expect(result).toHaveLength(3);
      expect(result[0].id).toBe(topic1.id);
      expect(result[0].count).toBe(5);
      expect(result[1].id).toBe(topic2.id);
      expect(result[1].count).toBe(3);
      expect(result[2].id).toBe(topic3.id);
      expect(result[2].count).toBe(1);
    });

    it('should limit results', async () => {
      for (let i = 0; i < 5; i++) {
        const topic = await topicModel.create({ title: `Topic ${i}` });
        await serverDB.insert(messages).values({
          content: 'Message',
          role: 'user',
          userId,
          topicId: topic.id,
        });
      }

      const result = await topicModel.rank(3);
      expect(result).toHaveLength(3);
    });

    it('should exclude topics with no messages', async () => {
      const topic1 = await topicModel.create({ title: 'Topic with messages' });
      await topicModel.create({ title: 'Topic without messages' });

      await serverDB.insert(messages).values({
        content: 'Message',
        role: 'user',
        userId,
        topicId: topic1.id,
      });

      const result = await topicModel.rank(10);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(topic1.id);
    });
  });

  describe('update', () => {
    it('should update a topic', async () => {
      const topic = await topicModel.create({ title: 'Original Title', favorite: false });

      await topicModel.update(topic.id, { title: 'Updated Title', favorite: true });

      const updated = await serverDB.query.topics.findFirst({
        where: eq(topics.id, topic.id),
      });
      expect(updated?.title).toBe('Updated Title');
      expect(updated?.favorite).toBe(true);
    });

    it('should update topic metadata', async () => {
      const topic = await topicModel.create({ title: 'Topic' });

      await topicModel.update(topic.id, {
        metadata: { cronJobId: 'new-job-id' },
      });

      const updated = await serverDB.query.topics.findFirst({
        where: eq(topics.id, topic.id),
      });
      expect(updated?.metadata).toEqual({ cronJobId: 'new-job-id' });
    });
  });

  describe('updateMetadata', () => {
    it('should merge metadata instead of replacing', async () => {
      const topic = await topicModel.create({
        title: 'Topic',
        metadata: { cronJobId: 'job-1', customField: 'value1' },
      });

      await topicModel.updateMetadata(topic.id, { cronJobId: 'job-2' });

      const updated = await serverDB.query.topics.findFirst({
        where: eq(topics.id, topic.id),
      });
      expect(updated?.metadata).toEqual({
        cronJobId: 'job-2',
        customField: 'value1',
      });
    });
  });

  describe('delete', () => {
    it('should delete a topic', async () => {
      const topic = await topicModel.create({ title: 'Delete Me' });

      await topicModel.delete(topic.id);

      const found = await serverDB.query.topics.findFirst({
        where: eq(topics.id, topic.id),
      });
      expect(found).toBeUndefined();
    });

    it('should not delete topics from other users', async () => {
      const topic = await topicModel2.create({ title: 'Other User Topic' });

      await topicModel.delete(topic.id);

      const found = await serverDB.query.topics.findFirst({
        where: eq(topics.id, topic.id),
      });
      expect(found).toBeDefined();
    });
  });

  describe('batchDelete', () => {
    it('should delete multiple topics', async () => {
      const topic1 = await topicModel.create({ title: 'Topic 1' });
      const topic2 = await topicModel.create({ title: 'Topic 2' });
      const topic3 = await topicModel.create({ title: 'Topic 3' });

      await topicModel.batchDelete([topic1.id, topic2.id]);

      const remaining = await serverDB.query.topics.findMany({
        where: eq(topics.userId, userId),
      });
      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe(topic3.id);
    });
  });

  describe('deleteAll', () => {
    it('should delete all topics for user', async () => {
      await topicModel.create({ title: 'Topic 1' });
      await topicModel.create({ title: 'Topic 2' });
      await topicModel2.create({ title: 'Other User Topic' });

      await topicModel.deleteAll();

      const userTopics = await serverDB.query.topics.findMany({
        where: eq(topics.userId, userId),
      });
      const allTopics = await serverDB.query.topics.findMany();

      expect(userTopics).toHaveLength(0);
      expect(allTopics).toHaveLength(1);
    });
  });

  describe('batchCreate', () => {
    it('should create multiple topics', async () => {
      const params = [{ title: 'Topic 1' }, { title: 'Topic 2' }, { title: 'Topic 3' }];

      const result = await topicModel.batchCreate(params);

      expect(result).toHaveLength(3);
      expect(result[0].title).toBe('Topic 1');
      expect(result[1].title).toBe('Topic 2');
      expect(result[2].title).toBe('Topic 3');
    });

    it('should create topics with associated messages', async () => {
      const message1 = await serverDB
        .insert(messages)
        .values({ content: 'Message 1', role: 'user', userId })
        .returning();
      const message2 = await serverDB
        .insert(messages)
        .values({ content: 'Message 2', role: 'user', userId })
        .returning();

      const params = [
        { title: 'Topic 1', messages: [message1[0].id] },
        { title: 'Topic 2', messages: [message2[0].id] },
      ];

      const result = await topicModel.batchCreate(params);

      const updatedMessage1 = await serverDB.query.messages.findFirst({
        where: eq(messages.id, message1[0].id),
      });
      const updatedMessage2 = await serverDB.query.messages.findFirst({
        where: eq(messages.id, message2[0].id),
      });

      expect(updatedMessage1?.topicId).toBe(result[0].id);
      expect(updatedMessage2?.topicId).toBe(result[1].id);
    });
  });

  describe('batchDeleteByAgentId', () => {
    it('should delete topics by agentId', async () => {
      const agentId = 'test-agent-delete';
      await serverDB.insert(agents).values({ id: agentId, userId });

      await topicModel.create({ title: 'Agent Topic 1', agentId });
      await topicModel.create({ title: 'Agent Topic 2', agentId });
      await topicModel.create({ title: 'No Agent Topic' });

      await topicModel.batchDeleteByAgentId(agentId);

      const remaining = await serverDB.query.topics.findMany({
        where: eq(topics.userId, userId),
      });
      expect(remaining).toHaveLength(1);
      expect(remaining[0].title).toBe('No Agent Topic');
    });

    it('should handle legacy sessionId-based topics', async () => {
      const agentId = 'test-agent-legacy';
      const sessionId = 'test-session-legacy';

      await serverDB.insert(agents).values({ id: agentId, userId });
      await serverDB.insert(sessions).values({ id: sessionId, userId });
      await serverDB.insert(agentsToSessions).values({ agentId, sessionId, userId });

      // Create topic with legacy sessionId
      await topicModel.create({ title: 'Legacy Topic', sessionId });
      // Create topic with new agentId
      await topicModel.create({ title: 'New Topic', agentId });

      await topicModel.batchDeleteByAgentId(agentId);

      const remaining = await serverDB.query.topics.findMany({
        where: eq(topics.userId, userId),
      });
      expect(remaining).toHaveLength(0);
    });
  });

  describe('batchDeleteByGroupId', () => {
    it('should delete topics by groupId', async () => {
      const groupId = 'test-group-delete';
      await serverDB.insert(chatGroups).values({ id: groupId, name: 'Test Group', userId });

      await topicModel.create({ title: 'Group Topic 1', groupId });
      await topicModel.create({ title: 'Group Topic 2', groupId });
      await topicModel.create({ title: 'No Group Topic' });

      await topicModel.batchDeleteByGroupId(groupId);

      const remaining = await serverDB.query.topics.findMany({
        where: eq(topics.userId, userId),
      });
      expect(remaining).toHaveLength(1);
      expect(remaining[0].title).toBe('No Group Topic');
    });
  });

  describe('duplicate', () => {
    it('should duplicate a topic', async () => {
      const original = await topicModel.create({
        title: 'Original Topic',
        favorite: true,
        metadata: { customField: 'value' },
      });

      const result = await topicModel.duplicate(original.id);

      expect(result.topic.id).not.toBe(original.id);
      expect(result.topic.title).toBe('Original Topic');
      expect(result.topic.favorite).toBe(true);
      expect(result.topic.metadata).toEqual({ customField: 'value' });
    });

    it('should duplicate with new title', async () => {
      const original = await topicModel.create({ title: 'Original Topic' });

      const result = await topicModel.duplicate(original.id, 'Duplicated Topic');

      expect(result.topic.title).toBe('Duplicated Topic');
    });

    it('should duplicate topic with messages', async () => {
      const topic = await topicModel.create({ title: 'Topic with Messages' });

      const msg1 = await serverDB
        .insert(messages)
        .values({ content: 'Message 1', role: 'user', userId, topicId: topic.id })
        .returning();
      const msg2 = await serverDB
        .insert(messages)
        .values({
          content: 'Message 2',
          role: 'assistant',
          userId,
          topicId: topic.id,
          parentId: msg1[0].id,
        })
        .returning();

      const result = await topicModel.duplicate(topic.id);

      expect(result.messages).toHaveLength(2);
      expect(result.messages[0].id).not.toBe(msg1[0].id);
      expect(result.messages[1].id).not.toBe(msg2[0].id);
      expect(result.messages[0].content).toBe('Message 1');
      expect(result.messages[1].content).toBe('Message 2');
      expect(result.messages[1].parentId).toBe(result.messages[0].id);
    });

    it('should throw error for non-existent topic', async () => {
      await expect(topicModel.duplicate('non-existent-id')).rejects.toThrow();
    });
  });

  describe('getCronTopicsGroupedByCronJob', () => {
    beforeEach(async () => {
      await serverDB.delete(topics);
    });

    it('should group cron topics by cronJobId', async () => {
      const agentId = 'test-agent-cron';
      await serverDB.insert(agents).values({ id: agentId, userId });

      await topicModel.create({
        title: 'Cron Topic 1',
        agentId,
        trigger: 'cron',
        metadata: { cronJobId: 'job-1' },
      });
      await topicModel.create({
        title: 'Cron Topic 2',
        agentId,
        trigger: 'cron',
        metadata: { cronJobId: 'job-1' },
      });
      await topicModel.create({
        title: 'Cron Topic 3',
        agentId,
        trigger: 'cron',
        metadata: { cronJobId: 'job-2' },
      });

      const result = await topicModel.getCronTopicsGroupedByCronJob(agentId);

      expect(result).toHaveLength(2);
      const job1Group = result.find((g) => g.cronJobId === 'job-1');
      const job2Group = result.find((g) => g.cronJobId === 'job-2');

      expect(job1Group?.topics).toHaveLength(2);
      expect(job2Group?.topics).toHaveLength(1);
    });

    it('should only return cron topics', async () => {
      const agentId = 'test-agent-cron-filter';
      await serverDB.insert(agents).values({ id: agentId, userId });

      await topicModel.create({
        title: 'Cron Topic',
        agentId,
        trigger: 'cron',
        metadata: { cronJobId: 'job-1' },
      });
      await topicModel.create({
        title: 'Chat Topic',
        agentId,
        trigger: 'chat',
        metadata: { cronJobId: 'job-1' },
      });

      const result = await topicModel.getCronTopicsGroupedByCronJob(agentId);

      expect(result).toHaveLength(1);
      expect(result[0].topics).toHaveLength(1);
      expect(result[0].topics[0].title).toBe('Cron Topic');
    });
  });
});
