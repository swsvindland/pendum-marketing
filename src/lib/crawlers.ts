// The crawlers src/app/robots.ts names, out of the route file: Next's metadata-route loader re-exports every named
// export of a route file from the generated route, so the lists live here and the route exports `default` alone.

/**
 * The search and answer agents (vendor documentation, read 2026-10-03):
 * - OpenAI: OAI-SearchBot builds the ChatGPT search index (sites that opt out are not shown in ChatGPT search
 *   answers); ChatGPT-User fetches a page when a user asks.
 * - Anthropic: Claude-SearchBot indexes for Claude's search; Claude-User fetches when a user asks.
 * - Perplexity: PerplexityBot indexes; Perplexity-User fetches when a user asks.
 * - Google: Googlebot feeds Search, AI Overviews and AI Mode.
 * - Bingbot feeds Bing and Copilot, and Bing is the index behind ChatGPT search's third-party results.
 * - Apple: Applebot feeds Siri, Spotlight and Safari.
 */
export const searchAndAnswerAgents = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Googlebot",
  "Bingbot",
  "Applebot",
];

/**
 * The training crawlers: GPTBot (OpenAI) and ClaudeBot (Anthropic) train models; Google-Extended only controls
 * Gemini training and grounding and does not affect inclusion in Search; Applebot-Extended only controls training
 * of Apple models; Amazonbot (Alexa), meta-externalagent (Meta AI) and CCBot (Common Crawl, the open corpus many
 * models train on) are training and answer crawlers.
 * TODO(owner): confirm. Allowing them lets future models know the apps exist.
 */
export const trainingAgents = [
  "GPTBot",
  "ClaudeBot",
  "Google-Extended",
  "Applebot-Extended",
  "Amazonbot",
  "meta-externalagent",
  "CCBot",
];
