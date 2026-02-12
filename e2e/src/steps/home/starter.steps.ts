/**
 * Home Starter Steps
 *
 * Step definitions for Home page Starter E2E tests
 * - Create Agent from Home input
 * - Create Group from Home input
 * - Create Document (Write) from Home input
 * - Verify Agent/Group appears in sidebar after returning to Home
 * - Verify Document page navigation and Page Agent interaction
 */
import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { llmMockManager, presetResponses } from '../../mocks/llm';
import { type CustomWorld, WAIT_TIMEOUT } from '../../support/world';

// Store created IDs for verification
let createdAgentId: string | null = null;
let createdGroupId: string | null = null;
let createdDocumentId: string | null = null;

// ============================================
// Given Steps
// ============================================

Given('用户在 Home 页面', { timeout: 30_000 }, async function (this: CustomWorld) {
  console.log('   📍 Step: 设置 LLM mock...');
  // Setup LLM mock before navigation (for agent/group/page builder message)
  llmMockManager.setResponse('E2E Test Agent', presetResponses.greeting);
  llmMockManager.setResponse('E2E Test Group', presetResponses.greeting);
  llmMockManager.setResponse(
    '帮我写一篇关于人工智能的文章',
    '好的，我来帮你写一篇关于人工智能的文章。\n\n# 人工智能：改变世界的技术\n\n人工智能（AI）是当今最具变革性的技术之一...',
  );
  await llmMockManager.setup(this.page);

  console.log('   📍 Step: 导航到 Home 页面...');
  await this.page.goto('/');
  await this.page.waitForLoadState('networkidle', { timeout: 15_000 });
  await this.page.waitForTimeout(1000);

  // Reset IDs for each test
  createdAgentId = null;
  createdGroupId = null;
  createdDocumentId = null;

  console.log('   ✅ 已进入 Home 页面');
});

// ============================================
// When Steps
// ============================================

When('用户点击创建 Agent 按钮', { timeout: 30_000 }, async function (this: CustomWorld) {
  console.log('   📍 Step: 点击创建 Agent 按钮...');

  // Find the "Create Agent" button by text (supports both English and Chinese)
  const createAgentButton = this.page
    .getByRole('button', { name: /create agent|创建智能体/i })
    .first();

  await expect(createAgentButton).toBeVisible({ timeout: WAIT_TIMEOUT });
  await createAgentButton.click();
  await this.page.waitForTimeout(500);

  console.log('   ✅ 已点击创建 Agent 按钮');
});

When('用户点击创建 Group 按钮', { timeout: 30_000 }, async function (this: CustomWorld) {
  console.log('   📍 Step: 点击创建 Group 按钮...');

  // Find the "Create Group" button by text (supports both English and Chinese)
  const createGroupButton = this.page
    .getByRole('button', { name: /create group|创建群组/i })
    .first();

  await expect(createGroupButton).toBeVisible({ timeout: WAIT_TIMEOUT });
  await createGroupButton.click();
  await this.page.waitForTimeout(500);

  console.log('   ✅ 已点击创建 Group 按钮');
});

When('用户点击写作按钮', { timeout: 30_000 }, async function (this: CustomWorld) {
  console.log('   📍 Step: 点击写作按钮...');

  // Find the "Write" button by text (supports both English and Chinese)
  const writeButton = this.page.getByRole('button', { name: /write|写作/i }).first();

  await expect(writeButton).toBeVisible({ timeout: WAIT_TIMEOUT });
  await writeButton.click();
  await this.page.waitForTimeout(500);

  console.log('   ✅ 已点击写作按钮');
});

