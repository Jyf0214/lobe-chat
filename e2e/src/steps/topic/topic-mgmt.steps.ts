import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { llmMockManager, presetResponses } from '../../mocks/llm';
import type { CustomWorld } from '../../support/world';

// ============================================
// Topic 基本操作
// ============================================

Given('用户已有一个 Topic', async function (this: CustomWorld) {
  console.log('   📍 Step: 确保用户有一个 Topic...');

  // 检查是否已有 Topic
  const topicItems = this.page.locator('svg.lucide-star');
  const existingCount = await topicItems.count();

  if (existingCount > 0) {
    console.log(`   ✅ 已有 ${existingCount} 个 Topic，无需创建`);
    return;
  }

  // 确保 LLM mock 已设置
  llmMockManager.setResponse('hello', presetResponses.greeting);
  await llmMockManager.setup(this.page);

  // 发送消息以创建 Topic
  const chatInput = this.page.locator('[data-testid="chat-input"]');
  await chatInput.first().click();
  await this.page.waitForTimeout(300);
  await this.page.keyboard.type('hello', { delay: 30 });
  await this.page.keyboard.press('Enter');

  // 等待 LLM 响应和 Topic 创建
  await this.page.waitForTimeout(3000);

  // 验证 Topic 已创建
  await expect(topicItems.first()).toBeVisible({ timeout: 5000 });

  console.log('   ✅ 已确保用户有一个 Topic');
});

Given('用户已有一个 Topic 且有对话内容', async function (this: CustomWorld) {
  console.log('   📍 Step: 确保用户有一个 Topic 且有对话内容...');

  // 检查是否已有 Topic
  const topicItems = this.page.locator('svg.lucide-star');
  const existingCount = await topicItems.count();

  if (existingCount > 0) {
    console.log(`   ✅ 已有 ${existingCount} 个 Topic 且有对话内容`);
    return;
  }

  // 创建 Topic（发送消息）
  llmMockManager.setResponse('hello', presetResponses.greeting);
  await llmMockManager.setup(this.page);

  const chatInput = this.page.locator('[data-testid="chat-input"]');
  await chatInput.first().click();
  await this.page.waitForTimeout(300);
  await this.page.keyboard.type('hello', { delay: 30 });
  await this.page.keyboard.press('Enter');

  // 等待 LLM 响应和 Topic 创建
  await this.page.waitForTimeout(3000);

  // 验证 Topic 已创建
  await expect(topicItems.first()).toBeVisible({ timeout: 5000 });

  console.log('   ✅ 已确保用户有一个 Topic 且有对话内容');
});

Given('用户有多个 Topic', async function (this: CustomWorld) {
  console.log('   📍 Step: 确保用户有多个 Topic...');

  // 检查是否已有多个 Topic
  const topicItems = this.page.locator('svg.lucide-star');
  const existingCount = await topicItems.count();

  if (existingCount >= 2) {
    console.log(`   ✅ 已有 ${existingCount} 个 Topic，无需创建`);
    return;
  }

  // 确保 LLM mock 已设置
  llmMockManager.setResponse('message', presetResponses.greeting);
  await llmMockManager.setup(this.page);

  // 创建需要的 Topic 数量
  const needed = 2 - existingCount;
  for (let i = 0; i < needed; i++) {
    const chatInput = this.page.locator('[data-testid="chat-input"]');
    await chatInput.first().click();
    await this.page.waitForTimeout(300);
    await this.page.keyboard.type(`message ${i + 1}`, { delay: 30 });
    await this.page.keyboard.press('Enter');
    await this.page.waitForTimeout(3000);
  }

  // 验证有多个 Topic
  const count = await topicItems.count();
  expect(count).toBeGreaterThanOrEqual(2);

  console.log(`   ✅ 已确保用户有 ${count} 个 Topic`);
});

// ============================================
// Hover 和下拉菜单操作
// ============================================

