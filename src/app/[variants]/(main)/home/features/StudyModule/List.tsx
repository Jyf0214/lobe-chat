'use client';

import { memo } from 'react';

import { TUTORIALS } from './const';
import StudyModuleItem from './Item';

const StudyModuleList = memo(() => {
  return TUTORIALS.map((tutorial) => {
    return (
      <a
        href={tutorial.link}
        key={tutorial.id}
        rel="noopener noreferrer"
        style={{
          color: 'inherit',
          textDecoration: 'none',
        }}
        target="_blank"
      >
        <StudyModuleItem tutorial={tutorial} />
      </a>
    );
  });
});

export default StudyModuleList;
