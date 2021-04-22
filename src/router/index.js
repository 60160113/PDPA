import Vue from "vue";
import Router from "vue-router";

import file from "../router/file";

// Containers
const TheContainer = () => import("@/containers/TheContainer");

Vue.use(Router);

const router = new Router({
  mode: "hash", // https://router.vuejs.org/api/#mode
  linkActiveClass: "open active",
  scrollBehavior: () => ({ y: 0 }),
  routes: [
    {
      path: "/",
      redirect: "/login",
      name: "FullPage",
      component: {
        render(c) {
          return c("router-view");
        }
      },
      children: [
        {
          path: "login",
          name: "Login",
          component: () => import("@/views/pages/Login.vue")
        },
        {
          path: "404",
          name: "404",
          component: () => import("@/views/pages/Page404.vue")
        },
        {
          path: "500",
          name: "500",
          component: () => import("@/views/pages/Page500.vue")
        }
      ]
    },
    {
      path: "",
      name: "Home",
      component: TheContainer,
      children: [...file]
    },
    {
      path: "*",
      name: "Error",
      redirect: "/404"
    }
  ]
});

router.beforeEach((to, from, next) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user && to.name != "Login") {
    return next({ name: "Login" });
  } else if (user && to.name == "Login") {
    return next("/myfiles");
  }
  return next();
});

export default router;
