// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  mySidebar: [
    {
      type: "category",
      label: "CLI",
      link: {
        type: "generated-index",
        title: "CLI",
        description: "How to use our CLI to interact with our pools",
        slug: "/cli",
        keywords: ["guides", "cli"],
      },
      items: [
        {
          type: "doc",
          id: "cli/getting-started",
        },
        {
          type: "doc",
          id: "cli/connecting-your-wallet",
        },
        {
          type: "doc",
          label: "CLI reference",
          id: "cli/reference",
        },
      ],
    },
    {
      type: "category",
      label: "TypeScript SDK",
      link: {
        type: "generated-index",
        title: "SDK Guide",
        description:
          "How to use our SDK to interact with our pools from TypeScript",
        slug: "/sdk",
        keywords: ["guides", "sdk"],
      },
      items: [
        {
          type: "doc",
          id: "sdk/get-started",
        },
        {
          type: "doc",
          id: "sdk/connecting-your-wallet",
        },
        {
          type: "doc",
          id: "sdk/swapping",
        },
        {
          type: "doc",
          id: "sdk/adding-liquidity",
        },
        {
          type: "doc",
          id: "sdk/removing-liquidity",
        },
        {
          type: "link",
          label: "SDK reference",
          href: "pathname:///reference/sdk/",
        },
      ],
    },
    {
      type: "link",
      label: "Design System",
      href: "pathname:///reference/design-system/",
    },
  ],
};

module.exports = sidebars;
