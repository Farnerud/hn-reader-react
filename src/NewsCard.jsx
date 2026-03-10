import PropTypes from "prop-types";

function NewsCard({ title, url, points, author }) {
  return (
    <li className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-zinc-700 hover:shadow-md transition-shadow">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-900 dark:text-zinc-100 font-medium hover:text-orange-500 transition-colors leadign-snug"
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
  title: PropTypes.string.isRequired,
  url: PropTypes.string,
  points: PropTypes.number.isRequired,
  author: PropTypes.string.isRequired,
};

export default NewsCard;
