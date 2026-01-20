import { Flexbox, Highlighter, Tag } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import * as motion from 'motion/react-m';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { type MCPErrorInfoMetadata } from '@/types/plugins';
import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  spacing: {
    backgroundColor: cssVar.colorFillQuaternary,
    borderRadius: 8,
    fontFamily: 'monospace',
    fontSize: '11px',
    padding: '8px 12px',
  },
  spacing1: {
    marginTop: 4,
    wordBreak: 'break-all',
  },
  style: {
    overflow: 'hidden',
  },
  style1: {
    maxHeight: 200,
    overflow: 'auto',
  },
});

const ErrorDetails = memo<{
  errorInfo: MCPErrorInfoMetadata;
  errorMessage?: string;
}>(({ errorInfo, errorMessage }) => {
  const { t } = useTranslation('plugin');

  return (
    <Flexbox gap={8}>
      <motion.div
        animate={{ height: 'auto', opacity: 1 }}
        initial={{ height: 0, opacity: 0 }}
        style={styles.style}
      >
        <Flexbox gap={8} style={styles.spacing}>
          {errorInfo.params && (
            <Flexbox gap={4}>
              <div>
                <Tag color="blue" variant={'filled'}>
                  {t('mcpInstall.errorDetails.connectionParams')}
                </Tag>
              </div>
              <div style={styles.spacing1}>
                {errorInfo.params.command && (
                  <div>
                    {t('mcpInstall.errorDetails.command')}: {errorInfo.params.command}
                  </div>
                )}
                {errorInfo.params.args && (
                  <div>
                    {t('mcpInstall.errorDetails.args')}: {errorInfo.params.args.join(' ')}
                  </div>
                )}
              </div>
            </Flexbox>
          )}

          {errorInfo.errorLog && (
            <Flexbox gap={4}>
              <div>
                <Tag color="red" variant={'filled'}>
                  {t('mcpInstall.errorDetails.errorOutput')}
                </Tag>
              </div>
              <Highlighter language={'log'} style={styles.style1}>
                {errorInfo.errorLog}
              </Highlighter>
            </Flexbox>
          )}

          {errorInfo.originalError && errorInfo.originalError !== errorMessage && (
            <div>
              <Tag color="orange">{t('mcpInstall.errorDetails.originalError')}</Tag>
              <div style={styles.spacing1}>{errorInfo.originalError}</div>
            </div>
          )}
        </Flexbox>
      </motion.div>
    </Flexbox>
  );
});

export default ErrorDetails;
