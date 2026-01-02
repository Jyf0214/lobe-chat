@journey @agent-group @group-builder
Feature: Agent Group 创建和编辑用户体验链路
  作为用户，我希望能够创建和管理 Agent Group 来组织多个 AI 助手进行群聊

  Background:
    Given 用户已登录系统

  @GROUP-BUILD-001 @P0 @smoke
  Scenario: 创建新的 Agent Group
    Given 用户在首页
    When 用户点击创建群组按钮
    And 用户输入群组描述 "帮我创建一个测试群组"
    And 用户发送创建群组请求
    Then 应该成功创建群组
    And 用户应该进入群组对话页面

  @GROUP-BUILD-002 @P0 @smoke
  Scenario: 添加 Agent 到 Group
    Given 用户已创建一个群组并进入群组页面
    When 用户点击添加成员按钮
    And 用户在添加成员对话框中选择一个新 Agent
    And 用户点击添加成员确认按钮
    Then 成员列表应该显示新添加的 Agent

  @GROUP-BUILD-003 @P1
  Scenario: 从 Group 移除 Agent
    Given 用户已创建一个包含多个成员的群组
    When 用户点击成员旁边的移除按钮
    Then 该成员应该从群组中移除
    And 成员列表不再显示该 Agent

  @GROUP-BUILD-004 @P1
  Scenario: 编辑 Group 名称
    Given 用户已创建一个群组并进入群组页面
    When 用户进入群组资料编辑页面
    And 用户修改群组名称为 "新群组名称"
    Then 群组名称应该更新为 "新群组名称"

  @GROUP-BUILD-005 @P1
  Scenario: 删除 Agent Group
    Given 用户已创建一个群组
    When 用户在首页右键点击群组
    And 用户选择删除群组选项
    And 用户确认删除群组
    Then 群组应该被删除
    And 首页不再显示该群组