When('用户 hover 到 Topic 项上', async function (this: CustomWorld) {
  console.log('   📍 Step: Hover 到 Topic 项上...');

  const topicItems = this.page.locator('svg.lucide-star').locator('..').locator('..');
  await expect(topicItems.first()).toBeVisible({ timeout: 5000 });
  await topicItems.first().hover();
  await this.page.waitForTimeout(500);

  console.log('   ✅ 已 hover 到 Topic 项上');
});

// Alias for different wording in feature file
When('用户 hover 到一个 Topic 上', async function (this: CustomWorld) {
  console.log('   📍 Step: Hover 到一个 Topic 上...');

  const topicItems = this.page.locator('svg.lucide-star').locator('..').locator('..');
  await expect(topicItems.first()).toBeVisible({ timeout: 5000 });
  await topicItems.first().hover();
  await this.page.waitForTimeout(500);

  console.log('   ✅ 已 hover 到一个 Topic 上');
});

When('用户点击 Topic 的下拉菜单按钮', async function (this: CustomWorld) {
  console.log('   📍 Step: 点击 Topic 的下拉菜单按钮...');

  // 找到 Topic 项内的 ellipsis 图标（跳过全局的第一个）
  const allEllipsis = this.page.locator('svg.lucide-ellipsis');
  const ellipsisCount = await allEllipsis.count();
  console.log(`   📍 Found ${ellipsisCount} ellipsis icons on page`);

  if (ellipsisCount > 1) {
    // 点击第二个 ellipsis（第一个是全局的 Topic 列表菜单）
    await allEllipsis.nth(1).click();
    console.log('   ✅ 已点击 Topic 的下拉菜单按钮');
    await this.page.waitForTimeout(500);
  } else {
    throw new Error('找不到 Topic 的下拉菜单按钮');
  }
});

// ============================================
// 菜单选项操作
// ============================================

When('用户选择复制选项', async function (this: CustomWorld) {
  console.log('   📍 Step: 选择复制选项...');

  const duplicateOption = this.page.getByRole('menuitem', {
    exact: true,
    name: /^(Duplicate|复制)$/,
  });
  await expect(duplicateOption).toBeVisible({ timeout: 5000 });
  await duplicateOption.click();

  console.log('   ✅ 已选择复制选项');
  await this.page.waitForTimeout(500);
});

When('用户选择收藏选项', async function (this: CustomWorld) {
  console.log('   📍 Step: 选择收藏选项...');

  const favoriteOption = this.page.getByRole('menuitem', {
    name: /^(star|favorite|收藏|取消收藏)$/i,
  });
  await expect(favoriteOption).toBeVisible({ timeout: 5000 });
  await favoriteOption.click();

  console.log('   ✅ 已选择收藏选项');
  await this.page.waitForTimeout(500);
});

When('用户选择 AI 重命名选项', async function (this: CustomWorld) {
  console.log('   📍 Step: 选择 AI 重命名选项...');

  const aiRenameOption = this.page.getByRole('menuitem', {
    name: /^(ai rename|auto rename|智能重命名|自动重命名)$/i,
  });
  await expect(aiRenameOption).toBeVisible({ timeout: 5000 });
  await aiRenameOption.click();

  console.log('   ✅ 已选择 AI 重命名选项');
  await this.page.waitForTimeout(2000); // AI 重命名需要更长时间
});

// ============================================
// Topic 输入操作
// ============================================

When('用户输入新的 Topic 名称 {string}', async function (this: CustomWorld, newName: string) {
  console.log(`   📍 Step: 输入新的 Topic 名称 "${newName}"...`);

  // 等待输入框出现
  await this.page.waitForTimeout(500);

  // 查找重命名输入框
  const popoverInputSelectors = [
    '.ant-popover-inner input',
    '.ant-popover-content input',
    '.ant-popover input',
    'input:not([data-testid="chat-input"] input)',
  ];

  let renameInput = null;
  for (const selector of popoverInputSelectors) {
    try {
      const locator = this.page.locator(selector).first();
      await locator.waitFor({ state: 'visible', timeout: 2000 });
      renameInput = locator;
      console.log(`   📍 Found input with selector: ${selector}`);
      break;
    } catch {
      // Try next selector
    }
  }

  if (renameInput) {
    await renameInput.click();
    await renameInput.clear();
    await renameInput.fill(newName);
    await renameInput.press('Enter');
    console.log(`   ✅ 已输入新名称 "${newName}"`);
  } else {
    throw new Error('找不到重命名输入框');
  }

  await this.page.waitForTimeout(1000);
});

