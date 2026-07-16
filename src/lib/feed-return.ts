export const FEED_RETURN_KEY = "booksphere.feed.return";

export type FeedReturnState = {
  postId: string;
  scrollY: number;
  savedAt: number;
};

export function rememberFeedPosition(postId: string) {
  const state: FeedReturnState = {
    postId,
    scrollY: window.scrollY,
    savedAt: Date.now()
  };
  window.sessionStorage.setItem(FEED_RETURN_KEY, JSON.stringify(state));
}

export function readFeedPosition() {
  try {
    const state = JSON.parse(window.sessionStorage.getItem(FEED_RETURN_KEY) || "null") as FeedReturnState | null;
    if (!state || Date.now() - state.savedAt > 30 * 60 * 1000) {
      window.sessionStorage.removeItem(FEED_RETURN_KEY);
      return null;
    }
    return state;
  } catch {
    window.sessionStorage.removeItem(FEED_RETURN_KEY);
    return null;
  }
}

export function clearFeedPosition() {
  window.sessionStorage.removeItem(FEED_RETURN_KEY);
}
