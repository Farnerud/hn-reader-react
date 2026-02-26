function NewsCard(props) {
  return (
    <div>
      <a href={props.url} target="_blank" rel="noopener noreferrer">
        {props.title}
      </a>
    </div>
  );
}

export default NewsCard;