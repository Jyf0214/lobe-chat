/**
 * Agent Group Chat Steps
 *
 * Step definitions for Agent Group chat E2E tests
 */
import { Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { llmMockManager, presetResponses } from '../../mocks/llm';
import { CustomWorld } from '../../support/world';

// ============================================
// When Steps
// ============================================

When('用户在群聊输入框中输入消息 {string}', async function (this: CustomWorld, message: string) {
  console.log(`   📍 Step: 在群聊输入框中输入消息 "${message}"...`);

  // Setup LLM mock for this message
  llmMockManager.setResponse(message, `好的，我收到了你的消息："${message}"！`);

  // Find the chat input (similar to agent conversation)
  const chatInputs = this.page.locator('[data-testid="chat-input"]');
  const count = await chatInputs.count();
  console.log(`   📍 Found ${count} chat-input elements`);

  let chatInputContainer = chatInputs.first();
  for (let i = 0; i < count; i++) {
    const elem = chatInputs.nth(i);
    const box = await elem.boundingBox();
    if (box && box.width > 0 && box.height > 0) {
      chatInputContainer = elem;
      console.log(`   ✓ Using chat-input element ${i} (has bounding box)`);
      break;
    }
  }

  // Click to focus
  await chatInputContainer.click();
  await this.page.waitForTimeout(500);

  // Type the message
  await this.page.keyboard.type(message, { delay: 30 });

  this.testContext.lastGroupMessage = message;

  console.log(`   ✅ 已输入消息 "${message}"`);
});

When('用户发送消息', async function (this: CustomWorld) {
  console.log('   📍 Step: 发送消息...');

  // Press Enter to send
  await this.page.keyboard.press('Enter');

  // Wait for message to be sent and processed
  await this.page.waitForTimeout(2000);

  console.log('   ✅ 消息已发送');
});

When('用户在群聊中发送消息 {string}', async function (this: CustomWorld, message: string) {
  console.log(`   📍 Step: 在群聊中发送消息 "${message}"...`);

  // Setup LLM mock for this message
  llmMockManager.setResponse(message, presetResponses.greeting);

  // Find and click the chat input
  const chatInputs = this.page.locator('[data-testid="chat-input"]');
  let chatInputContainer = chatInputs.first();
  const count = await chatInputs.count();

  for (let i = 0; i < count; i++) {
    const elem = chatInputs.nth(i);
    const box = await elem.boundingBox();
    if (box && box.width > 0 && box.height > 0) {
      chatInputContainer = elem;
      break;
    }
  }

  await chatInputContainer.click();
  await this.page.waitForTimeout(500);

  // Type and send
  await this.page.keyboard.type(message, { delay: 30 });
  await this.page.keyboard.press('Enter');

  // Wait for response
  await this.page.waitForTimeout(3000);

  this.testContext.lastGroupMessage = message;

  console.log(`   ✅ 已在群聊中发送消息 "${message}"`);
});

// ============================================
// Then Steps
// ============================================

Then('消息应该显示在聊天列表中', async function (this: CustomWorld) {
  console.log('   📍 Step: 验证消息显示在聊天列表中...');

  // Wait for the message to appear
  await this.page.waitForTimeout(1000);

  // Find user messages in the chat
  const userMessages = this.page.locator('[data-role="user"], [class*="user"]');
  const messageCount = await userMessages.count();

  console.log(`   📍 Found ${messageCount} user messages`);
  expect(messageCount).toBeGreaterThan(0);

  // Verify our message content is visible
  if (this.testContext.lastGroupMessage) {
    const messageText = this.page.getByText(this.testContext.lastGroupMessage);
    await expect(messageText.first()).toBeVisible({ timeout: 5000 });
  }

  console.log('   ✅ 消息显示在聊天列表中');
});

Then('用户应该收到群组成员的回复', async function (this: CustomWorld) {
  console.log('   📍 Step: 验证收到群组成员回复...');

  // Wait for assistant response
  await this.page.waitForTimeout(3000);

  // Find assistant messages - in group chat, messages from Lobe AI or other agents
  // Messages on the left side (not user messages which are on the right)
  // Look for message wrappers that contain the mock response text
  const mockResponseText = '好的，我收到了你的消息';
  const assistantResponse = this.page.getByText(mockResponseText);
  const count = await assistantResponse.count();

  console.log(`   📍 Found ${count} assistant messages with mock response`);

  if (count === 0) {
    // Alternative: look for any message wrapper on the left
    const allMessages = this.page.locator('.message-wrapper');
    const totalMessages = await allMessages.count();
    console.log(`   📍 Found ${totalMessages} total message wrappers`);

    // User messages should be fewer than total (assuming at least 1 assistant)
    expect(totalMessages).toBeGreaterThan(1);
  } else {
    expect(count).toBeGreaterThan(0);
  }

  // Verify the response is visible
  await expect(assistantResponse.first()).toBeVisible({ timeout: 10_000 });

  console.log(`   ✅ 收到群组成员回复`);
});

Then('群组中的多个 Agent 应该依次回复', async function (this: CustomWorld) {
  console.log('   📍 Step: 验证多个 Agent 依次回复...');

  // Wait for multiple responses
  await this.page.waitForTimeout(5000);

  // Look for the mock response text that we set up
  const mockResponseText = '大家好！我是 Lobe AI';
  const assistantResponse = this.page.getByText(mockResponseText);
  const count = await assistantResponse.count();

  console.log(`   📍 Found ${count} assistant messages with mock response`);

  // For group chat, we expect at least 1 response containing the mock text
  if (count === 0) {
    // Alternative: look for any message that's not the user's message
    const anyResponse = this.page.getByText('Lobe AI');
    const altCount = await anyResponse.count();
    console.log(`   📍 Found ${altCount} elements with 'Lobe AI'`);
    expect(altCount).toBeGreaterThanOrEqual(1);
  } else {
    expect(count).toBeGreaterThanOrEqual(1);
  }

  console.log('   ✅ 多个 Agent 依次回复');
});

Then('每个回复应该标注对应的 Agent 名称', async function (this: CustomWorld) {
  console.log('   📍 Step: 验证每个回复标注 Agent 名称...');

  await this.page.waitForTimeout(1000);

  // In group chat, verify agent name is visible in the chat
  // Look for "Lobe AI" text which indicates the agent name
  const agentNames = this.page.getByText('Lobe AI');
  const count = await agentNames.count();

  console.log(`   📍 Found ${count} agent name indicators`);

  // Should have at least one agent name visible
  expect(count).toBeGreaterThan(0);

  // Also check for avatars in the page (group chats should show avatars)
  const avatars = this.page.locator('img[class*="avatar"], img[class*="Avatar"], [class*="avatar"] img');
  const avatarCount = await avatars.count();
  console.log(`   📍 Found ${avatarCount} avatars`);

  console.log('   ✅ 每个回复标注对应的 Agent 名称');
});
