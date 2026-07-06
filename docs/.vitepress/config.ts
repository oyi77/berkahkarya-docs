import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'BerkahKarya Docs',
  description: 'Rumus Ketahanan Pangan — Income Resilience System & Strategy Docs',
  lang: 'id-ID',

  themeConfig: {
    logo: '/logo.png',
    siteTitle: 'BerkahKarya Docs',

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Brainstorm', link: '/brainstorm/index' },
      { text: 'berkahkarya.org', link: 'https://berkahkarya.org' },
    ],

    sidebar: [
      {
        text: '🧠 Rumus Ketahanan Pangan',
        items: [
          { text: 'Overview', link: '/brainstorm/index' },
          { text: 'A — Capital Pool', link: '/brainstorm/a-capital-pool' },
          { text: 'B — WF6 Arbitrage Engine', link: '/brainstorm/b-wf6-concrete' },
          { text: 'C — Hermes GM Triggers', link: '/brainstorm/c-hermes-triggers' },
          { text: 'D — Repo → Workflow Map', link: '/brainstorm/d-repo-map' },
          { text: 'E — Content & Outreach Cadence', link: '/brainstorm/e-content-outreach' },
        ],
      },
      {
        text: '🔗 Systems',
        items: [
          { text: 'Flywheel Diagram', link: '/brainstorm/flywheel' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Oyi77' },
    ],

    footer: {
      message: 'BerkahKarya — 1 Man, Infinite Agents',
      copyright: '© 2026 Paijo / BerkahKarya',
    },

    search: {
      provider: 'local',
    },
  },

  head: [
    ['meta', { name: 'theme-color', content: '#10b981' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'BerkahKarya Docs' }],
  ],
})
