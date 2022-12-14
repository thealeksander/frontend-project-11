export default (htmlContent) => {
  const parser = new DOMParser();
  const parsedHtml = parser.parseFromString(htmlContent, 'application/xml');
  const parseError = parsedHtml.querySelector('parsererror');
  if (parseError) {
    throw new Error('inValidRss');
  } else {
    const title = parsedHtml.querySelector('title').textContent;
    const description = parsedHtml.querySelector('description').textContent;
    const parsedPosts = parsedHtml.querySelectorAll('item');

    const posts = Array.from(parsedPosts).map((post) => {
      const titlePost = post.querySelector('title').textContent;
      const descriptionPost = post.querySelector('description').textContent;
      const linkPost = post.querySelector('link').textContent;

      return {
        titlePost,
        descriptionPost,
        linkPost,
      };
    });
    return {
      title,
      description,
      posts,
    };
  }
};
