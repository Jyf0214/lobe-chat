import Image from '@/libs/next/Image';
import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  style: {
    borderRadius: 4,
  },
});

interface WebFaviconProps {
  alt?: string;
  size?: number;
  title?: string;
  url: string;
}

const WebFavicon = ({ url, title, alt, size = 14 }: WebFaviconProps) => {
  const urlObj = new URL(url);
  const host = urlObj.hostname;

  return (
    <Image
      alt={alt || title || url}
      height={size}
      src={`https://icons.duckduckgo.com/ip3/${host}.ico`}
      style={styles.style}
      unoptimized
      width={size}
    />
  );
};

export default WebFavicon;
