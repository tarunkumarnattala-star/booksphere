import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, UserPlus, Users } from "lucide-react";
import { FollowButton } from "@/components/follow-button";
import { getProfile } from "@/lib/data";
import {
  getCanonicalProfileConnections,
  type ProfileConnection
} from "@/lib/profile-data";
import { initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

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
    <div className="editorial-page max-w-3xl">
      <Link href={`/profile/${profile.username}`} className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-medium transition hover:bg-black/[0.04]">
        <ArrowLeft size={17} />
        Back to profile
      </Link>

      <header className="mt-5 flex items-center gap-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-full bg-[color:var(--color-text-primary)] text-base font-medium !text-white">
          {initials(profile.name)}
        </span>
        <div className="min-w-0">
          <h1 className="title-2 truncate">{profile.name}</h1>
          <p className="mt-1 truncate text-sm font-medium text-[color:var(--color-text-secondary)]">@{profile.username}</p>
        </div>
      </header>

      <nav aria-label="Profile connections" className="mt-7 grid grid-cols-2 border-b border-[color:var(--color-hairline)]">
        <ConnectionTab username={profile.username} view="followers" active={view === "followers"} count={followers.length} />
        <ConnectionTab username={profile.username} view="following" active={view === "following"} count={following.length} />
      </nav>

      {people.length > 0 ? (
        <div className="divide-y divide-[color:var(--color-hairline)]">
          {people.map((person) => <ConnectionRow key={person.id} person={person} />)}
        </div>
      ) : (
        <EmptyConnections view={view} />
      )}
    </div>
  );
}

function ConnectionTab({ username, view, active, count }: { username: string; view: ConnectionView; active: boolean; count: number }) {
  const label = view === "followers" ? "Followers" : "Following";
  return (
    <Link
      href={`/profile/${username}/connections?view=${view}`}
      aria-current={active ? "page" : undefined}
      className={`border-b-2 px-3 py-4 text-center text-sm font-semibold transition ${active ? "border-black text-[color:var(--color-text-primary)]" : "border-transparent text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)]"}`}
    >
      {label} <span className="ml-1 text-[color:var(--color-text-muted)]">{count}</span>
    </Link>
  );
}

function ConnectionRow({ person }: { person: ProfileConnection }) {
  return (
    <div className="flex items-center gap-3 py-4">
      <Link href={`/profile/${person.username}`} className="grid size-12 shrink-0 place-items-center rounded-full bg-[color:var(--color-text-primary)] text-sm font-medium !text-white">
        {initials(person.name)}
      </Link>
      <Link href={`/profile/${person.username}`} className="min-w-0 flex-1">
        <h2 className="truncate text-sm font-semibold text-[color:var(--color-text-primary)]">{person.name}</h2>
        <p className="mt-0.5 truncate text-xs font-medium text-[color:var(--color-text-secondary)]">@{person.username}</p>
        <p className="mt-1 line-clamp-1 text-sm text-[color:var(--color-text-secondary)]">{person.bio}</p>
      </Link>
      <FollowButton profileUsername={person.username} compact />
    </div>
  );
}

function EmptyConnections({ view }: { view: ConnectionView }) {
  const followers = view === "followers";
  return (
    <section className="mx-auto flex max-w-md flex-col items-center px-5 py-16 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-black/[0.045] text-[color:var(--color-text-secondary)]">
        {followers ? <Users size={21} /> : <UserPlus size={21} />}
      </span>
      <h2 className="title-3 mt-5">{followers ? "No followers yet" : "Not following anyone yet"}</h2>
      <p className="body-copy mt-2 text-[15px]">
        {followers
          ? "Keep sharing useful perspectives. Readers who want to hear more can follow this profile."
          : "Explore thoughtful readers and follow the people whose perspectives help you think differently."}
      </p>
      <Link href={followers ? "/feed" : "/explore"} className="mt-6 inline-flex min-h-11 items-center rounded-full bg-[color:var(--color-text-primary)] px-5 text-sm font-semibold !text-white transition hover:opacity-85">
        {followers ? "Share a perspective" : "Discover readers"}
      </Link>
    </section>
  );
}
