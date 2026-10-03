import Link from "next/link";
import { notFound } from "next/navigation";
import { FollowButton } from "@/components/follow-button";
import { getProfile } from "@/lib/data";
import {
  getCanonicalProfileConnections,
  type ProfileConnection
} from "@/lib/profile-data";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
  searchParams
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ view?: string }>;
}): Promise<Metadata> {
  const [{ username }, query] = await Promise.all([params, searchParams]);
  const view = query.view === "following" ? "Following" : "Followers";
  const fallback = getProfile(username);
  const name = fallback?.name || `@${username}`;
  return pageMetadata({
    title: `${name} — ${view}`,
    description: `Readers connected to ${name} on BookSphere.`,
    path: `/profile/${username}/connections`,
    noIndex: true
  });
}

type ConnectionView = "followers" | "following";

export default async function ProfileConnectionsPage({
  params,
  searchParams
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const [{ username }, query] = await Promise.all([params, searchParams]);
  const view: ConnectionView = query.view === "following" ? "following" : "followers";
  const canonical = await getCanonicalProfileConnections(username);
  const fallback = getProfile(username);
  const profile = canonical?.profile || (fallback ? {
    id: fallback.id,
    name: fallback.name,
    username: fallback.username,
    bio: fallback.bio
  } : null);

  if (!profile) notFound();

  const followers = canonical?.followers || [];
  const following = canonical?.following || [];
  const people = view === "followers" ? followers : following;

  return (
    <div className="editorial-page editorial-prose">
      <Link href={`/profile/${profile.username}`} className="caption caption-muted inline-flex min-h-11 items-center transition-colors hover:text-[color:var(--ink)]">
        Back to {profile.name}
      </Link>

      <header className="mt-5 border-t-2 border-[color:var(--ink)] pt-5">
        <p className="caption">@{profile.username}</p>
        <h1 className="large-title mt-4">{profile.name}</h1>
      </header>

      {/* Two words and a rule under the one you are reading. The counts that used to sit
          beside them are counts of an empty table. */}
      <nav aria-label="Profile connections" className="control-row mt-8 border-b border-[color:var(--rule)]">
        <ConnectionTab username={profile.username} view="followers" active={view === "followers"} />
        <ConnectionTab username={profile.username} view="following" active={view === "following"} />
      </nav>

      {people.length > 0 ? (
        <ol className="records records-tight">
          {people.map((person) => <ConnectionRow key={person.id} person={person} />)}
        </ol>
      ) : (
        <EmptyConnections view={view} />
      )}
    </div>
  );
}

function ConnectionTab({ username, view, active }: { username: string; view: ConnectionView; active: boolean }) {
  const label = view === "followers" ? "Followers" : "Following";
  return (
    <Link
      href={`/profile/${username}/connections?view=${view}`}
      aria-current={active ? "page" : undefined}
      className={`control pb-3 ${active ? "control-on" : ""}`}
    >
      {label}
    </Link>
  );
}

function ConnectionRow({ person }: { person: ProfileConnection }) {
  return (
    <li className="record">
      <p className="caption record-stamp caption-muted">@{person.username}</p>
      <div className="min-w-0">
        <h2 className="record-title">
          <Link href={`/profile/${person.username}`} className="transition-colors hover:text-[color:var(--accent)]">{person.name}</Link>
        </h2>
        {person.bio && <p className="record-text line-clamp-2">{person.bio}</p>}
        <div className="control-row mt-5">
          <FollowButton profileUsername={person.username} compact />
        </div>
      </div>
    </li>
  );
}

function EmptyConnections({ view }: { view: ConnectionView }) {
  const followers = view === "followers";
  return (
    <section className="mt-8">
      <h2 className="title-1 max-w-[20ch]">{followers ? "Nobody follows this profile yet." : "Not following anyone yet."}</h2>
      <p className="body-copy measure mt-5">
        {followers
          ? "BookSphere is in early access and almost nobody is here yet. Writing something is the way that changes."
          : "Open a perspective you found useful and follow whoever wrote it."}
      </p>
      <Link href={followers ? "/feed" : "/explore"} className="btn-ink mt-8">
        {followers ? "Write something" : "Read what is here"}
      </Link>
    </section>
  );
}
