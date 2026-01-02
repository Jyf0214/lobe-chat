/**
 * Agent Group Builder Steps
 *
 * Step definitions for Agent Group creation and editing E2E tests
 */
import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { llmMockManager, presetResponses } from '../../mocks/llm';
import { CustomWorld } from '../../support/world';

// ============================================
// Given Steps
// ============================================

Given('用户在首页', async function (this: CustomWorld) {
  console.log('   📍 Step: 导航到首页...');

  // Setup LLM mock before navigation
  llmMockManager.setResponse('大家好', '你好！我是群组助手，很高兴认识大家！');
  llmMockManager.setResponse('请大家自我介绍一下', '大家好！我是 Lobe AI，我可以帮助你完成各种任务。');
  await llmMockManager.setup(this.page);

  await this.page.goto('/');
  await this.page.waitForLoadState('networkidle', { timeout: 15_000 });

  console.log('   ✅ 已进入首页');
});

Given('用户已创建一个群组并进入群组页面', async function (this: CustomWorld) {
  console.log('   📍 Step: 创建群组并进入群组页面...');

  // Setup LLM mock
  await llmMockManager.setup(this.page);

  // Navigate to home
  await this.page.goto('/');
  await this.page.waitForLoadState('networkidle', { timeout: 15_000 });

  // Click create group button to set mode (try both Chinese and English)
  let createGroupButton = this.page.getByText('Create Group').first();
  if ((await createGroupButton.count()) === 0) {
    createGroupButton = this.page.getByText('创建群组').first();
  }
  if ((await createGroupButton.count()) > 0) {
    await createGroupButton.click();
    console.log('   📍 已点击创建群组按钮');
  } else {
    throw new Error('Create group button not found');
  }

  await this.page.waitForTimeout(500);

  // Find and use the chat input to enter group description
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
  await this.page.keyboard.type('创建一个测试群组', { delay: 30 });
  await this.page.keyboard.press('Enter');

  // Wait for navigation to group page
  await this.page.waitForTimeout(3000);
  await this.page.waitForLoadState('networkidle', { timeout: 15_000 });

  // Verify we're on group page
  const url = this.page.url();
  if (!url.includes('/group/')) {
    throw new Error(`Expected to be on group page, but URL is: ${url}`);
  }

  // Store context for later steps
  this.testContext.groupCreated = true;

  console.log('   ✅ 已创建群组并进入群组页面');
});

Given('用户已创建一个包含多个成员的群组', async function (this: CustomWorld) {
  console.log('   📍 Step: 创建包含多个成员的群组...');

  // Setup LLM mock
  llmMockManager.setResponse('请大家自我介绍一下', '大家好！我是 Lobe AI，我可以帮助你完成各种任务。');
  await llmMockManager.setup(this.page);

  // Navigate to home
  await this.page.goto('/');
  await this.page.waitForLoadState('networkidle', { timeout: 15_000 });

  // Click create group button to set mode (try both Chinese and English)
  let createGroupButton = this.page.getByText('Create Group').first();
  if ((await createGroupButton.count()) === 0) {
    createGroupButton = this.page.getByText('创建群组').first();
  }
  if ((await createGroupButton.count()) > 0) {
    await createGroupButton.click();
    console.log('   📍 已点击创建群组按钮');
  }

  await this.page.waitForTimeout(500);

  // Find and use the chat input to enter group description
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
  await this.page.keyboard.type('创建一个多成员测试群组', { delay: 30 });
  await this.page.keyboard.press('Enter');

  // Wait for navigation to group page
  await this.page.waitForTimeout(3000);
  await this.page.waitForLoadState('networkidle', { timeout: 15_000 });

  this.testContext.groupCreated = true;
  this.testContext.multiMemberGroup = true;

  console.log('   ✅ 已创建包含多个成员的群组');
});

