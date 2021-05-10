export default [
  {
    path: "/files-report",
    name: "Files Report",
    component: () => import("@/views/audit/Files-Report.vue")
  },
  {
    path: "/users-report",
    name: "Users Report",
    component: () => import("@/views/audit/Users-Report.vue")
  }
];
