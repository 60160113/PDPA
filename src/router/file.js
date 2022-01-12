export default [
  {
    path: "/sharedfiles",
    name: "Shared Files",
    component: () => import("@/views/file/File.vue"),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/myfiles",
    name: "My Files",
    component: () => import("@/views/file/File.vue"),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/repository",
    name: "Repository",
    component: () => import("@/views/file/File.vue"),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/property/:id",
    name: "Property",
    component: () => import("@/views/file/PropertyPage.vue"),
    meta: {
      requiresAuth: true
    }
  }
];
