export default [
  {
    path: "/request",
    name: "Request Data",
    component: () => import("@/views/PDPA/RequestData.vue")
  },
  {
    path: "/request-approval",
    name: "Request Approval",
    component: () => import("@/views/PDPA/RequestApproval.vue")
  },
];
