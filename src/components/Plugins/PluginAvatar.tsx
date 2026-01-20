import { MCP } from '@lobehub/icons';
import { Avatar } from '@lobehub/ui';
import { type CSSProperties, memo } from 'react';

import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  flexContainer: {
    flex: 'none',
    overflow: 'hidden',
  },
});

interface PluginAvatarProps {
  alt?: string;
  avatar?: string;
  size?: number;
  style?: CSSProperties;
}

const PluginAvatar = memo<PluginAvatarProps>(({ avatar, style, size = 40, alt }) => {
  return avatar === 'MCP_AVATAR' ? (
    <MCP.Avatar
      className={'ant-avatar'}
      shape={'square'}
      size={size}
      style={StyleSheet.compose(styles.flexContainer, style)}
    />
  ) : (
    <Avatar
      alt={alt}
      avatar={avatar}
      shape={'square'}
      size={size}
      style={StyleSheet.compose(styles.flexContainer, style)}
    />
  );
});

export default PluginAvatar;