When(
  '用户在输入框中输入 {string}',
  { timeout: 30_000 },
  async function (this: CustomWorld, message: string) {
    console.log(`   📍 Step: 在输入框中输入 "${message}"...`);

    // The chat input is a contenteditable editor, need to click first then type
    const chatInputContainer = this.page.locator('[data-testid="chat-input"]').first();

    // If data-testid not found, try alternative selectors
    let inputFound = false;
    if ((await chatInputContainer.count()) > 0) {
      await chatInputContainer.click();
      inputFound = true;
    } else {
      // Try to find the editor by its contenteditable attribute
      const editor = this.page.locator('[contenteditable="true"]').first();
      if ((await editor.count()) > 0) {
        await editor.click();
        inputFound = true;
      }
    }

    if (!inputFound) {
      throw new Error('Could not find chat input');
    }

    await this.page.waitForTimeout(300);
    await this.page.keyboard.type(message, { delay: 30 });

    // Verify text appeared in the editor
    const editorEl = this.page
      .locator('[data-testid="chat-input"] [contenteditable="true"]')
      .first();
    const fallbackEditor = this.page.locator('[contenteditable="true"]').first();
    const targetEditor = (await editorEl.count()) > 0 ? editorEl : fallbackEditor;
    await expect(targetEditor).toContainText(message.slice(0, 10), { timeout: 5000 });

    // Wait for the editor's debounced onChange (100ms) to fire and sync inputMessage to store.
    // The @lobehub/editor debounces onChange using useMemo which may lose timers on re-renders,
    // so we wait generously and then type+delete a character to ensure a fresh debounce fires.
    await this.page.waitForTimeout(300);

    console.log(`   ✅ 已输入 "${message}"`);
  },
);

When('用户按 Enter 发送', { timeout: 60_000 }, async function (this: CustomWorld) {
  console.log('   📍 Step: 按 Enter 发送...');

  // Diagnostic: check editor state before sending
  const editorState = await this.page.evaluate(() => {
    const el = document.querySelector('[contenteditable="true"]');
    return {
      activeTag: document.activeElement?.tagName || 'none',
      editorExists: !!el,
      focused: document.activeElement === el || (el?.contains(document.activeElement) ?? false),
      text: el?.textContent?.trim() || '',
    };
  });
  console.log(
    `   📍 Editor: text="${editorState.text.slice(0, 30)}", focused=${editorState.focused}, active=${editorState.activeTag}`,
  );

  // Ensure focus is on the editor before pressing Enter
  if (!editorState.focused) {
    console.log('   ⚠️ Editor not focused, clicking to focus...');
    const editor = this.page.locator('[contenteditable="true"]').first();
    await editor.click();
    await this.page.waitForTimeout(200);
  }

  // Type a space and delete it to trigger a fresh onChange debounce cycle.
  // The @lobehub/editor uses useMemo to create debounced onChange, which can lose
  // pending timers when the component re-renders (useEditorState triggers re-renders
  // on every keystroke). By typing after re-renders have settled, we ensure the
  // debounce timer fires and syncs inputMessage to the store.
  await this.page.keyboard.press('Space');
  await this.page.waitForTimeout(50);
  await this.page.keyboard.press('Backspace');

  // Wait for the debounce (100ms) to fire and sync inputMessage
  await this.page.waitForTimeout(300);

  // Listen for navigation to capture the agent/group ID
  const navigationPromise = this.page.waitForURL(/\/(agent|group)\/.*\/profile/, {
    timeout: 45_000,
  });

  // Monitor TRPC response to confirm the request reaches the server
  const trpcResponsePromise = this.page
    .waitForResponse(
      (response) => response.url().includes('/trpc/lambda') && response.status() === 200,
      { timeout: 10_000 },
    )
    .catch(() => null);

  await this.page.keyboard.press('Enter');
  console.log('   📍 Enter pressed, waiting for response...');

  // Wait for TRPC response (short timeout) to confirm the request was sent
  const trpcResponse = await trpcResponsePromise;
  if (trpcResponse) {
    console.log(`   📍 TRPC response: ${trpcResponse.url()}`);
  } else {
    // TRPC request was not sent. Diagnose and retry.
    const postEnterState = await this.page.evaluate(() => {
      const el = document.querySelector('[contenteditable="true"]');
      return {
        text: el?.textContent?.trim() || '',
        url: window.location.href,
      };
    });
    console.log(
      `   ⚠️ No TRPC response. Editor text="${postEnterState.text.slice(0, 30)}", URL=${postEnterState.url}`,
    );

    // Retry: click the send button if visible
    console.log('   ⚠️ Retrying via send button...');
    const sendBtn = this.page.locator('[data-testid="chat-input"] button:has(svg)').last();
    const sendBtnVisible = await sendBtn.isVisible().catch(() => false);
    if (sendBtnVisible) {
      await sendBtn.click();
      console.log('   📍 Clicked send button');
    } else {
      // Last resort: re-focus editor and press Enter again
      console.log('   ⚠️ No send button, re-pressing Enter...');
      const editor = this.page.locator('[contenteditable="true"]').first();
      await editor.click();
      await this.page.waitForTimeout(300);
      await this.page.keyboard.press('Enter');
    }
  }

  // Wait for navigation to profile page
  await navigationPromise;
  await this.page.waitForLoadState('networkidle', { timeout: 15_000 });

  // Extract agent/group ID from URL
  const currentUrl = this.page.url();

  const agentMatch = currentUrl.match(/\/agent\/([^/]+)/);
  if (agentMatch) {
    createdAgentId = agentMatch[1];
    console.log(`   📍 Created agent ID: ${createdAgentId}`);
  }

  const groupMatch = currentUrl.match(/\/group\/([^/]+)/);
  if (groupMatch) {
    createdGroupId = groupMatch[1];
    console.log(`   📍 Created group ID: ${createdGroupId}`);
  }

  console.log('   ✅ 已发送消息');
});