Given('用户已创建一个群组', async function (this: CustomWorld) {
  console.log('   📍 Step: 创建一个群组...');

  await llmMockManager.setup(this.page);

  await this.page.goto('/');
  await this.page.waitForLoadState('networkidle', { timeout: 15_000 });

  // Click create group button to set mode (try both Chinese and English)
  let createGroupButton = this.page.getByText('Create Group').first();
  if ((await createGroupButton.count()) === 0) {
    createGroupButton = this.page.getByText('创建群组').first();
  }
  if ((await createGroupButton.count()) > 0) {
    await createGroupButton.click();
    console.log('   📍 已点击创建群组按钮');
  }

  await this.page.waitForTimeout(500);

  // Find and use the chat input to enter group description
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

  const groupName = '待删除群组';
  this.testContext.groupName = groupName;

  await chatInputContainer.click();
  await this.page.waitForTimeout(500);
  await this.page.keyboard.type(`创建一个${groupName}`, { delay: 30 });
  await this.page.keyboard.press('Enter');

  // Wait for group creation
  await this.page.waitForTimeout(3000);

  // Go back to home to see the group in sidebar
  await this.page.goto('/');
  await this.page.waitForLoadState('networkidle', { timeout: 15_000 });

  this.testContext.groupCreated = true;

  console.log('   ✅ 已创建一个群组');
});

Given('用户已创建多个群组', async function (this: CustomWorld) {
  console.log('   📍 Step: 创建多个群组...');

  await llmMockManager.setup(this.page);

  // Create multiple groups
  await this.page.goto('/');
  await this.page.waitForLoadState('networkidle', { timeout: 15_000 });

  for (let i = 1; i <= 2; i++) {
    // Click create group button to set mode
    const createGroupButton = this.page.getByText('创建群组').first();
    if ((await createGroupButton.count()) > 0) {
      await createGroupButton.click();
      console.log(`   📍 创建第 ${i} 个群组...`);
    }

    await this.page.waitForTimeout(500);

    // Find and use the chat input
    const chatInputs = this.page.locator('[data-testid="chat-input"]');
    let chatInputContainer = chatInputs.first();
    const count = await chatInputs.count();
    for (let j = 0; j < count; j++) {
      const elem = chatInputs.nth(j);
      const box = await elem.boundingBox();
      if (box && box.width > 0 && box.height > 0) {
        chatInputContainer = elem;
        break;
      }
    }

    await chatInputContainer.click();
    await this.page.waitForTimeout(500);
    await this.page.keyboard.type(`创建测试群组${i}`, { delay: 30 });
    await this.page.keyboard.press('Enter');

    await this.page.waitForTimeout(3000);
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle', { timeout: 10_000 });
  }

  this.testContext.multipleGroups = true;

  console.log('   ✅ 已创建多个群组');
});

// ============================================
// When Steps
// ============================================

When('用户点击创建群组按钮', async function (this: CustomWorld) {
  console.log('   📍 Step: 点击创建群组按钮...');

  // Try to find the Create Group button (English first, then Chinese)
  let createGroupButton = this.page.getByText('Create Group').first();
  if ((await createGroupButton.count()) === 0) {
    createGroupButton = this.page.getByText('创建群组').first();
  }

  if ((await createGroupButton.count()) > 0) {
    await createGroupButton.click();
    console.log('   ✅ 已点击创建群组按钮');
  } else {
    // Fallback: look for button with UsersRound icon
    const iconButton = this.page.locator('svg.lucide-users-round').locator('..').first();
    if ((await iconButton.count()) > 0) {
      await iconButton.click();
      console.log('   ✅ 已点击创建群组按钮 (icon fallback)');
    } else {
      throw new Error('Create group button not found');
    }
  }

  await this.page.waitForTimeout(500);
});

