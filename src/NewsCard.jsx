import PropTypes from "prop-types";

function NewsCard({ id, title, url, points, author }) {
  const linkUrl = url || `https://news.ycombinator.com/item?id=${id}`;

  return (
    <li className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-zinc-700 hover:shadow-md transition-shadow">
      <a
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-900 dark:text-zinc-100 font-medium hover:text-orange-500 transition-colors leading-snug"
      >
        {title}
      </a>
      <p className="text-sm text-gray-400 dark:text-zinc-400 mt-2">
        {points} puntos • by {author}
      </p>
    </li>
  );
}

NewsCard.propTypes = {
  id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  url: PropTypes.string,
  points: PropTypes.number.isRequired,
  author: PropTypes.string.isRequired,
};

export default NewsCard;
