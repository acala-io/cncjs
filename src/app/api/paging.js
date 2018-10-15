export const getPagingRange = ({page = 1, pageLength = 10, totalRecords = 0}) => {
  let localPage = Number(page);
  let localPageLength = Number(pageLength);

  if (!page || page < 1) {
    localPage = 1;
  }

  if (!pageLength || pageLength < 1) {
    localPageLength = 10;
  }

  if ((page - 1) * localPageLength >= totalRecords) {
    localPage = Math.ceil(totalRecords / localPageLength);
  }

  const begin = (localPage - 1) * localPageLength;
  const end = Math.min((localPage - 1) * localPageLength + localPageLength, totalRecords);

  return [begin, end];
};