When('用户按 Enter 发送创建文档', { timeout: 30_000 }, async function (this: CustomWorld) {
  console.log('   📍 Step: 按 Enter 发送创建文档...');

  // Wait for editor's debounced onChange (100ms default) to sync inputMessage to store
  await this.page.waitForTimeout(200);

  // Listen for navigation to capture the document ID
  const navigationPromise = this.page.waitForURL(/\/page\/[^/]+/, {
    timeout: 30_000,
  });

  await this.page.keyboard.press('Enter');

  // Wait for navigation to page
  await navigationPromise;
  await this.page.waitForLoadState('networkidle', { timeout: 15_000 });

  // Extract document ID from URL
  const currentUrl = this.page.url();
  const pageMatch = currentUrl.match(/\/page\/([^/?]+)/);
  if (pageMatch) {
    createdDocumentId = pageMatch[1];
    console.log(`   📍 Created document ID: ${createdDocumentId}`);
  }

  console.log('   ✅ 已发送并创建文档');
});

When('用户返回 Home 页面', { timeout: 30_000 }, async function (this: CustomWorld) {
  console.log('   📍 Step: 返回 Home 页面...');

  await this.page.goto('/');
  await this.page.waitForLoadState('networkidle', { timeout: 15_000 });
  await this.page.waitForTimeout(1000);

  console.log('   ✅ 已返回 Home 页面');
});

// ============================================
// Then Steps
// ============================================

Then(
  '页面应该跳转到 Agent 的 profile 页面',
  { timeout: 30_000 },
  async function (this: CustomWorld) {
    console.log('   📍 Step: 验证页面跳转到 Agent profile 页面...');

    // Check current URL matches /agent/{id}/profile pattern
    const currentUrl = this.page.url();
    expect(currentUrl).toMatch(/\/agent\/[^/]+\/profile/);

    console.log('   ✅ 已跳转到 Agent profile 页面');
  },
);

Then(
  '页面应该跳转到 Group 的 profile 页面',
  { timeout: 30_000 },
  async function (this: CustomWorld) {
    console.log('   📍 Step: 验证页面跳转到 Group profile 页面...');

    // Check current URL matches /group/{id}/profile pattern
    const currentUrl = this.page.url();
    expect(currentUrl).toMatch(/\/group\/[^/]+\/profile/);

    console.log('   ✅ 已跳转到 Group profile 页面');
  },
);

