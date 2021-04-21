export function authHeader() {
  // return authorization header
  let user = JSON.parse(localStorage.getItem("user"));
  if (user && user.ticket) {
    return { Authorization: "Basic " + window.btoa(user.ticket) };
  } else {
    return {};
  }
}
