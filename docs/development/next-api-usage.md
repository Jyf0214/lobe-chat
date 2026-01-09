# Next API 使用清单（前端）

本清单基于仓库内对 `next/*` 的静态检索整理，按 API 类型归类到“仍在直接使用 Next API 的组件/模块文件”。

> 统计口径：`src/` + `apps/` + `packages/` 中匹配 `next/navigation|dynamic|link|image|script|server|headers|next/dist` 的引用。

## 路由与导航（next/navigation）

这些文件直接依赖 App Router 的导航/路由 hooks（如 `usePathname` / `useSearchParams` / `useRouter` 等）。

- [src/hooks/useActiveTabKey.ts](src/hooks/useActiveTabKey.ts)
- [src/hooks/useQuery.ts](src/hooks/useQuery.ts)
- [src/hooks/useIsSubSlug.ts](src/hooks/useIsSubSlug.ts)
- [src/hooks/useIsSingleMode.ts](src/hooks/useIsSingleMode.ts)
- [src/hooks/useIsSingleMode.test.ts](src/hooks/useIsSingleMode.test.ts)
- [src/features/MobileTabBar/index.tsx](src/features/MobileTabBar/index.tsx)
- [src/features/User/UserPanel/PanelContent.tsx](src/features/User/UserPanel/PanelContent.tsx)
- [src/features/User/__tests__/PanelContent.test.tsx](src/features/User/__tests__/PanelContent.test.tsx)
- [src/features/DevPanel/features/FloatPanel.tsx](src/features/DevPanel/features/FloatPanel.tsx)
- [src/features/DevPanel/CacheViewer/cacheProvider.tsx](src/features/DevPanel/CacheViewer/cacheProvider.tsx)
- [src/layout/GlobalProvider/useUserStateRedirect.ts](src/layout/GlobalProvider/useUserStateRedirect.ts)
- [src/layout/GlobalProvider/StyleRegistry.tsx](src/layout/GlobalProvider/StyleRegistry.tsx)
- [src/app/(variants)/(main)/chat/_layout/Sidebar/Header/AddTopicButon.tsx](src/app/(variants)/(main)/chat/_layout/Sidebar/Header/AddTopicButon.tsx)
- [src/app/(variants)/(main)/chat/_layout/Sidebar/Header/Nav.tsx](src/app/(variants)/(main)/chat/_layout/Sidebar/Header/Nav.tsx)
- [src/app/(variants)/(main)/chat/_layout/Sidebar/Topic/hooks/useTopicNavigation.ts](src/app/(variants)/(main)/chat/_layout/Sidebar/Topic/hooks/useTopicNavigation.ts)
- [src/app/(variants)/(main)/chat/_layout/Sidebar/Topic/hooks/useThreadNavigation.ts](src/app/(variants)/(main)/chat/_layout/Sidebar/Topic/hooks/useThreadNavigation.ts)
- [src/app/(variants)/(main)/community/_layout/Sidebar/Header/Nav.tsx](src/app/(variants)/(main)/community/_layout/Sidebar/Header/Nav.tsx)
- [src/app/(variants)/(main)/memory/_layout/Sidebar/Header/Nav.tsx](src/app/(variants)/(main)/memory/_layout/Sidebar/Header/Nav.tsx)
- [src/app/(variants)/(main)/group/_layout/Sidebar/Header/Nav.tsx](src/app/(variants)/(main)/group/_layout/Sidebar/Header/Nav.tsx)
- [src/app/(variants)/(main)/group/_layout/Sidebar/Topic/hooks/useTopicNavigation.ts](src/app/(variants)/(main)/group/_layout/Sidebar/Topic/hooks/useTopicNavigation.ts)
- [src/app/(variants)/(main)/group/_layout/Sidebar/Topic/hooks/useThreadNavigation.ts](src/app/(variants)/(main)/group/_layout/Sidebar/Topic/hooks/useThreadNavigation.ts)

（注：这里包含一个测试/fixture 文件引用 `next/navigation`，并非真实 UI 组件）
- [packages/database/src/models/__tests__/fixtures/embedding.ts](packages/database/src/models/__tests__/fixtures/embedding.ts)

