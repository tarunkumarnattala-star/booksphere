import type { PostType } from "./types";

// The eleven perspective types in the product's three groups, in the product's order.
//
// This list used to exist only inside the composer, while the book page showed a different
// seven-box grouping from `perspectiveClusters` - so the product gave two answers to "what
// kinds of perspective are there", one on each screen. One list, imported by both.
//
// The order is the argument: an account of what actually happened when someone used an idea
// exists nowhere else, so it leads. A summary is the one thing a language model already does
// better than a reader will, so it comes last. Quote is retired and never appears here.
export const perspectiveGroups: Array<{ label: string; types: PostType[] }> = [
  { label: "What happened when you used it", types: ["Real-Life Result", "What Did Not Work", "Application", "Personal Experience"] },
  { label: "Where it breaks down", types: ["Disagreement", "Limitation"] },
  { label: "Understanding the idea", types: ["Insight", "Question", "Connection", "Summary"] }
];
