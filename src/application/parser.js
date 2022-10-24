import _ from 'lodash';

export default (htmlContent) => {
  const parser = new DOMParser();
  const parsedHtml = parser.parseFromString(htmlContent, 'application/xml');
  console.log(parsedHtml);
  const title = parsedHtml.querySelector('title').textContent;
  // console.log(title);
  const description = parsedHtml.querySelector('description').textContent;
  // console.log(description);
  const parsedPosts = parsedHtml.querySelectorAll('item');
  const posts = Array.from(parsedPosts).map((post) => {
    const titlePost = post.querySelector('title').textContent;
    const linkPost = post.querySelector('link').textContent;
    const idPost = _.uniqueId();
    return { titlePost, linkPost, idPost };
  });

  // console.log({ title, description, posts });
  return { title, description, posts };
};

