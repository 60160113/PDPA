import Vue from "vue";
import Router from "vue-router";

import file from "./file";
import search from "./search";

import audit from "./audit";

import pdpa from "./pdpa";

import Meta from "vue-meta";

// Containers
const TheContainer = () => import("@/containers/TheContainer");

Vue.use(Meta);
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
          component: () => import("@/views/pages/Login.vue"),
          meta: {
            requiresAuth: false
          }
        },
        {
          path: "404",
          name: "404",
          component: () => import("@/views/pages/Page404.vue"),
          meta: {
            requiresAuth: false
          }
        },
        {
          path: "500",
          name: "500",
          component: () => import("@/views/pages/Page500.vue"),
          meta: {
            requiresAuth: false
          }
        },
        {
          path: "register",
          name: "Register",
          component: () => import("@/views/pages/Register.vue"),
          meta: {
            requiresAuth: false
          }
        }
      ]
    },
    {
      path: "",
      name: "Home",
      component: TheContainer,
      children: [...file, ...search, ...audit, ...pdpa]
    },
    {
      path: "*",
      name: "Error",
      redirect: "/404"
    }
  ]
});

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user && to.name != "Login") {
      return next({ name: "Login" });
    } else if (user && to.name == "Login") {
      return next("/request");
    }
    return next();
  } else {
    return next();
  }
});

export default router;
