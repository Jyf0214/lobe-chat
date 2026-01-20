import { memo, useEffect, useRef } from 'react';

import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  style: {
    border: 'none',
  },
});

interface HTMLRendererProps {
  height?: string;
  htmlContent: string;
  width?: string;
}
const HTMLRenderer = memo<HTMLRendererProps>(({ htmlContent, width = '100%', height = '100%' }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const styleObject = {
    ...styles.style,
    height,
    width,
  };

  useEffect(() => {
    if (!iframeRef.current) return;

    const doc = iframeRef.current.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write(htmlContent);
    doc.close();
  }, [htmlContent]);

  return <iframe ref={iframeRef} style={styleObject} title="html-renderer" />;
});

export default HTMLRenderer;
