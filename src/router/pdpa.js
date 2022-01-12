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
    meta: {
      restriction: "GROUP_HR"
    },
    component: () => import("@/views/PDPA/inbox/Inbox.vue"),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/request-approval",
    name: "Request Approval",
    meta: {
      restriction: "GROUP_PDPA_APPROVER"
    },
    component: () => import("@/views/PDPA/approval/RequestApproval.vue"),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/PDPA/report",
    name: "PDPA Report",
    meta: {
      restriction: "GROUP_PDPA_APPROVER"
    },
    component: () => import("@/views/PDPA/report/PDPAReport.vue"),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/PDPA/configuration/document",
    name: "PDPA Document",
    meta: {
      restriction: "GROUP_PDPA_APPROVER"
    },
    component: () => import("@/views/PDPA/configuration/Documents.vue"),
    meta: {
      requiresAuth: true
    }
  }
];
