import { themes as prismThemes } from "prism-react-renderer";

const config = {
  title: "Bifrost Wallet Docs",
  tagline: "Integrate with Bifrost Wallet and list curated assets",
  favicon: "img/favicon.png",

  url: "https://docs.bifrostwallet.com",
  baseUrl: "/",

  // Inline JS/CSS: incompatible with a strict CSP on the LB/backend bucket.
  baseUrlIssueBanner: false,

  organizationName: "bifrostwallet",
  projectName: "documentation",

  onBrokenLinks: "throw",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  // Hand-rolled plugins/themes; add gtag / Algolia packages later if needed.
  plugins: [
    [
      "@docusaurus/plugin-content-docs",
      {
        routeBasePath: "/",
        sidebarPath: "./sidebars.js",
        editUrl: "https://github.com/bifrostwallet/documentation/edit/main/",
      },
    ],
    "@docusaurus/plugin-sitemap",
  ],

  themes: [
    [
      "@docusaurus/theme-classic",
      {
        customCss: "./src/css/custom.css",
      },
    ],
  ],

  themeConfig: {
    image: "img/logo.svg",
    colorMode: {
      defaultMode: "dark",
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    docs: {
      sidebar: {
        hideable: false,
        autoCollapseCategories: false,
      },
    },
    navbar: {
      title: "",
      logo: {
        alt: "Bifrost Wallet",
        src: "img/logo.svg",
        href: "/",
      },
      items: [
        {
          href: "https://bifrostwallet.com",
          label: "Website",
          position: "right",
        },
        {
          href: "https://support.bifrostwallet.com",
          label: "Support",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [],
      copyright: `© ${new Date().getFullYear()} Bifrost Software Ltd`,
    },
    prism: {
      theme: prismThemes.oneDark,
      darkTheme: prismThemes.oneDark,
      additionalLanguages: ["bash", "json", "typescript"],
    },
  },
};

export default config;
