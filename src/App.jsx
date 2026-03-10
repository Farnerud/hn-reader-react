import { useState, useEffect, useCallback } from "react";
import { Sun, Moon } from "lucide-react";
import NewsCard from "./NewsCard";

async function fetchStories(signal) {
  const res = await fetch(
    "https://hacker-news.firebaseio.com/v0/topstories.json",
    { signal },
  );

  if (!res.ok) {
    throw new Error(`Error del servidor: ${res.status}`);
  }

  const ids = await res.json();
  const top20 = ids.slice(0, 20);

  const results = await Promise.allSettled(
    top20.map((id) =>
      fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
        signal,
      }).then((r) => {
        if (!r.ok) throw new Error(`Item ${id} falló: ${r.status}`);
        return r.json();
      }),
    ),
  );

  return results.filter((r) => r.status === "fulfilled").map((r) => r.value);
}

const PAGE_SIZE = 6;

function App() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const load = useCallback(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchStories(controller.signal)
      .then(setStories)
      .catch((err) => {
        if (err.name !== "AbortError") setError(err.message);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  useEffect(() => load(), [load]);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 flex items-center justify-center">
        <p className="text-gray-500 dark:text-zinc-400">Cargando noticias...</p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-medium">Algo salió mal</p>
          <p className="text-gray-400 dark:text-zinc-500 text-sm mt-1">{error}</p>
          <button
            onClick={load}
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900">
      <header className="bg-zinc-900 dark:bg-zinc-950 px-6 py-5 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="bg-orange-500 text-white text-sm font-bold px-2 py-1 rounded">
              ▲
            </span>
            <div>
              <h1 className="text-white text-xl font-bold leading-none">
                Hacker News Reader
              </h1>
              <p className="text-zinc-400 text-xs mt-0.5">
                Curated tech stories
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-zinc-400 text-xs font-medium tracking-widest uppercase">
              Top 20
            </span>
            <button
              onClick={() => setIsDark((d) => !d)}
              aria-label="Toggle theme"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-6">
        <ul className="flex flex-col gap-3">
          {stories.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE).map((story) => (
            <NewsCard
              key={story.id}
              title={story.title}
              url={story.url}
              points={story.score}
              author={story.by}
            />
          ))}
        </ul>
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 0}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          <span className="text-sm text-gray-500 dark:text-zinc-400">
            {page + 1} / {Math.ceil(stories.length / PAGE_SIZE)}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(stories.length / PAGE_SIZE) - 1}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
