import React, { memo } from 'react';
import { Link as RouterLink, type LinkProps as RouterLinkProps } from 'react-router-dom';

interface LinkProps extends Omit<RouterLinkProps, 'to'> {
  children?: React.ReactNode | undefined;
  href: string;
}

const Link = memo<LinkProps>(({ href, ...props }) => {
  return <RouterLink {...props} to={href} />;
});

export default Link;
