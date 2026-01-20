import { Block, Flexbox, Highlighter, Text } from '@lobehub/ui';
import { Divider } from 'antd';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { StyleSheet } from '@/utils/styles';

import Arguments from '../Arguments';

const styles = StyleSheet.create({
  colored: {
    background: 'transparent',
    borderRadius: 0,
    maxHeight: 300,
    overflow: 'auto',
  },
  spacing: {
    marginBlock: 0,
  },
});

interface FallbackArgumentRenderProps {
  content: string;
  requestArgs?: string;
  toolCallId: string;
}

export const FallbackArgumentRender = memo<FallbackArgumentRenderProps>(
  ({ toolCallId, content, requestArgs }) => {
    const { t } = useTranslation('plugin');

    // Parse and display result content
    const { data, language } = useMemo(() => {
      try {
        const parsed = JSON.parse(content || '');
        // If parsed result is a string, return it directly
        if (typeof parsed === 'string') {
          return { data: parsed, language: 'plaintext' };
        }
        return { data: JSON.stringify(parsed, null, 2), language: 'json' };
      } catch {
        return { data: content || '', language: 'plaintext' };
      }
    }, [content]);

    // Default render: show arguments and result
    return (
      <Block id={toolCallId} variant={'outlined'} width={'100%'}>
        <Arguments arguments={requestArgs} />
        {content && (
          <>
            <Divider style={styles.spacing} />
            <Flexbox paddingBlock={'8px 0'} paddingInline={16}>
              <Text>{t('debug.response')}</Text>
            </Flexbox>
            <Highlighter language={language} style={styles.colored} variant={'filled'}>
              {data}
            </Highlighter>
          </>
        )}
      </Block>
    );
  },
);
