import { SiReact } from '@icons-pack/react-simple-icons';
import { Icon } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import { CodeXml, GlobeIcon, ImageIcon, Loader2, OrigamiIcon } from 'lucide-react';
import { memo } from 'react';

import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  colored: {
    color: cssVar.colorTextSecondary,
  },
});

interface ArtifactProps {
  type: string;
}

const SIZE = 28;
const ArtifactIcon = memo<ArtifactProps>(({ type }) => {
  if (!type) return <Icon icon={Loader2} size={SIZE} spin style={styles.colored} />;

  switch (type) {
    case 'application/lobe.artifacts.code': {
      return <Icon icon={CodeXml} size={SIZE} style={styles.colored} />;
    }

    case 'application/lobe.artifacts.react': {
      return <SiReact size={SIZE} style={styles.colored} />;
    }

    case 'image/svg+xml': {
      return <Icon icon={ImageIcon} size={SIZE} style={styles.colored} />;
    }
    case 'text/html': {
      return <Icon icon={GlobeIcon} size={SIZE} style={styles.colored} />;
    }
    default: {
      return (
        <Icon color={cssVar.purple} icon={OrigamiIcon} size={{ size: SIZE, strokeWidth: 1.2 }} />
      );
    }
  }
});

export default ArtifactIcon;
