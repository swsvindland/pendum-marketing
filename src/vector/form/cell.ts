import { cx } from "../cx";

/**
 * The cell look shared by Choices segments, NativeChoices segments and ChipRow chips (§5.5): selected is the signal
 * fill with ink. Focus is the 2pt tint outline, offset 2 (§4.5), raised over the neighbouring cells. `outline-solid`
 * matters: HeroUI's `.radio__content` and `.checkbox__content` set `--tw-outline-style: none`, which `outline-2`
 * alone would read. Only background and colour transition: `transition-colors` would include outline-color, and
 * the ring would then fade in from the cell's text colour instead of appearing at full tint on the first frame.
 */
export const cell = ({ isSelected, isFocusVisible }: { isSelected: boolean; isFocusVisible: boolean }) =>
  cx(
    "relative flex w-full cursor-pointer items-center justify-center gap-1 transition-[background-color,color] duration-150 ease-standard",
    isFocusVisible && "z-10 outline-2 outline-offset-2 outline-solid outline-focus",
    isSelected ? "bg-accent text-accent-foreground" : "bg-surface text-foreground hover:bg-surface-secondary"
  );

/**
 * The same focus outline as `peer-*` variants, for a cell drawn beside a native sr-only input (NativeChoices): the
 * browser's :focus-visible on the input lights the cell, with no script tracking focus.
 */
export const peerCellFocus =
  "peer-focus-visible:z-10 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-solid peer-focus-visible:outline-focus";

// The inner radius of the 4pt container under its 1pt edge, for the first and last cells of a segmented control.
export const startCorners = "rounded-s-[calc(var(--radius-control)-1px)]";
export const endCorners = "rounded-e-[calc(var(--radius-control)-1px)]";

/** The label role of a segment: mono readouts, else small for sm cells and for three or more cells (so a label like "More carbs" keeps one line at 375), else h4. */
export const segmentLabel = (count: number, size: "md" | "sm", mono: boolean) =>
  mono ? "type-readout-xs" : size === "sm" || count > 2 ? "type-small" : "type-h4";
