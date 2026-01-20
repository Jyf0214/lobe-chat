import { Tag } from '@lobehub/ui';
import { memo } from 'react';

import { useCateColor } from './useCateColor';

interface CateTagProps {
  cate?: string | null;
}

const CateTag = memo<CateTagProps>(({ cate }) => {
  const cateColor = useCateColor(cate);
  const flexContainerStyle = {
    background: cateColor?.backgroundColor,
    borderRadius: 16,
    color: cateColor?.color,
    flex: 'none',
    fontWeight: 500,
  };
  return (
    <Tag size={'large'} style={flexContainerStyle}>
      {cate?.toUpperCase() || 'CHORE'}
    </Tag>
  );
});

export default CateTag;
