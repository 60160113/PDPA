export default [
  {
    path: "/search",
    name: "Search",
    component: () => import("@/views/search/Search.vue")
  },
  {
    path: "/search/results",
    name: "search-results",
    props: true,
    component: () => import("@/views/search/Result.vue")
  }
];