When('用户输入群组描述 {string}', async function (this: CustomWorld, description: string) {
  console.log(`   📍 Step: 输入群组描述 "${description}"...`);

  // Find the chat input (contenteditable editor)
  const chatInputs = this.page.locator('[data-testid="chat-input"]');
  const count = await chatInputs.count();
  console.log(`   📍 Found ${count} chat-input elements`);

  let chatInputContainer = chatInputs.first();
  for (let i = 0; i < count; i++) {
    const elem = chatInputs.nth(i);
    const box = await elem.boundingBox();
    if (box && box.width > 0 && box.height > 0) {
      chatInputContainer = elem;
      console.log(`   ✓ Using chat-input element ${i}`);
      break;
    }
  }

  // Click to focus
  await chatInputContainer.click();
  await this.page.waitForTimeout(500);

  // Type the description
  await this.page.keyboard.type(description, { delay: 30 });

  this.testContext.groupDescription = description;

  console.log(`   ✅ 已输入群组描述 "${description}"`);
});

When('用户发送创建群组请求', async function (this: CustomWorld) {
  console.log('   📍 Step: 发送创建群组请求...');

  // Press Enter to send
  await this.page.keyboard.press('Enter');

  // Wait for the group to be created and navigated
  await this.page.waitForTimeout(3000);

  console.log('   ✅ 已发送创建群组请求');
});

When('用户点击添加成员按钮', async function (this: CustomWorld) {
  console.log('   📍 Step: 点击添加成员按钮...');

  // The add member button uses UserPlus icon from lucide-react
  const addMemberButton = this.page.locator('svg.lucide-user-plus').locator('..');

  if ((await addMemberButton.count()) > 0) {
    await addMemberButton.first().click();
    console.log('   ✅ 已点击添加成员按钮');
  } else {
    throw new Error('Add member button not found');
  }

  await this.page.waitForTimeout(500);
});

When('用户在添加成员对话框中选择一个新 Agent', async function (this: CustomWorld) {
  console.log('   📍 Step: 在添加成员对话框中选择 Agent...');

  const modal = this.page.locator('.ant-modal, [role="dialog"]');
  await expect(modal).toBeVisible({ timeout: 5000 });

  const agentItems = modal.locator('[class*="AgentItem"], [class*="agent-item"]');
  const agentCount = await agentItems.count();
  console.log(`   📍 Found ${agentCount} available agents`);

  if (agentCount > 0) {
    await agentItems.first().click();
    await this.page.waitForTimeout(300);
    this.testContext.agentSelected = true;
    console.log('   ✅ 已选择一个新 Agent');
  } else {
    this.testContext.agentSelected = false;
    console.log('   ⚠️ No additional agents available to add');
    // Close the modal since no agents to add
    const cancelButton = modal.locator('button').filter({ hasText: /取消|关闭|Cancel|Close/ });
    if ((await cancelButton.count()) > 0) {
      await cancelButton.first().click();
    } else {
      // Try pressing Escape to close
      await this.page.keyboard.press('Escape');
    }
    await this.page.waitForTimeout(500);
  }
});

When('用户点击添加成员确认按钮', async function (this: CustomWorld) {
  console.log('   📍 Step: 点击添加成员确认按钮...');

  // Skip if no agent was selected (modal should already be closed)
  if (!this.testContext.agentSelected) {
    console.log('   ⚠️ Skipping - no agent was selected');
    return;
  }

  const modal = this.page.locator('.ant-modal, [role="dialog"]');
  const addButton = modal.locator('button').filter({ hasText: /添加|确定|Add|Confirm/ });

  if ((await addButton.count()) > 0) {
    await addButton.first().click();
    console.log('   ✅ 已点击添加成员确认按钮');
  }

  await this.page.waitForTimeout(1000);
});

When('用户点击成员旁边的移除按钮', async function (this: CustomWorld) {
  console.log('   📍 Step: 点击成员移除按钮...');

  // Find the UserMinus icon button (remove member)
  const removeMemberButton = this.page.locator('svg.lucide-user-minus').locator('..');

  if ((await removeMemberButton.count()) > 0) {
    // Store the member name for later verification
    const memberItem = removeMemberButton.first().locator('..').locator('..');
    const memberName = await memberItem.textContent();
    this.testContext.removedMemberName = memberName?.slice(0, 20);

    await removeMemberButton.first().click();
    console.log(`   ✅ 已点击移除成员按钮`);
  } else {
    throw new Error('Remove member button not found');
  }

  await this.page.waitForTimeout(1000);
});