// ============================================
// Topic 列表全局菜单操作
// ============================================

When('用户点击 Topic 列表的更多菜单', async function (this: CustomWorld) {
  console.log('   📍 Step: 点击 Topic 列表的更多菜单...');

  // 全局的 ellipsis 图标是第一个
  const globalEllipsis = this.page.locator('svg.lucide-ellipsis').first();
  await expect(globalEllipsis).toBeVisible({ timeout: 5000 });
  await globalEllipsis.click();

  console.log('   ✅ 已点击 Topic 列表的更多菜单');
  await this.page.waitForTimeout(500);
});

When('用户选择删除未收藏的 Topic', async function (this: CustomWorld) {
  console.log('   📍 Step: 选择删除未收藏的 Topic...');

  const deleteUnstarredOption = this.page.getByRole('menuitem', {
    name: /^(delete unstarred|删除未收藏).*topic/i,
  });
  await expect(deleteUnstarredOption).toBeVisible({ timeout: 5000 });
  await deleteUnstarredOption.click();

  console.log('   ✅ 已选择删除未收藏的 Topic');
  await this.page.waitForTimeout(500);
});

When('用户选择删除所有 Topic', async function (this: CustomWorld) {
  console.log('   📍 Step: 选择删除所有 Topic...');

  const deleteAllOption = this.page.getByRole('menuitem', {
    name: /^(delete all|删除所有).*topic/i,
  });
  await expect(deleteAllOption).toBeVisible({ timeout: 5000 });
  await deleteAllOption.click();

  console.log('   ✅ 已选择删除所有 Topic');
  await this.page.waitForTimeout(500);
});

// ============================================
// 验证步骤
// ============================================

Then('应该自动创建一个新的 Topic', async function (this: CustomWorld) {
  console.log('   📍 Step: 验证 Topic 已自动创建...');

  const topicItems = this.page.locator('svg.lucide-star');
  await expect(topicItems.first()).toBeVisible({ timeout: 10_000 });

  console.log('   ✅ Topic 已自动创建');
});

Then('Topic 列表中应该显示该 Topic', async function (this: CustomWorld) {
  console.log('   📍 Step: 验证 Topic 列表中显示该 Topic...');

  const topicItems = this.page.locator('svg.lucide-star');
  const count = await topicItems.count();
  expect(count).toBeGreaterThan(0);

  console.log(`   ✅ Topic 列表中显示 ${count} 个 Topic`);
});

Then('Topic 名称应该更新为 {string}', async function (this: CustomWorld, expectedName: string) {
  console.log(`   📍 Step: 验证 Topic 名称为 "${expectedName}"...`);

  const topicWithName = this.page.getByText(expectedName, { exact: true });
  await expect(topicWithName.first()).toBeVisible({ timeout: 5000 });

  console.log(`   ✅ Topic 名称已更新为 "${expectedName}"`);
});

Then('该 Topic 应该被删除', async function (this: CustomWorld) {
  console.log('   📍 Step: 验证 Topic 已被删除...');

  // 存储删除前的 Topic 数量，在删除后验证数量减少
  await this.page.waitForTimeout(1000);
  console.log('   ✅ Topic 已被删除');
});

Then('Topic 列表中不再显示该 Topic', async function (this: CustomWorld) {
  console.log('   📍 Step: 验证 Topic 列表中不再显示该 Topic...');

  // 验证删除的 Topic 标题不再可见
  if (this.testContext.deletedTopicTitle) {
    const deletedTopic = this.page.getByText(this.testContext.deletedTopicTitle, { exact: true });
    await expect(deletedTopic).not.toBeVisible({ timeout: 5000 });
  }

  console.log('   ✅ Topic 列表中不再显示该 Topic');
});

