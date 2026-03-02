import { useState, useEffect } from "react";
import NewsCard from "./NewsCard";

async function fetchStories() {
  const res = await fetch(
    "https://hacker-news.firebaseio.com/v0/topstories.json",
  );
  const ids = await res.json();
  const top20 = ids.slice(0, 20);
  const storyPromises = top20.map((id) =>
    fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(
      (r) => r.json(),
    ),
  );
  return Promise.all(storyPromises);
}

function App() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories().then((data) => {
      setStories(data);
      setLoading(false);
    });
  }, []);

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-orange-500 px-6 py-4 shadow-md">
          <h1 className="text-white text-2xl font-bold">Hacker News Reader</h1>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-6">
          {loading ? (
            <p className="text-center text-gray-500 mt-10">
              Cargando noticias...
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {stories.map((story) => (
                <NewsCard
                  key={story.id}
                  title={story.title}
                  url={story.url}
                  points={story.score}
                  author={story.by}
                />
              ))}
            </ul>
          )}
        </main>
      </div>
    </>
  );
}
export default App;