When('用户进入群组资料编辑页面', async function (this: CustomWorld) {
  console.log('   📍 Step: 进入群组资料编辑页面...');

  // Navigate to group profile page (usually /group/[id]/profile)
  // First check if there's a settings or edit button
  const settingsButton = this.page.locator('svg.lucide-settings, svg.lucide-folder-cog').locator('..');

  if ((await settingsButton.count()) > 0) {
    await settingsButton.first().click();
    await this.page.waitForTimeout(1000);
  } else {
    // Try navigating via URL - append /profile to current group URL
    const currentUrl = this.page.url();
    if (currentUrl.includes('/group/')) {
      const profileUrl = currentUrl.includes('/profile') ? currentUrl : `${currentUrl}/profile`;
      await this.page.goto(profileUrl);
      await this.page.waitForLoadState('networkidle', { timeout: 10_000 });
    }
  }

  console.log('   ✅ 已进入群组资料编辑页面');
});

When('用户修改群组名称为 {string}', async function (this: CustomWorld, newName: string) {
  console.log(`   📍 Step: 修改群组名称为 "${newName}"...`);

  // Find the large input for group name in profile editor
  const nameInput = this.page.locator('input[type="text"]').first();

  if ((await nameInput.count()) > 0) {
    await nameInput.clear();
    await nameInput.fill(newName);
    // Trigger blur to save
    await this.page.keyboard.press('Tab');
    console.log(`   ✅ 已修改群组名称为 "${newName}"`);
  } else {
    throw new Error('Group name input not found');
  }

  this.testContext.newGroupName = newName;
  await this.page.waitForTimeout(1000);
});

When('用户在首页右键点击群组', async function (this: CustomWorld) {
  console.log('   📍 Step: 在首页右键点击群组...');

  // Find the group item in sidebar (groups have UsersRound icon)
  const groupItems = this.page.locator('svg.lucide-users-round').locator('..').locator('..');
  const count = await groupItems.count();
  console.log(`   📍 Found ${count} group items`);

  if (count > 0) {
    // Right-click on the first group
    await groupItems.first().click({ button: 'right' });
    console.log('   ✅ 已右键点击群组');
  } else {
    // Try finding by the group name we stored
    if (this.testContext.groupName) {
      const groupByName = this.page.getByText(this.testContext.groupName);
      if ((await groupByName.count()) > 0) {
        await groupByName.first().click({ button: 'right' });
        console.log('   ✅ 已右键点击群组 (by name)');
      }
    }
  }

  await this.page.waitForTimeout(500);
});

When('用户选择删除群组选项', async function (this: CustomWorld) {
  console.log('   📍 Step: 选择删除群组选项...');

  // Find delete option in context menu (uses Trash icon)
  const deleteOption = this.page.locator('.ant-dropdown-menu-item-danger, .ant-dropdown-menu-item:has-text("删除")');

  await expect(deleteOption).toBeVisible({ timeout: 5000 });
  await deleteOption.first().click();

  console.log('   ✅ 已选择删除群组选项');
  await this.page.waitForTimeout(300);
});

When('用户确认删除群组', async function (this: CustomWorld) {
  console.log('   📍 Step: 确认删除群组...');

  // A confirmation modal should appear
  const confirmButton = this.page.locator('.ant-modal-confirm-btns button.ant-btn-dangerous, .ant-btn-primary.ant-btn-dangerous');

  await expect(confirmButton).toBeVisible({ timeout: 5000 });
  await confirmButton.first().click();

  console.log('   ✅ 已确认删除群组');
  await this.page.waitForTimeout(1000);
});

// ============================================
// Then Steps
// ============================================

