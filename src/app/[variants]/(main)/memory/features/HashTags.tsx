import { Flexbox, Icon, Tag } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import { HashIcon } from 'lucide-react';
import { memo } from 'react';

import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  spacing: {
    color: cssVar.colorTextDescription,
    gap: 2,
    marginRight: 12,
    paddingInline: 0,
  },
});

interface HashTagsProps {
  hashTags?: string[] | null;
}

const HashTags = memo<HashTagsProps>(({ hashTags }) => {
  if (!hashTags || hashTags.length === 0) return;
  return (
    hashTags &&
    hashTags.length > 0 && (
      <Flexbox horizontal wrap="wrap">
        {hashTags.map((tag, index) => (
          <Tag
            icon={<Icon icon={HashIcon} />}
            key={index}
            style={styles.spacing}
            variant={'borderless'}
          >
            {tag}
          </Tag>
        ))}
      </Flexbox>
    )
  );
});

export default HashTags;
