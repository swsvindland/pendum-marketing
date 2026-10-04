"use client";

import { createContext, useContext, type ReactNode } from "react";

// The next step after a result ("See Pendum Macros", with what the app does with the number) is content the server
// frame owns. It reaches the client ResultPanel through this context, rendered on the server and passed down as a
// node, so no tool has to carry it and no client file reads the site content.

const NextStepContext = createContext<ReactNode>(null);

/** Mounted by the frame around the tool with the server-rendered next step. */
export function NextStepProvider({ step, children }: { step: ReactNode; children: ReactNode }) {
  return <NextStepContext.Provider value={step}>{children}</NextStepContext.Provider>;
}

/** The next step for the result panel's footer, or null outside a frame. */
export const useNextStep = () => useContext(NextStepContext);
