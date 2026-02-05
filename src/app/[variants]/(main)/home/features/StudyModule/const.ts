export type TutorialId =
  | 'agent'
  | 'agentMarket'
  | 'agentTeam'
  | 'imageGeneration'
  | 'memory'
  | 'page'
  | 'resource'
  | 'share';

export interface Tutorial {
  cover: string;
  id: TutorialId;
  link: string;
  readingTime: number; // in minutes
}

export const TUTORIALS: Tutorial[] = [
  {
    cover: 'https://hub-apac-1.lobeobjects.space/blog/assets2964497066067ca0588a7767eb4c1709.webp',
    id: 'agent',
    link: 'https://lobehub.com/docs/usage/getting-started/agent',
    readingTime: 5,
  },
  {
    cover: 'https://hub-apac-1.lobeobjects.space/blog/assets6ebefe8183f31de4de5bac1a921fb153.webp',
    id: 'memory',
    link: 'https://lobehub.com/docs/usage/getting-started/memory',
    readingTime: 4,
  },
  {
    cover: 'https://hub-apac-1.lobeobjects.space/blog/assets8b75f09941172c3a8620617cddfb7a4b.webp',
    id: 'resource',
    link: 'https://lobehub.com/docs/usage/getting-started/resource',
    readingTime: 5,
  },
  {
    cover: 'https://hub-apac-1.lobeobjects.space/blog/assets7caf7e0d83b8a4f3d177283bb0bc55d1.webp',
    id: 'page',
    link: 'https://lobehub.com/docs/usage/getting-started/page',
    readingTime: 4,
  },
  {
    cover: 'https://hub-apac-1.lobeobjects.space/blog/assets974acc551878f2f395518a3fbb9bd924.webp',
    id: 'imageGeneration',
    link: 'https://lobehub.com/docs/usage/getting-started/image-generation',
    readingTime: 3,
  },
  {
    cover: 'https://hub-apac-1.lobeobjects.space/blog/assets8e9b164fa30c795850ce8fa8ef7e7c24.webp',
    id: 'agentTeam',
    link: 'https://lobehub.com/docs/usage/agent/agent-team',
    readingTime: 6,
  },
  {
    cover: 'https://hub-apac-1.lobeobjects.space/blog/assetsbcd98b0913d2dfc30d5a2b5523115d33.webp',
    id: 'agentMarket',
    link: 'https://lobehub.com/docs/usage/community/agent-market',
    readingTime: 3,
  },
  {
    cover: 'https://hub-apac-1.lobeobjects.space/blog/assets196d679bc7071abbf71f2a8566f05aa3.webp',
    id: 'share',
    link: 'https://lobehub.com/docs/usage/agent/share',
    readingTime: 2,
  },
];
