export default [
    // // Files
    // {
    //     _name: "CSidebarNavTitle",
    //     _children: ["Files"]
    // },
    // {
    //     _name: "CSidebarNavItem",
    //     name: "My Files",
    //     to: "/myfiles",
    //     icon: "cil-file"
    // },
    // {
    //     _name: "CSidebarNavItem",
    //     name: "Shared Files",
    //     to: "/sharedfiles",
    //     icon: "cil-file"
    // },
    // {
    //     _name: "CSidebarNavItem",
    //     name: "Repository",
    //     to: "/repository",
    //     icon: "cil-file"
    // },
    // // Search
    // {
    //     _name: "CSidebarNavTitle",
    //     _children: ["Search"]
    // },
    // {
    //     _name: "CSidebarNavItem",
    //     name: "Search",
    //     to: "/search",
    //     icon: "cil-search"
    // },
    // // Audit
    // {
    //     _name: "CSidebarNavTitle",
    //     _children: ["Audit"],
    //     restriction: "GROUP_ALFRESCO_ADMINISTRATORS"
    // },
    // {
    //     _name: "CSidebarNavItem",
    //     name: "Files Report",
    //     to: "/files-report",
    //     icon: "cil-history"
    // },
    // {
    //     _name: "CSidebarNavItem",
    //     name: "Users Report",
    //     to: "/users-report",
    //     icon: "cil-people"
    // },
    // PDPA
    {
        _name: "CSidebarNavTitle",
        _children: ["PDPA"]
    },
    {
        _name: "CSidebarNavItem",
        name: "Request",
        to: "/request",
        icon: "cil-phone"
    },
    {
        _name: "CSidebarNavItem",
        name: "Inbox",
        to: "/inbox",
        icon: "cil-inbox"
    },
    {
        _name: "CSidebarNavItem",
        name: "Request Approval",
        to: "/request-approval",
        icon: "cil-check"
    },
    {
        _name: "CSidebarNavItem",
        name: "PDPA Report",
        to: "/PDPA/report",
        icon: "cil-shield-alt"
    },
    {
        _name: "CSidebarNavTitle",
        _children: ["Configuration"],
        restriction: "GROUP_PDPA_APPROVER"
    },
    {
        _name: "CSidebarNavItem",
        name: "PDPA Document",
        to: "/PDPA/configuration/document",
        icon: "cil-file"
    }
];