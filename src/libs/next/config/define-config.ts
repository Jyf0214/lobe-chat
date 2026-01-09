import analyzer from '@next/bundle-analyzer';
import withSerwistInit from '@serwist/next';
import { codeInspectorPlugin } from 'code-inspector-plugin';
import type { NextConfig } from 'next';
import type { Header, Redirect } from 'next/dist/lib/load-custom-routes';
import ReactComponentName from 'react-scan/react-component-name/webpack';

interface CustomNextConfig {
  experimental?: NextConfig['experimental'];
  headers?: Header[];
  redirects?: Redirect[];
  turbopack?: NextConfig['turbopack'];
  webpack?: NextConfig['webpack'];
}

export function defineConfig(config: CustomNextConfig) {
  const isProd = process.env.NODE_ENV === 'production';
  const buildWithDocker = process.env.DOCKER === 'true';
  const isDesktop = process.env.NEXT_PUBLIC_IS_DESKTOP_APP === '1';

  const enableReactScan = !!process.env.REACT_SCAN_MONITOR_API_KEY;
  const shouldUseCSP = process.env.ENABLED_CSP === '1';

  const isTest =
    process.env.NODE_ENV === 'test' || process.env.TEST === '1' || process.env.E2E === '1';

  // if you need to proxy the api endpoint to remote server

  const isStandaloneMode = buildWithDocker || isDesktop;

  const standaloneConfig: NextConfig = {
    output: 'standalone',
    outputFileTracingIncludes: { '*': ['public/**/*', '.next/static/**/*'] },
  };

  const assetPrefix = process.env.NEXT_PUBLIC_ASSET_PREFIX;

  const nextConfig: NextConfig = {
    output: 'export',
    assetPrefix,
    compiler: {
      emotion: true,
    },
    compress: isProd,
    experimental: {
      optimizePackageImports: [
        'emoji-mart',
        '@emoji-mart/react',
        '@emoji-mart/data',
        '@icons-pack/react-simple-icons',
        '@lobehub/ui',
        '@lobehub/icons',
      ],
      // oidc provider depend on constructor.name
      // but swc minification will remove the name
      // so we need to disable it
      // refs: https://github.com/lobehub/lobe-chat/pull/7430
      serverMinification: false,
      webpackBuildWorker: true,
      webpackMemoryOptimizations: true,
      ...config.experimental,
    },
    logging: {
      fetches: {
        fullUrl: true,
        hmrRefreshes: true,
      },
    },
    reactStrictMode: true,

    // when external packages in dev mode with turbopack, this config will lead to bundle error
    serverExternalPackages: ['pdfkit'],

    transpilePackages: ['pdfjs-dist', 'mermaid', 'better-auth-harmony'],
    turbopack: {
      rules: isTest
        ? void 0
        : codeInspectorPlugin({
            bundler: 'turbopack',
            hotKeys: ['altKey', 'ctrlKey'],
          }),
      ...config.turbopack,
    },

    typescript: {
      ignoreBuildErrors: true,
    },

    webpack(baseWebpackConfig, options) {
      baseWebpackConfig.experiments = {
        asyncWebAssembly: true,
        layers: true,
      };

      // 开启该插件会导致 pglite 的 fs bundler 被改表
      if (enableReactScan) {
        baseWebpackConfig.plugins.push(ReactComponentName({}));
      }

      // to fix shikiji compile error
      // refs: https://github.com/antfu/shikiji/issues/23
      baseWebpackConfig.module.rules.push({
        resolve: {
          fullySpecified: false,
        },
        test: /\.m?js$/,
        type: 'javascript/auto',
      });

      // https://github.com/pinojs/pino/issues/688#issuecomment-637763276
      baseWebpackConfig.externals.push('pino-pretty');

      baseWebpackConfig.resolve.alias.canvas = false;

      // to ignore epub2 compile error
      // refs: https://github.com/lobehub/lobe-chat/discussions/6769
      baseWebpackConfig.resolve.fallback = {
        ...baseWebpackConfig.resolve.fallback,
        zipfile: false,
      };

      if (
        assetPrefix &&
        (assetPrefix.startsWith('http://') || assetPrefix.startsWith('https://'))
      ) {
        // fix the Worker URL cross-origin issue
        // refs: https://github.com/lobehub/lobe-chat/pull/9624
        baseWebpackConfig.module.rules.push({
          generator: {
            // @see https://webpack.js.org/configuration/module/#rulegeneratorpublicpath
            publicPath: '/_next/',
          },
          test: /worker\.ts$/,
          // @see https://webpack.js.org/guides/asset-modules/
          type: 'asset/resource',
        });
      }

      const updatedConfig = baseWebpackConfig;

      if (config.webpack) {
        return config.webpack(updatedConfig, options);
      }

      return updatedConfig;
    },
  };

  const noWrapper = (config: NextConfig) => config;

  const withBundleAnalyzer = process.env.ANALYZE === 'true' ? analyzer() : noWrapper;

  const withPWA =
    isProd && !isDesktop
      ? withSerwistInit({
          register: false,
          swDest: 'public/sw.js',
          swSrc: 'src/app/sw.ts',
        })
      : noWrapper;

  return withBundleAnalyzer(nextConfig as NextConfig);
}
