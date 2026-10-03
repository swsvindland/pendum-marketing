import { cn } from "../cn";

/**
 * The cell look shared by Choices segments and ChipRow chips (§5.5): selected is the signal fill with ink. Focus is
 * the 2pt tint outline, offset 2 (§4.5), raised over the neighbouring cells. `outline-solid` matters: HeroUI's
 * `.radio__content` and `.checkbox__content` set `--tw-outline-style: none`, which `outline-2` alone would read.
 */
export const cell = ({ isSelected, isFocusVisible }: { isSelected: boolean; isFocusVisible: boolean }) =>
  cn(
    "relative flex w-full cursor-pointer items-center justify-center gap-1 transition-colors duration-150 ease-standard",
    isFocusVisible && "z-10 outline-2 outline-offset-2 outline-solid outline-focus",
    isSelected ? "bg-accent text-accent-foreground" : "bg-surface text-foreground hover:bg-surface-secondary"
  );