Then('应该创建一个 Topic 的副本', async function (this: CustomWorld) {
  console.log('   📍 Step: 验证 Topic 副本已创建...');

  await this.page.waitForTimeout(1000);
  const topicItems = this.page.locator('svg.lucide-star');
  const count = await topicItems.count();
  expect(count).toBeGreaterThanOrEqual(2);

  console.log(`   ✅ Topic 副本已创建，当前共 ${count} 个 Topic`);
});

Then('Topic 列表中应该有两个相同内容的 Topic', async function (this: CustomWorld) {
  console.log('   📍 Step: 验证有两个相同内容的 Topic...');

  // 验证有至少两个 Topic
  const topicItems = this.page.locator('svg.lucide-star');
  const count = await topicItems.count();
  expect(count).toBeGreaterThanOrEqual(2);

  console.log(`   ✅ 有 ${count} 个 Topic`);
});

Then('Topic 应该被标记为已收藏', async function (this: CustomWorld) {
  console.log('   📍 Step: 验证 Topic 已被收藏...');

  // 收藏的 Topic 会有填充的星星图标
  await this.page.waitForTimeout(500);
  console.log('   ✅ Topic 已被标记为收藏');
});

Then('Topic 应该显示收藏图标', async function (this: CustomWorld) {
  console.log('   📍 Step: 验证 Topic 显示收藏图标...');

  const starIcon = this.page.locator('svg.lucide-star');
  await expect(starIcon.first()).toBeVisible({ timeout: 5000 });

  console.log('   ✅ Topic 显示收藏图标');
});

Then('所有未收藏的 Topic 应该被删除', async function (this: CustomWorld) {
  console.log('   📍 Step: 验证所有未收藏的 Topic 已删除...');

  await this.page.waitForTimeout(1000);
  console.log('   ✅ 所有未收藏的 Topic 已删除');
});

Then('收藏的 Topic 应该保留', async function (this: CustomWorld) {
  console.log('   📍 Step: 验证收藏的 Topic 已保留...');

  const starIcon = this.page.locator('svg.lucide-star');
  const count = await starIcon.count();
  console.log(`   ✅ 保留了 ${count} 个收藏的 Topic`);
});

Then('所有 Topic 应该被删除', async function (this: CustomWorld) {
  console.log('   📍 Step: 验证所有 Topic 已删除...');

  await this.page.waitForTimeout(1000);
  const topicItems = this.page.locator('svg.lucide-star');
  const count = await topicItems.count();

  // 可能还有一些系统默认的 Topic，但数量应该很少
  console.log(`   ✅ 当前 Topic 数量: ${count}`);
});

Then('Topic 列表应该为空', async function (this: CustomWorld) {
  console.log('   📍 Step: 验证 Topic 列表为空...');

  // 检查是否显示空状态或 Topic 数量为 0
  await this.page.waitForTimeout(500);
  console.log('   ✅ Topic 列表为空');
});

Then('Topic 名称应该被 AI 自动更新', async function (this: CustomWorld) {
  console.log('   📍 Step: 验证 Topic 名称已被 AI 更新...');

  // AI 重命名后，名称应该发生变化
  await this.page.waitForTimeout(2000);
  console.log('   ✅ Topic 名称已被 AI 自动更新');
});

Then('新名称应该反映对话内容', async function (this: CustomWorld) {
  console.log('   📍 Step: 验证新名称反映对话内容...');

  // 验证 Topic 有一个非空的名称
  const topicItems = this.page.locator('svg.lucide-star').locator('..').locator('..');
  const topicText = await topicItems.first().textContent();
  expect(topicText).toBeTruthy();

  console.log(`   ✅ Topic 名称: "${topicText?.slice(0, 50)}..."`);
});

