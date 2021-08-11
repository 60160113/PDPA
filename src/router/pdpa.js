export default [
  {
    path: "/request",
    name: "Request Data",
    component: () => import("@/views/PDPA/request/RequestData.vue")
  },
  {
    path: "/request-approval",
    name: "Request Approval",
    component: () => import("@/views/PDPA/RequestApproval.vue")
  },
  {
    path: "/PDPA/report",
    name: "PDPA Report",
    component: () => import("@/views/PDPA/PDPAReport.vue")
  }
];
