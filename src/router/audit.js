export default [
  {
    path: "/files-report",
    name: "Files Report",
    meta: {
      restriction: "GROUP_ALFRESCO_ADMINISTRATORS"
    },
    component: () => import("@/views/audit/Files-Report.vue")
  },
  {
    path: "/users-report",
    name: "Users Report",
    meta: {
      restriction: "GROUP_ALFRESCO_ADMINISTRATORS"
    },
    component: () => import("@/views/audit/Users-Report.vue")
  }
];
