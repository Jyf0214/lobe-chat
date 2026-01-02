@journey @agent-group @group-mgmt
Feature: Agent Group 管理用户体验链路
  作为用户，我希望能够管理我的 Agent Group 列表和查看群组信息

  Background:
    Given 用户已登录系统

  @GROUP-MGMT-001 @P1
  Scenario: 查看群组列表
    Given 用户已创建多个群组
    When 用户在首页查看侧边栏
    Then 用户应该能看到所有创建的群组
    And 每个群组应该显示群组名称和头像

  @GROUP-MGMT-002 @P2
  Scenario: 展开和收起群组成员列表
    Given 用户已创建一个包含多个成员的群组
    When 用户进入群组页面
    And 用户点击成员列表折叠按钮
    Then 成员列表应该收起
    When 用户再次点击成员列表折叠按钮
    Then 成员列表应该展开
