import type { Preview } from "@storybook/nextjs-vite";
import "../app/globals.css";

const preview: Preview = {
  parameters: {
    a11y: {
      options: {
        runOnly: {
          type: "tag",
          values: [
            "wcag2a",
            "wcag2aa",
            "wcag21a",
            "wcag21aa",
            "wcag22aa",
            "best-practice",
          ],
        },
      },
      test: "error",
    },
    backgrounds: {
      options: {
        app: { name: "App background", value: "#fff8fb" },
        surface: { name: "Surface", value: "#ffffff" },
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      codePanel: true,
    },
    layout: "centered",
    options: {
      storySort: {
        order: [
          "Design System",
          [
            "Foundations",
            ["Colors", "Typography", "Spacing", "Border Radius", "Shadow"],
            "Components",
          ],
          "Features",
          ["Wishlist"],
        ],
      },
    },
  },
};

export default preview;
