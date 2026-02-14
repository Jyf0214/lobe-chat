import { and, asc, desc, eq } from 'drizzle-orm';

import {
  type AgentEvalRunTopicItem,
  type NewAgentEvalRunTopic,
  agentEvalRunTopics,
  agentEvalRuns,
  agentEvalTestCases,
  topics,
} from '../../schemas';
import { LobeChatDatabase } from '../../type';

export class AgentEvalRunTopicModel {
  private userId: string;
  private db: LobeChatDatabase;

  constructor(db: LobeChatDatabase, userId: string) {
    this.db = db;
    this.userId = userId;
  }

  /**
   * Batch create run-topic associations
   */
  batchCreate = async (items: NewAgentEvalRunTopic[]) => {
    if (items.length === 0) return [];
    return this.db.insert(agentEvalRunTopics).values(items).returning();
  };

  /**
   * Find all topics for a run (with TestCase and Topic details)
   */
  findByRunId = async (runId: string) => {
    const rows = await this.db
      .select({
        createdAt: agentEvalRunTopics.createdAt,
        evalResult: agentEvalRunTopics.evalResult,
        passed: agentEvalRunTopics.passed,
        runId: agentEvalRunTopics.runId,
        score: agentEvalRunTopics.score,
        testCase: agentEvalTestCases,
        testCaseId: agentEvalRunTopics.testCaseId,
        topic: topics,
        topicId: agentEvalRunTopics.topicId,
      })
      .from(agentEvalRunTopics)
      .leftJoin(agentEvalTestCases, eq(agentEvalRunTopics.testCaseId, agentEvalTestCases.id))
      .leftJoin(topics, eq(agentEvalRunTopics.topicId, topics.id))
      .where(eq(agentEvalRunTopics.runId, runId))
      .orderBy(asc(agentEvalRunTopics.createdAt));

    return rows;
  };

  /**
   * Delete all run-topic associations for a run
   */
  deleteByRunId = async (runId: string) => {
    return this.db.delete(agentEvalRunTopics).where(eq(agentEvalRunTopics.runId, runId));
  };

  /**
   * Find all runs that used a specific test case
   */
  findByTestCaseId = async (testCaseId: string) => {
    const rows = await this.db
      .select({
        createdAt: agentEvalRunTopics.createdAt,
        evalResult: agentEvalRunTopics.evalResult,
        passed: agentEvalRunTopics.passed,
        run: agentEvalRuns,
        runId: agentEvalRunTopics.runId,
        score: agentEvalRunTopics.score,
        testCaseId: agentEvalRunTopics.testCaseId,
        topic: topics,
        topicId: agentEvalRunTopics.topicId,
      })
      .from(agentEvalRunTopics)
      .leftJoin(agentEvalRuns, eq(agentEvalRunTopics.runId, agentEvalRuns.id))
      .leftJoin(topics, eq(agentEvalRunTopics.topicId, topics.id))
      .where(eq(agentEvalRunTopics.testCaseId, testCaseId))
      .orderBy(desc(agentEvalRunTopics.createdAt));

    return rows;
  };

  /**
   * Find a specific run-topic association by run and test case
   */
  findByRunAndTestCase = async (runId: string, testCaseId: string) => {
    const [row] = await this.db
      .select({
        createdAt: agentEvalRunTopics.createdAt,
        evalResult: agentEvalRunTopics.evalResult,
        passed: agentEvalRunTopics.passed,
        runId: agentEvalRunTopics.runId,
        score: agentEvalRunTopics.score,
        testCase: agentEvalTestCases,
        testCaseId: agentEvalRunTopics.testCaseId,
        topic: topics,
        topicId: agentEvalRunTopics.topicId,
      })
      .from(agentEvalRunTopics)
      .leftJoin(agentEvalTestCases, eq(agentEvalRunTopics.testCaseId, agentEvalTestCases.id))
      .leftJoin(topics, eq(agentEvalRunTopics.topicId, topics.id))
      .where(
        and(
          eq(agentEvalRunTopics.runId, runId),
          eq(agentEvalRunTopics.testCaseId, testCaseId),
        ),
      )
      .limit(1);

    return row;
  };

  /**
   * Update a RunTopic by composite key (runId + topicId)
   */
  updateByRunAndTopic = async (
    runId: string,
    topicId: string,
    value: Pick<Partial<AgentEvalRunTopicItem>, 'evalResult' | 'passed' | 'score'>,
  ) => {
    const [result] = await this.db
      .update(agentEvalRunTopics)
      .set(value)
      .where(
        and(eq(agentEvalRunTopics.runId, runId), eq(agentEvalRunTopics.topicId, topicId)),
      )
      .returning();
    return result;
  };
}
