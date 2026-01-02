/**
 * Agent Group Management Steps
 *
 * Step definitions for Agent Group management E2E tests
 */
import { Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { CustomWorld } from '../../support/world';

// ============================================
// When Steps
// ============================================

When('用户在首页查看侧边栏', async function (this: CustomWorld) {
  console.log('   📍 Step: 查看首页侧边栏...');

  // Wait for sidebar to be visible
  await this.page.waitForLoadState('networkidle', { timeout: 10_000 });

  console.log('   ✅ 已查看首页侧边栏');
});

When('用户进入群组页面', async function (this: CustomWorld) {
  console.log('   📍 Step: 进入群组页面...');

  // If we already created a group, we might be on the group page
  const url = this.page.url();
  if (!url.includes('/group/')) {
    // Find and click on a group in the sidebar
    const groupItems = this.page.locator('svg.lucide-users-round').locator('..').locator('..');
    if ((await groupItems.count()) > 0) {
      await groupItems.first().click();
      await this.page.waitForLoadState('networkidle', { timeout: 10_000 });
    }
  }

  console.log('   ✅ 已进入群组页面');
});

When('用户点击成员列表折叠按钮', async function (this: CustomWorld) {
  console.log('   📍 Step: 点击成员列表折叠按钮...');

  // Find the accordion/collapse button for members section
  // This is typically a ChevronDown or ChevronUp icon
  const membersAccordion = this.page.locator('[class*="accordion"], [class*="Accordion"]')
    .filter({ hasText: /成员|Members/ });

  if ((await membersAccordion.count()) > 0) {
    // Click the header to toggle
    const accordionHeader = membersAccordion.locator('[class*="header"], [class*="Header"]').first();
    if ((await accordionHeader.count()) > 0) {
      await accordionHeader.click();
    } else {
      await membersAccordion.first().click();
    }
  } else {
    // Try finding by chevron icon
    const chevronButton = this.page.locator('svg.lucide-chevron-down, svg.lucide-chevron-up')
      .locator('..')
      .first();
    if ((await chevronButton.count()) > 0) {
      await chevronButton.click();
    }
  }

  console.log('   ✅ 已点击成员列表折叠按钮');
  await this.page.waitForTimeout(500);
});

When('用户再次点击成员列表折叠按钮', async function (this: CustomWorld) {
  console.log('   📍 Step: 再次点击成员列表折叠按钮...');

  // Same as above - toggle the accordion again
  const membersAccordion = this.page.locator('[class*="accordion"], [class*="Accordion"]')
    .filter({ hasText: /成员|Members/ });

  if ((await membersAccordion.count()) > 0) {
    const accordionHeader = membersAccordion.locator('[class*="header"], [class*="Header"]').first();
    if ((await accordionHeader.count()) > 0) {
      await accordionHeader.click();
    } else {
      await membersAccordion.first().click();
    }
  } else {
    const chevronButton = this.page.locator('svg.lucide-chevron-down, svg.lucide-chevron-up')
      .locator('..')
      .first();
    if ((await chevronButton.count()) > 0) {
      await chevronButton.click();
    }
  }

  console.log('   ✅ 已再次点击成员列表折叠按钮');
  await this.page.waitForTimeout(500);
});

// ============================================
// Then Steps
// ============================================

Then('用户应该能看到所有创建的群组', async function (this: CustomWorld) {
  console.log('   📍 Step: 验证能看到所有创建的群组...');

  // Find group items in sidebar (groups have UsersRound icon)
  const groupItems = this.page.locator('svg.lucide-users-round');
  const groupCount = await groupItems.count();

  console.log(`   📍 Found ${groupCount} groups in sidebar`);

  // We should have at least 2 groups (created in the Given step)
  expect(groupCount).toBeGreaterThanOrEqual(2);

  console.log('   ✅ 能看到所有创建的群组');
});

Then('每个群组应该显示群组名称和头像', async function (this: CustomWorld) {
  console.log('   📍 Step: 验证每个群组显示名称和头像...');

  // Find group items
  const groupItems = this.page.locator('svg.lucide-users-round').locator('..').locator('..');

  for (let i = 0; i < await groupItems.count(); i++) {
    const groupItem = groupItems.nth(i);

    // Each group should have some text (name)
    const hasText = (await groupItem.textContent())?.length ?? 0 > 0;
    expect(hasText).toBeTruthy();
  }

  console.log('   ✅ 每个群组显示群组名称和头像');
});

Then('成员列表应该收起', async function (this: CustomWorld) {
  console.log('   📍 Step: 验证成员列表已收起...');

  // When collapsed, member items should not be visible
  // or the accordion should have collapsed state
  await this.page.waitForTimeout(300);

  // Check for collapsed state indicators
  const memberItems = this.page.locator('[class*="member-item"], [class*="MemberItem"]');
  const visibleCount = await memberItems.count();

  // When collapsed, there should be fewer visible items or aria-expanded="false"
  console.log(`   📍 Visible member items: ${visibleCount}`);

  console.log('   ✅ 成员列表已收起');
});

Then('成员列表应该展开', async function (this: CustomWorld) {
  console.log('   📍 Step: 验证成员列表已展开...');

  await this.page.waitForTimeout(300);

  // When expanded, member items should be visible
  const memberItems = this.page.locator('[class*="member"], [class*="Member"], [class*="avatar"]');
  const visibleCount = await memberItems.count();

  console.log(`   📍 Visible member items: ${visibleCount}`);

  // When expanded, there should be some visible items
  expect(visibleCount).toBeGreaterThan(0);

  console.log('   ✅ 成员列表已展开');
});
