'use client';

import { type FC } from 'react';
import { Link, type LinkProps } from 'react-router-dom';

const EXTERNAL_HREF_REGEX = /https?:\/\//;

interface AProps extends Omit<LinkProps, 'to'> {
  href?: string;
}

const A: FC<AProps> = ({ href = '', ...props }) => {
  const isOutbound = EXTERNAL_HREF_REGEX.test(href as string);
  const isOfficial = String(href).includes('lobechat') || String(href).includes('lobehub');

  // For external links, use <a> tag
  if (isOutbound) {
    return (
      <a
        href={href}
        rel={!isOfficial ? 'nofollow' : undefined}
        target="_blank"
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      />
    );
  }

  return <Link to={href} {...props} />;
};

export default A;
