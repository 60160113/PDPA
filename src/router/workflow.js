export default [
  {
    path: "/workflow",
    name: "Workflow",
    beforeEnter(to, from, next) {
      const user = JSON.parse(localStorage.getItem("user"));
      const host = window.location.protocol.concat('//').concat(window.location.host);
      const url = `${process.env.VUE_APP_WF_SSO_URL}?${process.env.VUE_APP_WF_SSO_PARAMETER}=${user.token}&expire_url=${encodeURIComponent(host)}`;
      window.open(url, '_blank');
    }
  }
];