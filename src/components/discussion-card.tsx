import { DiscussionPost } from "@/lib/types";
import { authorProfileFor, getBook } from "@/lib/data";
import { contributionDestinationUrl } from "@/lib/contributions";

// One perspective, set as a record: the type stamp in the docket column, then the title, the
// writer's own opening lines, the book, and who wrote it. The same form on Home, on a book
// page, in a genre, on a profile and on the saved shelf, because it is the same thing.
//
// What used to be here: a 28px white card with a profile chip, a Follow button, a ranking
// pill ("Hot"), two reaction pill rows, like and comment counters reading zero, and a
// ten-button action bar - all wrapped around two sentences somebody wrote. The actions live
// on the perspective's own page, where there is room to mean something.
export function DiscussionCard({
  post,
  showBook = false,
  canDelete = false,
  onDelete
}: {
  post: DiscussionPost;
  showBook?: boolean;
  compact?: boolean;
  canDelete?: boolean;
  onDelete?: () => void;
}) {
  const profile = authorProfileFor(post);
  const book = getBook(post.bookId);
  const written = new Date(post.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <li id={post.id} className="record scroll-mt-24">
      <p className="caption record-stamp">{post.postType}</p>
      <div className="min-w-0">
        <h3 className="record-title">
          <a href={contributionDestinationUrl(post)} className="transition-colors hover:text-[color:var(--accent)]">
            {post.title}
          </a>
        </h3>
        <p className="record-text line-clamp-3">{post.body}</p>
        {showBook && book && (
          <p className="record-meta">
            {book.title} &middot; {book.author}
          </p>
        )}
        <p className={showBook && book ? "record-writer" : "record-writer !mt-5"}>
          Written by {profile.name} &middot; {written}
        </p>
        {canDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="caption mt-5 min-h-11 text-[color:var(--color-rose)] transition-opacity hover:opacity-70"
          >
            Delete this perspective
          </button>
        )}
      </div>
    </li>
  );
}
