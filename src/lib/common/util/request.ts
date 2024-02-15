const { signal } = new AbortController();

export const sendPostRequest = async (
  url: string,
  headers: any,
  query: any,
  body: any,
  isJSONResponse: boolean = true
) => {
  const formattedUrl = addQueryToUrl(url, query);
  const response = await fetch(formattedUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    cache: "no-store",
    signal,
    mode: "cors",
    credentials: "include",
  });
  if (isJSONResponse) {
    return await response.json();
  } else {
    return response;
  }
};

export const sendGetRequest = async (url: string, headers: any, query: any) => {
  const formattedUrl = addQueryToUrl(url, query);
  const response = await fetch(formattedUrl, {
    method: "GET",
    headers,
    cache: "no-store",
    signal,
    mode: "cors",
    credentials: "include",
  });

  return await response.json();
};
export const sendPutRequest = async (
  url: string,
  headers: any,
  query: any,
  body: any
) => {
  const formattedUrl = addQueryToUrl(url, query);
  const response = await fetch(formattedUrl, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
    cache: "no-store",
    signal,
    mode: "cors",
    credentials: "include",
  });
  return await response.json();
};

export const sendDeleteRequest = async (
  url: string,
  headers: any,
  query: any,
  body: any
) => {
  const formattedUrl = addQueryToUrl(url, query);
  const response = await fetch(formattedUrl, {
    method: "DELETE",
    headers,
    cache: "no-store",
    signal,
    body: JSON.stringify(body),
    mode: "cors",
    credentials: "include",
  });
  return await response.json();
};

const addQueryToUrl = (url: string, query: any) => {
  const queryKeys = Object.keys(query);
  if (queryKeys.length === 0) {
    return url;
  }
  const queryStrings = queryKeys.map((key) => `${key}=${query[key]}`);
  return `${url}?${queryStrings.join("&")}`;
};