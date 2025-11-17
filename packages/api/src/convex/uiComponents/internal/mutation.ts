import { internalMutation } from "../../functions";

const uiComponents = [
  {
    name: "accordion",
    label: "Accordion",
    vendor: "shadcn",
  },
  {
    name: "alert",
    label: "Alert",
    vendor: "shadcn",
  },
  {
    name: "alert-dialog",
    label: "Alert Dialog",
    vendor: "shadcn",
  },
  {
    name: "aspect-ratio",
    label: "Aspect Ratio",
    vendor: "shadcn",
  },
  {
    name: "avatar",
    label: "Avatar",
    vendor: "shadcn",
  },
  {
    name: "badge",
    label: "Badge",
    vendor: "shadcn",
  },
  {
    name: "breadcrumb",
    label: "Breadcrumb",
    vendor: "shadcn",
  },
  {
    name: "button",
    label: "Button",
    vendor: "shadcn",
  },
  {
    name: "button-group",
    label: "Button Group",
    vendor: "shadcn",
  },
  {
    name: "calendar",
    label: "Calendar",
    vendor: "shadcn",
  },
  {
    name: "card",
    label: "Card",
    vendor: "shadcn",
  },
  {
    name: "carousel",
    label: "Carousel",
    vendor: "shadcn",
  },
  {
    name: "chart",
    label: "Chart",
    vendor: "shadcn",
  },
  {
    name: "checkbox",
    label: "Checkbox",
    vendor: "shadcn",
  },
  {
    name: "collapsible",
    label: "Collapsible",
    vendor: "shadcn",
  },
  {
    name: "command",
    label: "Command",
    vendor: "shadcn",
  },
  {
    name: "context-menu",
    label: "Context Menu",
    vendor: "shadcn",
  },
  {
    name: "dialog",
    label: "Dialog",
    vendor: "shadcn",
  },
  {
    name: "drawer",
    label: "Drawer",
    vendor: "shadcn",
  },
  {
    name: "dropdown-menu",
    label: "Dropdown Menu",
    vendor: "shadcn",
  },
  {
    name: "empty",
    label: "Empty",
    vendor: "shadcn",
  },
  {
    name: "field",
    label: "Field",
    vendor: "shadcn",
  },
  {
    name: "form",
    label: "Form",
    vendor: "shadcn",
  },
  {
    name: "hover-card",
    label: "Hover Card",
    vendor: "shadcn",
  },
  {
    name: "input",
    label: "Input",
    vendor: "shadcn",
  },
  {
    name: "input-group",
    label: "Input Group",
    vendor: "shadcn",
  },
  {
    name: "input-otp",
    label: "Input OTP",
    vendor: "shadcn",
  },
  {
    name: "item",
    label: "Item",
    vendor: "shadcn",
  },
  {
    name: "label",
    label: "Label",
    vendor: "shadcn",
  },
  {
    name: "menubar",
    label: "Menubar",
    vendor: "shadcn",
  },
  {
    name: "navigation-menu",
    label: "Navigation Menu",
    vendor: "shadcn",
  },
  {
    name: "pagination",
    label: "Pagination",
    vendor: "shadcn",
  },
  {
    name: "popover",
    label: "Popover",
    vendor: "shadcn",
  },
  {
    name: "progress",
    label: "Progress",
    vendor: "shadcn",
  },
  {
    name: "radio-group",
    label: "Radio Group",
    vendor: "shadcn",
  },
  {
    name: "resizable",
    label: "Resizable",
    vendor: "shadcn",
  },
  {
    name: "scroll-area",
    label: "Scroll Area",
    vendor: "shadcn",
  },
  {
    name: "select",
    label: "Select",
    vendor: "shadcn",
  },
  {
    name: "separator",
    label: "Separator",
    vendor: "shadcn",
  },
  {
    name: "sheet",
    label: "Sheet",
    vendor: "shadcn",
  },
  {
    name: "sidebar",
    label: "Sidebar",
    vendor: "shadcn",
  },
  {
    name: "skeleton",
    label: "Skeleton",
    vendor: "shadcn",
  },
  {
    name: "slider",
    label: "Slider",
    vendor: "shadcn",
  },
  {
    name: "sonner",
    label: "Sonner",
    vendor: "shadcn",
  },
  {
    name: "spinner",
    label: "Spinner",
    vendor: "shadcn",
  },
  {
    name: "switch",
    label: "Switch",
    vendor: "shadcn",
  },
  {
    name: "table",
    label: "Table",
    vendor: "shadcn",
  },
  {
    name: "tabs",
    label: "Tabs",
    vendor: "shadcn",
  },
  {
    name: "textarea",
    label: "Textarea",
    vendor: "shadcn",
  },
  {
    name: "toggle",
    label: "Toggle",
    vendor: "shadcn",
  },
  {
    name: "toggle-group",
    label: "Toggle Group",
    vendor: "shadcn",
  },
  {
    name: "tooltip",
    label: "Tooltip",
    vendor: "shadcn",
  },
  {
    name: "kbd",
    label: "KBD",
    vendor: "shadcn",
  },
  {
    name: "native-select",
    label: "Native Select",
    vendor: "shadcn",
  },
] as const;

export const upsertMany = internalMutation({
  args: {},
  handler: async (ctx) => {
    for (const uiComponent of uiComponents) {
      const existingUiComponent = await ctx.db
        .query("uiComponents")
        .withIndex("vendor_name", (q) =>
          q.eq("vendor", uiComponent.vendor).eq("name", uiComponent.name)
        )
        .unique();
      if (existingUiComponent) {
        await ctx.db.patch(existingUiComponent._id, {
          label: uiComponent.label,
        });
      } else {
        await ctx.db.insert("uiComponents", uiComponent);
      }
    }
  },
});
