const links = [];

export const saveLink = (link) => {
  links.push(link);
  console.log(links);
};

export const getLinks = (link) => {
  console.log(links);
  return links;
  
};

