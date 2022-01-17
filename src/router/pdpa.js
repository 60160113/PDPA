export default [
  {
    path: "/request",
    name: "Request",
    component: () => import("@/views/PDPA/request"),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/inbox",
    name: "Inbox",
    component: () => import("@/views/PDPA/inbox/Inbox.vue"),
    meta: {
      requiresAuth: true,
      restriction: "GROUP_HR"
    }
  },
  {
    path: "/request-approval",
    name: "Request Approval",
    component: () => import("@/views/PDPA/approval/RequestApproval.vue"),
    meta: {
      requiresAuth: true,
      restriction: "GROUP_PDPA_APPROVER"
    }
  },
  {
    path: "/PDPA/report",
    name: "PDPA Report",
    component: () => import("@/views/PDPA/report/PDPAReport.vue"),
    meta: {
      requiresAuth: true,
      restriction: "GROUP_PDPA_APPROVER"
    }
  },
  {
    path: "/PDPA/configuration/document",
    name: "PDPA Document",
    component: () => import("@/views/PDPA/configuration/Documents.vue"),
    meta: {
      requiresAuth: true,
      restriction: "GROUP_PDPA_APPROVER"
    }
  }
];
