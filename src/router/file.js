export default [
  {
    path: "/sharedfiles",
    name: "Shared Files",
    component: () => import("@/views/file/File.vue")
  },
  {
    path: "/myfiles",
    name: "My Files",
    component: () => import("@/views/file/File.vue")
  },
  {
    path: "/repository",
    name: "Repository",
    component: () => import("@/views/file/File.vue")
  },
  {
    path: "/file/:id",
    name: "File",
    component: () => import("@/views/file/File.vue")
  }
];
