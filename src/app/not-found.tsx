import Link from "next/link";

export default function NotFound() {
  return (
    <div className="editorial-page max-w-2xl">
      <p className="caption">Page not found</p>
      <h1 className="title-1 mt-3">That page is not in this part of BookSphere.</h1>
      <p className="body-copy mt-4">The link may be outdated, or the book, perspective, or profile may no longer be available.</p>
      <Link href="/explore" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-[color:var(--color-text-primary)] px-5 py-3 text-sm font-medium !text-white">
        Explore BookSphere
      </Link>
    </div>
  );
}
