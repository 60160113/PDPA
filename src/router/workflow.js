export default [
  {
    path: "/workflow",
    name: "Workflow",
    beforeEnter(to, from, next) {
      const user = JSON.parse(localStorage.getItem("user"));
      const url = `${process.env.VUE_APP_WF_SSO_URL}?${process.env.VUE_APP_WF_SSO_PARAMETER}=${user.token}`;
      window.open(url, '_blank');
    }
  }
];