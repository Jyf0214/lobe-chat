import { Icon, type IconSize, Tooltip, type TooltipProps } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import { CircleHelp } from 'lucide-react';
import { type CSSProperties, memo } from 'react';

import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  colored: {
    color: cssVar.colorTextTertiary,
  },
});

interface InfoTooltipProps extends Omit<TooltipProps, 'children'> {
  iconStyle?: CSSProperties;
  size?: IconSize;
}

const InfoTooltip = memo<InfoTooltipProps>(({ size, iconStyle, ...res }) => {
  const coloredStyle = {
    ...styles.colored,
    ...iconStyle,
  };

  return (
    <Tooltip {...res}>
      <Icon icon={CircleHelp} size={size} style={coloredStyle} />
    </Tooltip>
  );
});

export default InfoTooltip;
