import { type ImgHTMLAttributes, forwardRef } from 'react';

interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  unoptimized?: boolean;
}

const Image = forwardRef<HTMLImageElement, ImageProps>(
  ({ fill, priority, quality, unoptimized, style, ...props }, ref) => {
    const fillStyles = fill
      ? {
          height: '100%',
          left: 0,
          objectFit: 'cover' as const,
          position: 'absolute' as const,
          top: 0,
          width: '100%',
        }
      : {};

    return <img ref={ref} style={{ ...fillStyles, ...style }} {...props} />;
  },
);

Image.displayName = 'Image';

export default Image;
