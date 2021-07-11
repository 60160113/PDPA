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
    path: "/property/:id",
    name: "Property",
    component: () => import("@/views/file/PropertyPage.vue")
  },
];
