import NewsCard from "./NewsCard";

function App() {
  return (
    <>
      <div>
        <h1>Hacker News Reader</h1>
        <NewsCard
          title="React 19 is released"
          url="https://react.dev/"
          points={340}
          author="Dan Abramov"
        />
      </div>
      <NewsCard
        title="Vite 7 is released"
        url="https://vite.dev/"
        points={230}
        author="Evan You"
      />
    </>
  );
}
export default App;
