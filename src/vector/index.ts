// Vector kit, web edition. Nothing here imports from the site. This barrel is server-safe and imports no
// @heroui/react code, so a page pays only for what it renders. HeroUI-backed parts have entry points of their own:
//   @/vector/button      Button, IconButton
//   @/vector/form/field, /select, /choices, /chip-row  (client inputs; @/vector/form re-exports all four)
//   @/vector/provider    VectorProvider (React Aria locale)
// Entry points of their own for another reason:
//   @/vector/disclosure  Disclosures (a server component on native details/summary, no HeroUI; its own module so
//                        the barrel never carries its stylesheet hooks for pages without a FAQ)
//   @/vector/appearance  the Appearance setting: head script and store
//   @/vector/button-native, @/vector/form/choices-native  the native parts the root layout renders on every page
export { AppIcon } from "./app-icon";
export { ButtonLink, LinkButton, buttonClass, type ButtonVariant } from "./button-link";
export { cn } from "./cn";
export { Callout, ErrorText, Meter, Status } from "./feedback";
export type { DisclosureItem } from "./disclosure";
export { Icon, type IconName } from "./icon";
export { ListRow, RowList } from "./list";
export { Panel, ReadoutRow, Rule } from "./panel";
export { SystemState } from "./system-state";
export { Heading, Label, Meta, Note, Text, Value, isMonoSafe, roleClass, toneClass, type RoleName, type Tone } from "./text";