## 动态加载（next/dynamic）

这些组件/模块用 Next 的 `dynamic()` 做懒加载/按需加载。

- [src/components/Analytics/index.tsx](src/components/Analytics/index.tsx)
- [src/components/client/ClientResponsiveContent/index.tsx](src/components/client/ClientResponsiveContent/index.tsx)
- [src/components/client/ClientResponsiveLayout.tsx](src/components/client/ClientResponsiveLayout.tsx)
- [src/features/ChatInput/ActionBar/Token/index.tsx](src/features/ChatInput/ActionBar/Token/index.tsx)
- [src/features/ChatInput/Mobile/index.tsx](src/features/ChatInput/Mobile/index.tsx)
- [src/features/Conversation/ChatItem/components/MessageContent/index.tsx](src/features/Conversation/ChatItem/components/MessageContent/index.tsx)
- [src/features/Conversation/Error/index.tsx](src/features/Conversation/Error/index.tsx)
- [src/features/Conversation/Error/OllamaBizError/index.tsx](src/features/Conversation/Error/OllamaBizError/index.tsx)
- [src/features/Conversation/Messages/AssistantGroup/index.tsx](src/features/Conversation/Messages/AssistantGroup/index.tsx)
- [src/features/Conversation/Messages/AssistantGroup/Tool/index.tsx](src/features/Conversation/Messages/AssistantGroup/Tool/index.tsx)
- [src/features/Conversation/Messages/AssistantGroup/Tool/Actions/Settings.tsx](src/features/Conversation/Messages/AssistantGroup/Tool/Actions/Settings.tsx)
- [src/features/Conversation/Messages/Tool/Tool/index.tsx](src/features/Conversation/Messages/Tool/Tool/index.tsx)
- [src/features/DevPanel/index.tsx](src/features/DevPanel/index.tsx)
- [src/features/PluginStore/McpList/index.tsx](src/features/PluginStore/McpList/index.tsx)
- [src/features/PluginsUI/Render/DefaultType/index.tsx](src/features/PluginsUI/Render/DefaultType/index.tsx)
- [src/features/Portal/Artifacts/Body/Renderer/index.tsx](src/features/Portal/Artifacts/Body/Renderer/index.tsx)
- [src/features/PWAInstall/index.tsx](src/features/PWAInstall/index.tsx)
- [src/features/PWAInstall/Install.tsx](src/features/PWAInstall/Install.tsx)
- [src/features/ResourceManager/index.tsx](src/features/ResourceManager/index.tsx)
- [src/features/ResourceManager/components/ChunkDrawer/index.tsx](src/features/ResourceManager/components/ChunkDrawer/index.tsx)
- [src/app/(variants)/router/index.tsx](src/app/(variants)/router/index.tsx)
- [src/app/(variants)/(mobile)/router/index.tsx](src/app/(variants)/(mobile)/router/index.tsx)
- [src/app/(variants)/(mobile)/_layout/index.tsx](src/app/(variants)/(mobile)/_layout/index.tsx)
- [src/app/(variants)/(mobile)/chat/settings/features/SettingButton.tsx](src/app/(variants)/(mobile)/chat/settings/features/SettingButton.tsx)
- [src/app/(variants)/(main)/_layout/index.tsx](src/app/(variants)/(main)/_layout/index.tsx)
- [src/app/(variants)/(main)/chat/_layout/Sidebar/Topic/AllTopicsDrawer/index.tsx](src/app/(variants)/(main)/chat/_layout/Sidebar/Topic/AllTopicsDrawer/index.tsx)
- [src/app/(variants)/(main)/chat/features/Conversation/Header/ShareButton/index.tsx](src/app/(variants)/(main)/chat/features/Conversation/Header/ShareButton/index.tsx)
- [src/app/(variants)/(main)/community/features/CreateButton/index.tsx](src/app/(variants)/(main)/community/features/CreateButton/index.tsx)
- [src/app/(variants)/(main)/group/_layout/Sidebar/Topic/AllTopicsDrawer/index.tsx](src/app/(variants)/(main)/group/_layout/Sidebar/Topic/AllTopicsDrawer/index.tsx)
- [src/app/(variants)/(main)/group/features/Conversation/Header/ShareButton/index.tsx](src/app/(variants)/(main)/group/features/Conversation/Header/ShareButton/index.tsx)
- [src/app/(variants)/(main)/home/_layout/Body/Agent/AllAgentsDrawer/index.tsx](src/app/(variants)/(main)/home/_layout/Body/Agent/AllAgentsDrawer/index.tsx)
- [src/app/(variants)/(main)/memory/(home)/features/RoleTagCloud/index.tsx](src/app/(variants)/(main)/memory/(home)/features/RoleTagCloud/index.tsx)
- [src/app/(variants)/(main)/page/_layout/Body/AllPagesDrawer/index.tsx](src/app/(variants)/(main)/page/_layout/Body/AllPagesDrawer/index.tsx)
- [src/app/(variants)/(main)/settings/features/SettingsContent.tsx](src/app/(variants)/(main)/settings/features/SettingsContent.tsx)
- [src/app/(variants)/(main)/settings/provider/detail/index.tsx](src/app/(variants)/(main)/settings/provider/detail/index.tsx)
- [src/app/(variants)/(main)/settings/provider/detail/ollama/CheckError.tsx](src/app/(variants)/(main)/settings/provider/detail/ollama/CheckError.tsx)
- [src/app/(variants)/(main)/settings/stats/features/overview/ShareButton/ShareModal.tsx](src/app/(variants)/(main)/settings/stats/features/overview/ShareButton/ShareModal.tsx)