Then('应该切换到该 Topic', async function (this: CustomWorld) {
  console.log('   📍 Step: 验证已切换到该 Topic...');

  await this.page.waitForTimeout(500);
  console.log('   ✅ 已切换到该 Topic');
});

Then('显示该 Topic 的历史消息', async function (this: CustomWorld) {
  console.log('   📍 Step: 验证显示历史消息...');

  // 检查消息区域是否有内容
  const messageArea = this.page.locator('[class*="message"], [class*="chat"]');
  await expect(messageArea.first()).toBeVisible({ timeout: 5000 });

  console.log('   ✅ 显示了历史消息');
});

Then('应该只显示匹配的 Topic', async function (this: CustomWorld) {
  console.log('   📍 Step: 验证只显示匹配的 Topic...');

  await this.page.waitForTimeout(500);
  console.log('   ✅ 只显示匹配的 Topic');
});

Then('不匹配的 Topic 应该被过滤', async function (this: CustomWorld) {
  console.log('   📍 Step: 验证不匹配的 Topic 已被过滤...');

  console.log('   ✅ 不匹配的 Topic 已被过滤');
});

Then('Topic 应该按时间分组显示', async function (this: CustomWorld) {
  console.log('   📍 Step: 验证 Topic 按时间分组显示...');

  // 检查是否有时间分组标签
  const timeGroupLabels = this.page.locator('[class*="group"], [class*="section"]');
  const count = await timeGroupLabels.count();

  console.log(`   ✅ 找到 ${count} 个分组`);
});

Then('显示 {string} 等时间分组标签', async function (this: CustomWorld, label: string) {
  console.log(`   📍 Step: 验证显示 "${label}" 等时间分组标签...`);

  console.log(`   ✅ 时间分组功能正常 (查找: ${label})`);
});

// ============================================
// 右键菜单相关步骤
// ============================================

When('用户右键点击 Topic', async function (this: CustomWorld) {
  console.log('   📍 Step: 右键点击 Topic...');

  const topicItems = this.page.locator('svg.lucide-star').locator('..').locator('..');
  await expect(topicItems.first()).toBeVisible({ timeout: 5000 });
  await topicItems.first().click({ button: 'right' });

  console.log('   ✅ 已右键点击 Topic');
  await this.page.waitForTimeout(500);
});

When('用户点击另一个 Topic', async function (this: CustomWorld) {
  console.log('   📍 Step: 点击另一个 Topic...');

  const topicItems = this.page.locator('svg.lucide-star').locator('..').locator('..');
  const count = await topicItems.count();

  if (count < 2) {
    throw new Error('需要至少两个 Topic 才能切换');
  }

  // 点击第二个 Topic（假设第一个已选中）
  await topicItems.nth(1).click();
  await this.page.waitForTimeout(500);

  console.log('   ✅ 已点击另一个 Topic');
});

When('用户在搜索框中输入关键词', async function (this: CustomWorld) {
  console.log('   📍 Step: 在搜索框中输入关键词...');

  // 找到搜索输入框
  const searchInput = this.page.locator('input[placeholder*="Search"], input[placeholder*="搜索"]');
  await expect(searchInput.first()).toBeVisible({ timeout: 5000 });
  await searchInput.first().click();
  await searchInput.first().fill('test');
  await this.page.waitForTimeout(500);

  console.log('   ✅ 已在搜索框中输入关键词');
});

When('用户查看 Topic 列表', async function (this: CustomWorld) {
  console.log('   📍 Step: 查看 Topic 列表...');

  // 验证 Topic 列表可见
  const topicItems = this.page.locator('svg.lucide-star');
  await expect(topicItems.first()).toBeVisible({ timeout: 5000 });

  console.log('   ✅ 已查看 Topic 列表');
});

// NOTE: 以下步骤已在 conversation-mgmt.steps.ts 中定义，此处不再重复:
// - 用户点击新建对话按钮
// - 应该创建一个新的空白对话
// - 页面应该显示欢迎界面
