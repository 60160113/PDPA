const user = JSON.parse(localStorage.getItem("user"));

export default [
  {
    path: "/workflow",
    name: "Workflow",
    beforeEnter(to, from, next) {
      const url = `${process.env.VUE_APP_WF_SSO_URL}?${process.env.VUE_APP_WF_SSO_PARAMETER}=${user.token}`
      window.open(url, '_blank');
    }
  }
];
  