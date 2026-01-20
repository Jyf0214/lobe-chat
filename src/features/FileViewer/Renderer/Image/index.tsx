'use client';

import { Center } from '@lobehub/ui';
import { memo, useState } from 'react';

import NeuralNetworkLoading from '@/components/NeuralNetworkLoading';
import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  fullWidth: {
    display: 'none',
    height: '100%',
    objectFit: 'contain',
    overflow: 'hidden',
    width: '100%',
  },
});

interface ImageViewerProps {
  fileId: string;
  url: string | null;
}

const ImageViewer = memo<ImageViewerProps>(({ url }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  if (!url) return null;

  return (
    <Center height={'100%'} width={'100%'}>
      {!isLoaded && <NeuralNetworkLoading size={36} />}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt="Image preview"
        onLoad={() => setIsLoaded(true)}
        src={url}
        style={{ ...styles.fullWidth, display: isLoaded ? 'block' : 'none' }}
      />
    </Center>
  );
});

export default ImageViewer;
