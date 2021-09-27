export default [
  {
    path: "/request",
    name: "Request",
    component: () => import("@/views/PDPA/request")
  },
  {
    path: "/inbox",
    name: "Inbox",
    meta: {
      restriction: "GROUP_HR"
    },
    component: () => import("@/views/PDPA/inbox/Inbox.vue")
  },
  {
    path: "/request-approval",
    name: "Request Approval",
    meta: {
      restriction: "GROUP_PDPA_APPROVER"
    },
    component: () => import("@/views/PDPA/approval/RequestApproval.vue")
  },
  {
    path: "/PDPA/report",
    name: "PDPA Report",
    meta: {
      restriction: "GROUP_PDPA_APPROVER"
    },
    component: () => import("@/views/PDPA/report/PDPAReport.vue")
  }
];
