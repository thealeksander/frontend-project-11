import _ from 'lodash';

export default (htmlContent) => {
  try {
    const parser = new DOMParser();
    const parsedHtml = parser.parseFromString(htmlContent, 'application/xml');

    const title = parsedHtml.querySelector('title').textContent;
    const idFeed = _.uniqueId();
    const description = parsedHtml.querySelector('description').textContent;
    const parsedPosts = parsedHtml.querySelectorAll('item');

    const posts = Array.from(parsedPosts).map((post) => {
      const titlePost = post.querySelector('title').textContent;
      const descriptionPost = post.querySelector('description').textContent;
      const linkPost = post.querySelector('link').textContent;
      const idPost = _.uniqueId();

      return {
        titlePost,
        descriptionPost,
        linkPost,
        idPost,
      };
    });
    return {
      idFeed,
      title,
      description,
      posts,
    };
  } catch (e) {
    throw new Error('inValidRss');
  }
};
