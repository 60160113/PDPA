export default [
  {
    path: "/search",
    name: "Search",
    component: () => import("@/views/search/Search.vue"),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/search/results",
    name: "search-results",
    component: () => import("@/views/search/Result.vue"),
    meta: {
      requiresAuth: true
    }
  }
];
