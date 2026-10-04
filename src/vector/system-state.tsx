import type { ReactNode } from "react";
import { cx } from "./cx";
import { ErrorText } from "./feedback";
import { Heading, Label, Text } from "./text";

/**
 * Empty and error states (§5.7), start-aligned where the content would be, at form width, with no illustration:
 * the code as a Label (with optional mono meta, such as an error ID), an optional heading, the message (body for
 * `empty`, ErrorText for `error`), then the ways forward: one LinkButton, or a secondary Retry for an error. Server
 * safe; a Retry that needs a handler is passed in `actions` from a client component.
 */
export function SystemState({
  kind = "empty",
  code,
  meta,
  title,
  titleLevel = 2,
  message,
  actions,
  className,
}: {
  kind?: "empty" | "error";
  code?: string;
  meta?: string;
  title?: string;
  titleLevel?: 1 | 2 | 3;
  message?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("flex max-w-form flex-col items-start gap-3", className)}>
      {code || meta ? (
        <div className="flex flex-wrap items-center gap-x-3">
          {code ? <Label>{code}</Label> : null}
          {meta ? <span className="type-readout-xs text-muted">{meta}</span> : null}
        </div>
      ) : null}
      {title ? (
        <Heading level={titleLevel}>{title}</Heading>
      ) : null}
      {message ? (
        kind === "error" ? (
          <ErrorText message={message} />
        ) : (
          <Text tone="secondary" className="text-pretty">
            {message}
          </Text>
        )
      ) : null}
      {actions ? <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">{actions}</div> : null}
    </div>
  );
}
