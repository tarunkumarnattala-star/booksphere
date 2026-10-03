import Link from "next/link";

export default function NotFound() {
  return (
    <div className="editorial-page editorial-prose">
      <p className="caption">Page not found</p>
      <h1 className="large-title mt-4 max-w-[20ch]">That page is not in this part of BookSphere.</h1>
      <p className="body-copy measure mt-5">
        The link may be outdated, or the book, perspective or profile may no longer be there.
      </p>
      <Link href="/explore" className="btn-ink mt-8">
        Read something else
      </Link>
    </div>
  );
}