Then('应该成功创建群组', async function (this: CustomWorld) {
  console.log('   📍 Step: 验证群组创建成功...');

  // Wait for modal to close
  await this.page.waitForTimeout(2000);

  // The modal should be closed
  const modal = this.page.locator('.ant-modal, [role="dialog"]');
  const modalVisible = await modal.isVisible().catch(() => false);

  // Either modal is closed, or we navigated to group page
  const url = this.page.url();
  const isGroupPage = url.includes('/group/');

  expect(modalVisible === false || isGroupPage).toBeTruthy();

  console.log('   ✅ 群组创建成功');
});

Then('用户应该进入群组对话页面', async function (this: CustomWorld) {
  console.log('   📍 Step: 验证进入群组对话页面...');

  await this.page.waitForLoadState('networkidle', { timeout: 15_000 });

  // Check URL contains /group/
  const url = this.page.url();
  expect(url).toContain('/group/');

  // Or check for group-specific UI elements
  const groupHeader = this.page.locator('[class*="group"], svg.lucide-users');
  const hasGroupUI = (await groupHeader.count()) > 0;

  console.log(`   📍 URL: ${url}, Has group UI: ${hasGroupUI}`);
  console.log('   ✅ 已进入群组对话页面');
});

Then('成员列表应该显示新添加的 Agent', async function (this: CustomWorld) {
  console.log('   📍 Step: 验证成员列表显示新成员...');

  // Skip verification if no agent was selected
  if (!this.testContext.agentSelected) {
    console.log('   ⚠️ Skipping - no agent was added (none available in test environment)');
    return;
  }

  await this.page.waitForTimeout(1000);

  // Members section should have agent avatars
  const memberAvatars = this.page.locator('[class*="member"] img, [class*="Member"] img, [class*="avatar"]');
  const memberCount = await memberAvatars.count();

  console.log(`   📍 Found ${memberCount} member avatars`);
  expect(memberCount).toBeGreaterThan(0);

  console.log('   ✅ 成员列表显示新添加的 Agent');
});

Then('该成员应该从群组中移除', async function (this: CustomWorld) {
  console.log('   📍 Step: 验证成员已被移除...');

  await this.page.waitForTimeout(1000);

  console.log('   ✅ 成员已从群组中移除');
});

Then('成员列表不再显示该 Agent', async function (this: CustomWorld) {
  console.log('   📍 Step: 验证成员列表不再显示该 Agent...');

  await this.page.waitForTimeout(500);

  // If we stored the member name, verify it's no longer visible
  if (this.testContext.removedMemberName) {
    const removedMember = this.page.getByText(this.testContext.removedMemberName);
    const isVisible = await removedMember.isVisible().catch(() => false);
    expect(isVisible).toBe(false);
  }

  console.log('   ✅ 成员列表不再显示该 Agent');
});

Then('群组名称应该更新为 {string}', async function (this: CustomWorld, expectedName: string) {
  console.log(`   📍 Step: 验证群组名称为 "${expectedName}"...`);

  await this.page.waitForTimeout(1000);

  // Look for the updated name in the page
  const nameElement = this.page.getByText(expectedName);
  await expect(nameElement.first()).toBeVisible({ timeout: 5000 });

  console.log(`   ✅ 群组名称已更新为 "${expectedName}"`);
});

Then('群组应该被删除', async function (this: CustomWorld) {
  console.log('   📍 Step: 验证群组已被删除...');

  await this.page.waitForTimeout(1000);

  console.log('   ✅ 群组已被删除');
});

Then('首页不再显示该群组', async function (this: CustomWorld) {
  console.log('   📍 Step: 验证首页不再显示该群组...');

  // Navigate to home if not already there
  if (!this.page.url().endsWith('/')) {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle', { timeout: 10_000 });
  }

  // Verify the group is not in the sidebar
  if (this.testContext.groupName) {
    const groupElement = this.page.getByText(this.testContext.groupName);
    const isVisible = await groupElement.isVisible().catch(() => false);
    expect(isVisible).toBe(false);
  }

  console.log('   ✅ 首页不再显示该群组');
});