## 链接组件（next/link）

这些 UI 组件仍在直接 import `next/link`。

- [src/components/Link.tsx](src/components/Link.tsx)
- [src/components/mdx/Link.tsx](src/components/mdx/Link.tsx)
- [src/components/GoBack/index.tsx](src/components/GoBack/index.tsx)
- [src/components/Error/index.tsx](src/components/Error/index.tsx)
- [src/components/404/index.tsx](src/components/404/index.tsx)
- [src/components/BrandWatermark/index.tsx](src/components/BrandWatermark/index.tsx)
- [src/components/OllamaSetupGuide/index.tsx](src/components/OllamaSetupGuide/index.tsx)
- [src/features/AlertBanner/CloudBanner.tsx](src/features/AlertBanner/CloudBanner.tsx)
- [src/features/ChatInput/ActionBar/Model/ControlsForm.tsx](src/features/ChatInput/ActionBar/Model/ControlsForm.tsx)
- [src/features/Conversation/Error/OllamaSetupGuide/Desktop.tsx](src/features/Conversation/Error/OllamaSetupGuide/Desktop.tsx)
- [src/features/DataImporter/Error.tsx](src/features/DataImporter/Error.tsx)
- [src/features/DevPanel/features/Table/TooltipContent.tsx](src/features/DevPanel/features/Table/TooltipContent.tsx)
- [src/features/FileViewer/NotSupport/index.tsx](src/features/FileViewer/NotSupport/index.tsx)
- [src/features/Follow/index.tsx](src/features/Follow/index.tsx)
- [src/features/LibraryModal/AddFilesToKnowledgeBase/SelectForm.tsx](src/features/LibraryModal/AddFilesToKnowledgeBase/SelectForm.tsx)
- [src/features/MCP/Scores.tsx](src/features/MCP/Scores.tsx)
- [src/features/MCPPluginDetail/Nav.tsx](src/features/MCPPluginDetail/Nav.tsx)
- [src/features/MCPPluginDetail/Overview/TagList.tsx](src/features/MCPPluginDetail/Overview/TagList.tsx)
- [src/features/OllamaSetupGuide/Desktop.tsx](src/features/OllamaSetupGuide/Desktop.tsx)
- [src/features/PluginStore/PluginList/Detail/Header.tsx](src/features/PluginStore/PluginList/Detail/Header.tsx)
- [src/features/Setting/Footer.tsx](src/features/Setting/Footer.tsx)
- [src/layout/GlobalProvider/AppTheme.tsx](src/layout/GlobalProvider/AppTheme.tsx)
- [src/app/(variants)/(main)/chat/features/TelemetryNotification.tsx](src/app/(variants)/(main)/chat/features/TelemetryNotification.tsx)
- [src/app/(variants)/(main)/group/features/TelemetryNotification.tsx](src/app/(variants)/(main)/group/features/TelemetryNotification.tsx)
- [src/app/(variants)/(main)/memory/features/SourceLink.tsx](src/app/(variants)/(main)/memory/features/SourceLink.tsx)
- [src/app/(variants)/(main)/image/NotSupportClient.tsx](src/app/(variants)/(main)/image/NotSupportClient.tsx)
- [src/app/(variants)/(main)/community/features/Title.tsx](src/app/(variants)/(main)/community/features/Title.tsx)
- [src/app/(variants)/(main)/community/(detail)/features/ShareButton.tsx](src/app/(variants)/(main)/community/(detail)/features/ShareButton.tsx)
- [src/app/(variants)/(main)/community/(detail)/features/MakedownRender.tsx](src/app/(variants)/(main)/community/(detail)/features/MakedownRender.tsx)
- [src/app/(variants)/(main)/community/(detail)/features/Toc/Heading.tsx](src/app/(variants)/(main)/community/(detail)/features/Toc/Heading.tsx)
- [src/app/(variants)/(main)/community/(detail)/assistant/features/Details/Nav.tsx](src/app/(variants)/(main)/community/(detail)/assistant/features/Details/Nav.tsx)
- [src/app/(variants)/(main)/community/(detail)/model/features/Details/Nav.tsx](src/app/(variants)/(main)/community/(detail)/model/features/Details/Nav.tsx)
- [src/app/(variants)/(main)/community/(detail)/model/features/Details/Parameter/ParameterItem.tsx](src/app/(variants)/(main)/community/(detail)/model/features/Details/Parameter/ParameterItem.tsx)
- [src/app/(variants)/(main)/community/(detail)/provider/features/Header.tsx](src/app/(variants)/(main)/community/(detail)/provider/features/Header.tsx)
- [src/app/(variants)/(main)/community/(detail)/provider/features/Details/Nav.tsx](src/app/(variants)/(main)/community/(detail)/provider/features/Details/Nav.tsx)
- [src/app/(variants)/(main)/settings/features/UpgradeAlert.tsx](src/app/(variants)/(main)/settings/features/UpgradeAlert.tsx)
- [src/app/(variants)/(main)/settings/about/features/ItemCard.tsx](src/app/(variants)/(main)/settings/about/features/ItemCard.tsx)
- [src/app/(variants)/(main)/settings/about/features/ItemLink.tsx](src/app/(variants)/(main)/settings/about/features/ItemLink.tsx)
- [src/app/(variants)/(main)/settings/about/features/Version.tsx](src/app/(variants)/(main)/settings/about/features/Version.tsx)
- [src/app/(variants)/(main)/settings/provider/(list)/Footer.tsx](src/app/(variants)/(main)/settings/provider/(list)/Footer.tsx)
- [src/app/(variants)/(main)/settings/provider/features/ProviderConfig/index.tsx](src/app/(variants)/(main)/settings/provider/features/ProviderConfig/index.tsx)
- [src/app/(variants)/(main)/settings/stats/features/rankings/AssistantsRank.tsx](src/app/(variants)/(main)/settings/stats/features/rankings/AssistantsRank.tsx)
- [src/app/(variants)/(main)/settings/stats/features/rankings/TopicsRank.tsx](src/app/(variants)/(main)/settings/stats/features/rankings/TopicsRank.tsx)
- [packages/builtin-tool-web-browsing/src/client/Portal/PageContent/index.tsx](packages/builtin-tool-web-browsing/src/client/Portal/PageContent/index.tsx)
- [packages/builtin-tool-web-browsing/src/client/Render/PageContent/Loading.tsx](packages/builtin-tool-web-browsing/src/client/Render/PageContent/Loading.tsx)
- [packages/builtin-tool-web-browsing/src/client/Render/PageContent/Result.tsx](packages/builtin-tool-web-browsing/src/client/Render/PageContent/Result.tsx)
- [packages/builtin-tool-web-browsing/src/client/Render/Search/SearchResult/SearchResultItem.tsx](packages/builtin-tool-web-browsing/src/client/Render/Search/SearchResult/SearchResultItem.tsx)

