@journey @agent @topic
Feature: Topic 管理用户体验链路
  作为用户，我希望能够管理我的 Topic（话题/对话）

  Background:
    Given 用户已登录系统
    And 用户进入 Lobe AI 对话页面

  # ============================================
  # Topic 基本操作 (CRUD)
  # ============================================

  @TOPIC-001 @P0
  Scenario: 发送消息自动创建 Topic
    When 用户发送消息 "你好"
    Then 应该自动创建一个新的 Topic
    And Topic 列表中应该显示该 Topic

  @TOPIC-002 @P0
  Scenario: 通过下拉菜单重命名 Topic
    Given 用户已有一个 Topic
    When 用户 hover 到 Topic 项上
    And 用户点击 Topic 的下拉菜单按钮
    And 用户选择重命名选项
    And 用户输入新的 Topic 名称 "我的测试话题"
    Then Topic 名称应该更新为 "我的测试话题"

  @TOPIC-003 @P1
  Scenario: 通过右键菜单重命名 Topic
    Given 用户已有一个 Topic
    When 用户右键点击 Topic
    And 用户选择重命名选项
    And 用户输入新的 Topic 名称 "右键重命名测试"
    Then Topic 名称应该更新为 "右键重命名测试"

  @TOPIC-004 @P0
  Scenario: 通过下拉菜单删除 Topic
    Given 用户有多个 Topic
    When 用户 hover 到一个 Topic 上
    And 用户点击 Topic 的下拉菜单按钮
    And 用户选择删除选项
    And 用户确认删除
    Then 该 Topic 应该被删除
    And Topic 列表中不再显示该 Topic

  @TOPIC-005 @P1
  Scenario: 复制 Topic
    Given 用户已有一个 Topic
    When 用户 hover 到 Topic 项上
    And 用户点击 Topic 的下拉菜单按钮
    And 用户选择复制选项
    Then 应该创建一个 Topic 的副本
    And Topic 列表中应该有两个相同内容的 Topic

  # ============================================
  # Topic 列表操作
  # ============================================

  @TOPIC-006 @P0
  Scenario: 切换不同 Topic
    Given 用户有多个 Topic
    When 用户点击另一个 Topic
    Then 应该切换到该 Topic
    And 显示该 Topic 的历史消息

  @TOPIC-007 @P1 @wip
  Scenario: 搜索 Topic
    Given 用户有多个 Topic
    When 用户在搜索框中输入关键词
    Then 应该只显示匹配的 Topic
    And 不匹配的 Topic 应该被过滤

  @TOPIC-008 @P2 @wip
  Scenario: Topic 按时间分组显示
    Given 用户有不同日期创建的 Topic
    When 用户查看 Topic 列表
    Then Topic 应该按时间分组显示
    And 显示 "Today" 等时间分组标签

  @TOPIC-009 @P2 @wip
  Scenario: 收藏 Topic
    Given 用户已有一个 Topic
    When 用户 hover 到 Topic 项上
    And 用户点击 Topic 的下拉菜单按钮
    And 用户选择收藏选项
    Then Topic 应该被标记为已收藏
    And Topic 应该显示收藏图标

  # ============================================
  # Topic 批量操作
  # ============================================

  @TOPIC-010 @P2 @wip
  Scenario: 删除所有未收藏的 Topic
    Given 用户有多个 Topic 包括收藏和未收藏的
    When 用户点击 Topic 列表的更多菜单
    And 用户选择删除未收藏的 Topic
    And 用户确认删除
    Then 所有未收藏的 Topic 应该被删除
    And 收藏的 Topic 应该保留

  @TOPIC-011 @P2 @wip
  Scenario: 删除所有 Topic
    Given 用户有多个 Topic
    When 用户点击 Topic 列表的更多菜单
    And 用户选择删除所有 Topic
    And 用户确认删除
    Then 所有 Topic 应该被删除
    And Topic 列表应该为空

  # ============================================
  # AI 功能
  # ============================================

  @TOPIC-012 @P1 @wip
  Scenario: AI 自动重命名 Topic
    Given 用户已有一个 Topic 且有对话内容
    When 用户 hover 到 Topic 项上
    And 用户点击 Topic 的下拉菜单按钮
    And 用户选择 AI 重命名选项
    Then Topic 名称应该被 AI 自动更新
    And 新名称应该反映对话内容

  # ============================================
  # 新建对话
  # ============================================

  @TOPIC-013 @P0
  Scenario: 新建空白对话
    Given 用户已有一个 Topic
    When 用户点击新建对话按钮
    Then 应该创建一个新的空白对话
    And 页面应该显示欢迎界面
