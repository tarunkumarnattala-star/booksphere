"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { requireProfile } from "@/lib/auth-client";
import { supabase } from "@/lib/supabase";

type ReportRow = {
  id: string;
  target_type: "discussion_post" | "discussion_comment" | "knowledge_post" | "profile";
  target_id: string;
  reason: string;
  created_at: string;
  reporter: { name: string; username: string } | null;
};

// Every report is filed with target_type "discussion_post" (post-actions.tsx), and a
// discussion post lives at /discussion/<id>. Sending it to /post/<id> - the knowledge-post
// route - showed the moderator "We could not find this knowledge note" for effectively
// every row in the queue, so nobody could see what they were being asked to moderate.
function targetHref(report: ReportRow) {
  if (report.target_type === "discussion_post") return `/discussion/${report.target_id}`;
  if (report.target_type === "knowledge_post") return `/post/${report.target_id}`;
  return null;
}

const targetLabels: Record<ReportRow["target_type"], string> = {
  discussion_post: "Discussion post",
  discussion_comment: "Comment",
  knowledge_post: "Knowledge post",
  profile: "Profile"
};

export default function AdminReportsPage() {
  const [state, setState] = useState<"loading" | "signed-out" | "not-moderator" | "unavailable" | "ready">("loading");
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!supabase) {
        setState("unavailable");
        return;
      }
      const auth = await requireProfile();
      if (cancelled) return;
      if (!auth.ok) {
        setState("signed-out");
        return;
      }
      const { data: me } = await supabase.from("profiles").select("is_moderator").eq("id", auth.profileId).maybeSingle();
      if (cancelled) return;
      if (!me?.is_moderator) {
        setState("not-moderator");
        return;
      }
      const { data, error: reportsError } = await supabase
        .from("reports")
        .select("id,target_type,target_id,reason,created_at,reporter:profiles(name,username)")
        .order("created_at", { ascending: false })
        .limit(200);
      if (cancelled) return;
      if (reportsError) {
        setError("Reports could not be loaded. Check that the moderator migration has been applied.");
        setState("ready");
        return;
      }
      setReports((data || []) as unknown as ReportRow[]);
      setState("ready");
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  async function dismissReport(id: string) {
    if (!supabase) return;
    if (!window.confirm("Dismiss this report? This removes it from the queue.")) return;
    const previous = reports;
    setReports((current) => current.filter((report) => report.id !== id));
    // A DELETE filtered to zero rows by the moderator policy also returns error: null, so
    // without reading the row back the queue would look cleared while the report survived.
    const { data, error: deleteError } = await supabase.from("reports").delete().eq("id", id).select("id");
    if (deleteError || !data?.length) {
      setReports(previous);
      setError(deleteError
        ? "The report could not be dismissed. Please try again."
        : "That report was not dismissed. Your account may not have moderator permission.");
    }
  }

  return (
    <div className="editorial-page">
      <p className="caption">Moderation</p>
      <h1 className="large-title mt-4">Reported content</h1>
      <p className="subheadline mt-3">
        <Link className="text-[color:var(--ink)] underline decoration-[color:var(--rule-strong)] underline-offset-[5px]" href="/admin/analytics">View analytics</Link>
      </p>

      {state === "loading" && <p className="body-copy measure mt-8">Checking access...</p>}

      {state === "unavailable" && (
        <p className="body-copy measure mt-8">Moderation requires the production database connection.</p>
      )}

      {state === "signed-out" && (
        <p className="body-copy measure mt-8">
          Log in with a moderator account to review reports. <Link className="text-[color:var(--ink)] underline decoration-[color:var(--rule-strong)] underline-offset-[5px]" href="/login?next=%2Fadmin%2Freports">Log in</Link>
        </p>
      )}

      {state === "not-moderator" && (
        <p className="body-copy measure mt-8">This area is only available to moderators.</p>
      )}

      {state === "ready" && (
        <>
          {error && <p role="alert" className="footnote mt-5 border-l-2 border-[color:var(--color-rose)] pl-4 text-[color:var(--color-rose)]">{error}</p>}
          {reports.length === 0 && !error ? (
            <p className="body-copy measure mt-8">No open reports. The queue is clear.</p>
          ) : (
            <ul className="records records-tight">
              {reports.map((report) => {
                const href = targetHref(report);
                return (
                  <li key={report.id} className="record">
                    <p className="caption record-stamp">{targetLabels[report.target_type]}</p>
                    <div className="min-w-0">
                      <p className="record-title">{report.reason}</p>
                      <p className="record-meta">
                        Reported by {report.reporter ? `${report.reporter.name} (@${report.reporter.username})` : "an unknown account"}
                      </p>
                      <p className="record-writer">{new Date(report.created_at).toLocaleString()}</p>
                      <div className="control-row mt-5">
                        {href && <Link href={href} className="control control-lead">Open what was reported</Link>}
                        <button
                          type="button"
                          onClick={() => dismissReport(report.id)}
                          className="control text-[color:var(--color-rose)] hover:!text-[color:var(--color-rose)]"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
