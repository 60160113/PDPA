export default [
  {
    path: "/sharedfiles/:id",
    name: "Shared Files",
    component: () => import("@/views/file/File.vue")
  },
  {
    path: "/sharedfiles",
    name: "Shared Files",
    component: () => import("@/views/file/File.vue")
  },
  {
    path: "/myfiles/:id",
    name: "My Files",
    component: () => import("@/views/file/File.vue")
  },
  {
    path: "/myfiles",
    name: "My Files",
    component: () => import("@/views/file/File.vue")
  },
  {
    path: "/repository/:id",
    name: "Repository",
    component: () => import("@/views/file/File.vue")
  },
  {
    path: "/repository",
    name: "Repository",
    component: () => import("@/views/file/File.vue")
  }
];
