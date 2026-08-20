"use client";

import Link from "next/link";
import { useState } from "react";
import { Clock3, Eye, LoaderCircle, Search } from "lucide-react";

import { IntentBadge, intentLabel } from "@/components/cards/intent-badge";
import { ensureAnonymousUser } from "@/lib/supabase/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { InboxItemRow } from "@/types/database";

const suggestions = [
  "the restaurant I saved in Guangzhou",
  "the headphones from last week",
  "my September concert",
];

type SearchResponse = {
  results?: InboxItemRow[];
  error?: string;
};

export function SearchContent() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<InboxItemRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function searchCollection(searchQuery: string) {
    const normalizedQuery = searchQuery.trim();
    if (!normalizedQuery) {
      setResults(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await ensureAnonymousUser();
      const { data, error: sessionError } = await getSupabaseBrowserClient().auth.getSession();
      if (sessionError || !data.session?.access_token) throw new Error("Anonymous session is unavailable.");

      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${data.session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: normalizedQuery }),
      });
      const payload = await response.json() as SearchResponse;
      if (!response.ok || !payload.results) throw new Error(payload.error ?? "Search could not be completed.");
      setResults(payload.results);
    } catch {
      setResults(null);
      setError("We couldn't search your collection. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function submitSuggestion(suggestion: string) {
    setQuery(suggestion);
    void searchCollection(suggestion);
  }

  return (
    <>
      <form className="mt-10" onSubmit={(event) => { event.preventDefault(); void searchCollection(query); }}>
        <label className="flex h-18 items-center gap-5 rounded-xl border border-primary/70 bg-white px-6 shadow-[0_8px_25px_rgb(18_104_243_/_0.07)]">
          {loading ? <LoaderCircle className="size-7 animate-spin text-slate-600" /> : <Search className="size-7 text-slate-600" />}
          <input
            aria-label="Search your collection"
            className="min-w-0 flex-1 bg-transparent text-xl outline-none"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search your collection..."
            value={query}
          />
          <kbd className="rounded-lg border bg-slate-50 px-3 py-2 text-sm text-slate-600">Enter</kbd>
        </label>
      </form>

      <div className="mt-7 flex flex-wrap gap-4">
        {suggestions.map((suggestion) => (
          <button
            className="flex items-center gap-3 rounded-lg border bg-white px-5 py-3 text-sm text-slate-600"
            key={suggestion}
            onClick={() => submitSuggestion(suggestion)}
            type="button"
          >
            <Search className="size-4" />{suggestion}
          </button>
        ))}
      </div>

      <section className="mt-14">
        <SearchStatus error={error} loading={loading} results={results} />
        {results && results.length > 0 ? (
          <div className="mt-5 space-y-4">
            {results.map((result) => <SearchResultCard item={result} key={result.id} />)}
          </div>
        ) : null}
      </section>
    </>
  );
}

function SearchStatus({ error, loading, results }: { error: string | null; loading: boolean; results: InboxItemRow[] | null }) {
  if (loading) return <h2 className="text-xl font-semibold">Searching your collection...</h2>;
  if (error) return <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>;
  if (results === null) return <div><h2 className="text-xl font-semibold">Search your collection</h2><p className="mt-2 text-sm text-muted-foreground">Find screenshots by title, summary, category, or extracted details.</p></div>;
  if (results.length === 0) return <div><h2 className="text-xl font-semibold">No matching screenshots yet.</h2><p className="mt-2 text-sm text-muted-foreground">Try a different title, place, product, or detail.</p></div>;
  return <h2 className="text-xl font-semibold">{results.length} {results.length === 1 ? "result" : "results"}</h2>;
}

function SearchResultCard({ item }: { item: InboxItemRow }) {
  return (
    <article className="flex min-h-40 items-center gap-8 rounded-xl border bg-white px-6 py-5 shadow-card">
      <IntentBadge intent={intentLabel(item.intent)} />
      <div className="min-w-0 flex-1">
        <Link className="text-xl font-semibold hover:text-primary" href={`/inbox/${item.id}`}>{item.title}</Link>
        <p className="mt-2 line-clamp-2 text-slate-600">{item.summary ?? "Saved from your screenshot"}</p>
        <p className="mt-2 flex items-center gap-2 text-sm text-slate-600"><Clock3 className="size-4" />Saved {formatDate(item.created_at)}</p>
      </div>
      <Link aria-label={`View ${item.title}`} className="grid size-11 shrink-0 place-items-center rounded-lg border" href={`/inbox/${item.id}`}><Eye className="size-5" /></Link>
    </article>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "in your collection";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}