## 图片组件（next/image）

这些组件/模块仍在直接使用 `next/image`。

- [src/components/WebFavicon/index.tsx](src/components/WebFavicon/index.tsx)
- [src/components/LabsModal/LabCard.tsx](src/components/LabsModal/LabCard.tsx)
- [src/components/Branding/ProductLogo/Custom.tsx](src/components/Branding/ProductLogo/Custom.tsx)
- [src/components/mdx/Image.tsx](src/components/mdx/Image.tsx)
- [src/layout/GlobalProvider/AppTheme.tsx](src/layout/GlobalProvider/AppTheme.tsx)
- [src/features/DevPanel/MetadataViewer/Og.tsx](src/features/DevPanel/MetadataViewer/Og.tsx)
- [src/features/DevPanel/features/Table/TooltipContent.tsx](src/features/DevPanel/features/Table/TooltipContent.tsx)
- [src/features/Conversation/Messages/components/SearchGrounding.tsx](src/features/Conversation/Messages/components/SearchGrounding.tsx)
- [src/app/(variants)/(mobile)/chat/settings/features/AgentInfoDescription/index.tsx](src/app/(variants)/(mobile)/chat/settings/features/AgentInfoDescription/index.tsx)
- [src/app/(variants)/(main)/community/features/CreateButton/Inner.tsx](src/app/(variants)/(main)/community/features/CreateButton/Inner.tsx)
- [src/app/(variants)/(main)/image/_layout/ConfigPanel/components/ImageUpload.tsx](src/app/(variants)/(main)/image/_layout/ConfigPanel/components/ImageUpload.tsx)
- [src/app/(variants)/(main)/image/_layout/ConfigPanel/components/MultiImagesUpload/index.tsx](src/app/(variants)/(main)/image/_layout/ConfigPanel/components/MultiImagesUpload/index.tsx)
- [src/app/(variants)/(main)/image/_layout/ConfigPanel/components/MultiImagesUpload/ImageManageModal.tsx](src/app/(variants)/(main)/image/_layout/ConfigPanel/components/MultiImagesUpload/ImageManageModal.tsx)
- [src/app/(variants)/(main)/chat/profile/features/ProfileEditor/AgentTool.tsx](src/app/(variants)/(main)/chat/profile/features/ProfileEditor/AgentTool.tsx)
- [src/app/(variants)/(main)/chat/profile/features/ProfileEditor/PluginTag.tsx](src/app/(variants)/(main)/chat/profile/features/ProfileEditor/PluginTag.tsx)
- [src/app/(variants)/(main)/group/profile/features/ProfileEditor/AgentTool.tsx](src/app/(variants)/(main)/group/profile/features/ProfileEditor/AgentTool.tsx)
- [src/app/(variants)/(main)/group/profile/features/ProfileEditor/PluginTag.tsx](src/app/(variants)/(main)/group/profile/features/ProfileEditor/PluginTag.tsx)
- [packages/builtin-tool-agent-builder/src/client/Intervention/InstallPlugin.tsx](packages/builtin-tool-agent-builder/src/client/Intervention/InstallPlugin.tsx)

