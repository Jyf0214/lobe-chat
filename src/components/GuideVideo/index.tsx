import { cssVar } from 'antd-style';
import { memo } from 'react';

import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  fullWidth: {
    background: cssVar.colorFillSecondary,
    height: 'auto',
    width: '100%',
  },
});

interface GuideVideoProps {
  height: number;
  src: string;
  width: number;
}

const GuideVideo = memo<GuideVideoProps>(({ height, width, src }) => {
  return (
    <video
      autoPlay
      controls={false}
      height={height}
      loop
      muted
      src={src}
      style={styles.fullWidth}
      width={width}
    />
  );
});

export default GuideVideo;