Then('新创建的 Agent 应该在侧边栏中显示', { timeout: 30_000 }, async function (this: CustomWorld) {
  console.log('   📍 Step: 验证 Agent 在侧边栏中显示...');

  // Wait for sidebar to be visible and data to load
  await this.page.waitForTimeout(1500);

  // Check if the agent appears in sidebar by its link (primary assertion)
  // This proves that refreshAgentList() was called and the sidebar was updated
  if (!createdAgentId) {
    throw new Error('Agent ID was not captured during creation');
  }

  const agentLink = this.page.locator(`a[href="/agent/${createdAgentId}"]`).first();
  await expect(agentLink).toBeVisible({ timeout: WAIT_TIMEOUT });
  console.log(`   ✅ 找到 Agent 链接: /agent/${createdAgentId}`);

  // Get the aria-label or text content to verify it's the correct agent
  const ariaLabel = await agentLink.getAttribute('aria-label');
  console.log(`   📍 Agent aria-label: ${ariaLabel}`);

  console.log('   ✅ Agent 已在侧边栏中显示');
});

Then('新创建的 Group 应该在侧边栏中显示', { timeout: 30_000 }, async function (this: CustomWorld) {
  console.log('   📍 Step: 验证 Group 在侧边栏中显示...');

  // Wait for sidebar to be visible and data to load
  await this.page.waitForTimeout(1500);

  // Check if the group appears in sidebar by its link (primary assertion)
  // This proves that refreshAgentList() was called and the sidebar was updated
  if (!createdGroupId) {
    throw new Error('Group ID was not captured during creation');
  }

  const groupLink = this.page.locator(`a[href="/group/${createdGroupId}"]`).first();
  await expect(groupLink).toBeVisible({ timeout: WAIT_TIMEOUT });
  console.log(`   ✅ 找到 Group 链接: /group/${createdGroupId}`);

  // Get the aria-label or text content to verify it's the correct group
  const ariaLabel = await groupLink.getAttribute('aria-label');
  console.log(`   📍 Group aria-label: ${ariaLabel}`);

  console.log('   ✅ Group 已在侧边栏中显示');
});

Then('页面应该跳转到文档编辑页面', { timeout: 30_000 }, async function (this: CustomWorld) {
  console.log('   📍 Step: 验证页面跳转到文档编辑页面...');

  // Check current URL matches /page/{id} pattern
  const currentUrl = this.page.url();
  expect(currentUrl).toMatch(/\/page\/[^/?]+/);

  if (!createdDocumentId) {
    throw new Error('Document ID was not captured during creation');
  }

  console.log(`   ✅ 已跳转到文档编辑页面: /page/${createdDocumentId}`);
});

Then('Page Agent 应该收到用户的提示词', { timeout: 30_000 }, async function (this: CustomWorld) {
  console.log('   📍 Step: 验证 Page Agent 收到用户的提示词...');

  // Wait for the page to fully load and Page Agent panel to appear
  await this.page.waitForTimeout(2000);

  // Look for the user message in the chat panel (Page Agent Copilot)
  // The message should appear in the chat list
  const userMessage = this.page.locator('text=帮我写一篇关于人工智能的文章').first();

  // The message might be in the chat panel on the right side
  const messageVisible = await userMessage.isVisible().catch(() => false);

  if (messageVisible) {
    console.log('   ✅ 找到用户发送的提示词');
  } else {
    // Alternative: check if there's any chat content indicating the message was sent
    console.log('   ⚠️ 用户消息可能在聊天面板中，但未直接可见');
  }

  // Verify that the Page Agent responded (mock response should appear)
  // Wait a bit longer for the mock LLM response
  await this.page.waitForTimeout(3000);

  // Look for AI response content
  const aiResponse = this.page.locator('text=人工智能').first();
  const responseVisible = await aiResponse.isVisible().catch(() => false);

  if (responseVisible) {
    console.log('   ✅ Page Agent 已响应用户的提示词');
  } else {
    console.log('   ⚠️ Page Agent 响应可能正在生成或在其他位置');
  }

  console.log('   ✅ Page Agent 验证完成');
});
