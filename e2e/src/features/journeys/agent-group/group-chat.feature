@journey @agent-group @group-chat
Feature: Agent Group 群聊对话用户体验链路
  作为用户，我希望能够在 Agent Group 中与多个 AI 助手进行群聊对话

  Background:
    Given 用户已登录系统

  @GROUP-CHAT-001 @P0 @smoke
  Scenario: 在群组中发送消息
    Given 用户已创建一个群组并进入群组页面
    When 用户在群聊输入框中输入消息 "大家好"
    And 用户发送消息
    Then 消息应该显示在聊天列表中
    And 用户应该收到群组成员的回复

  @GROUP-CHAT-002 @P0
  Scenario: 多个 Agent 依次回复
    Given 用户已创建一个包含多个成员的群组
    When 用户在群聊中发送消息 "请大家自我介绍一下"
    Then 群组中的多个 Agent 应该依次回复
    And 每个回复应该标注对应的 Agent 名称
