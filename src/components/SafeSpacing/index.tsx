import { SafeArea, type SafeAreaProps } from '@lobehub/ui/mobile';
import { memo } from 'react';

import { HEADER_HEIGHT, MOBILE_NABBAR_HEIGHT, MOBILE_TABBAR_HEIGHT } from '@/const/layoutTokens';
import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  flexContainer: {
    flex: 'none',
  },
});

interface SafeSpacingProps {
  height?: number;
  mobile?: boolean;
  position?: SafeAreaProps['position'];
}

const SafeSpacing = memo<SafeSpacingProps>(({ height, position = 'top', mobile }) => {
  let h;
  if (mobile) {
    h = position === 'top' ? MOBILE_NABBAR_HEIGHT : MOBILE_TABBAR_HEIGHT;
  } else {
    h = HEADER_HEIGHT;
  }

  const flexContainerStyle = {
    ...styles.flexContainer,
    height: height || h,
  };

  return (
    <>
      <div style={flexContainerStyle} />
      {mobile && <SafeArea position={position} />}
    </>
  );
});

export default SafeSpacing;