## Script 注入（next/script）

- [src/app/(variants)/layout.tsx](src/app/(variants)/layout.tsx)
- [src/components/Analytics/Clarity.tsx](src/components/Analytics/Clarity.tsx)
- [src/components/Analytics/Plausible.tsx](src/components/Analytics/Plausible.tsx)
- [src/components/Analytics/Umami.tsx](src/components/Analytics/Umami.tsx)
- [src/components/Analytics/Desktop.tsx](src/components/Analytics/Desktop.tsx)

## 服务器侧请求/响应（next/server、next/headers）

这类文件通常不是“组件”，但属于前端工程中与 Next runtime 强耦合的 server-side 代码（如 `NextRequest` / `NextResponse` / `headers()` / `cookies()` / `after()` 等）。

- [packages/utils/src/server/auth.ts](packages/utils/src/server/auth.ts)
- [packages/utils/src/server/responsive.ts](packages/utils/src/server/responsive.ts)
- [packages/utils/src/server/correctOIDCUrl.ts](packages/utils/src/server/correctOIDCUrl.ts)
- [packages/utils/src/server/__tests__/auth.test.ts](packages/utils/src/server/__tests__/auth.test.ts)
- [packages/utils/src/server/correctOIDCUrl.test.ts](packages/utils/src/server/correctOIDCUrl.test.ts)
- [src/libs/oidc-provider/http-adapter.ts](src/libs/oidc-provider/http-adapter.ts)
- [src/libs/clerk-auth/index.ts](src/libs/clerk-auth/index.ts)
- [src/libs/clerk-auth/index.test.ts](src/libs/clerk-auth/index.test.ts)
- [src/libs/trpc/async/context.ts](src/libs/trpc/async/context.ts)
- [src/libs/trpc/lambda/context.ts](src/libs/trpc/lambda/context.ts)
- [src/libs/trpc/utils/request-adapter.ts](src/libs/trpc/utils/request-adapter.ts)
- [src/libs/next/proxy/define-config.ts](src/libs/next/proxy/define-config.ts)
- [src/libs/trusted-client/getSessionUser.ts](src/libs/trusted-client/getSessionUser.ts)
- [src/server/services/nextAuthUser/index.ts](src/server/services/nextAuthUser/index.ts)
- [src/server/modules/ModelRuntime/trace.ts](src/server/modules/ModelRuntime/trace.ts)
- [src/server/routers/tools/_helpers/scheduleToolCallReport.ts](src/server/routers/tools/_helpers/scheduleToolCallReport.ts)
- [src/server/routers/lambda/home.ts](src/server/routers/lambda/home.ts)
- [src/server/routers/lambda/topic.ts](src/server/routers/lambda/topic.ts)
- [src/server/routers/lambda/user.ts](src/server/routers/lambda/user.ts)
- [src/server/routers/lambda/__tests__/integration/topic.integration.test.ts](src/server/routers/lambda/__tests__/integration/topic.integration.test.ts)
- [src/server/translation.test.ts](src/server/translation.test.ts)

（桌面端构建脚本也引用到了 next/server|headers 相关匹配词，具体是否真实依赖需二次确认）
- [apps/desktop/electron-builder.js](apps/desktop/electron-builder.js)

## Next 内部 API（next/dist/*）

这类依赖通常更脆弱（属于 Next 内部实现/类型），迁移或升级时更需要关注。

- [src/components/client/ClientResponsiveContent/index.tsx](src/components/client/ClientResponsiveContent/index.tsx)
- [src/components/client/ClientResponsiveLayout.tsx](src/components/client/ClientResponsiveLayout.tsx)
- [src/features/MobileSwitchLoading/index.tsx](src/features/MobileSwitchLoading/index.tsx)
- [src/libs/next/config/define-config.ts](src/libs/next/config/define-config.ts)

## 未发现的旧 Pages Router API

在 `src/`、`apps/`、`packages/` 内未检索到以下典型 Pages Router 相关用法：

- `next/router`
- `getServerSideProps`
- `getStaticProps`
- `getStaticPaths`

## 如何自己复现/刷新该清单

在仓库根目录执行：

- `rg -l "next/navigation" src packages apps | sort`
- `rg -l "next/dynamic" src packages apps | sort`
- `rg -l "next/link" src packages apps | sort`
- `rg -l "next/image" src packages apps | sort`
- `rg -l "next/script" src packages apps | sort`
- `rg -l "next/(server|headers)" src packages apps | sort`
- `rg -l "next/dist/" src packages apps | sort`
