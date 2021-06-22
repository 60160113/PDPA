<script>
export default {
  name: "nav",
  computed: {
    sidebarItems() {
      return [
        {
          _name: "CSidebarNav",
          _children: [
            // Files
            {
              _name: "CSidebarNavTitle",
              _children: ["Files"],
            },
            {
              _name: "CSidebarNavItem",
              name: "My Files",
              to: "/myfiles",
              icon: "cil-file",
            },
            {
              _name: "CSidebarNavItem",
              name: "Shared Files",
              to: "/sharedfiles",
              icon: "cil-file",
            },
            {
              _name: "CSidebarNavItem",
              name: "Repository",
              to: "/repository",
              icon: "cil-file",
            },
            // Search
            {
              _name: "CSidebarNavTitle",
              _children: ["Search"],
            },
            {
              _name: "CSidebarNavItem",
              name: "Search",
              to: "/search",
              icon: "cil-search",
            },
            // Audit
            {
              _name: "CSidebarNavTitle",
              _children: ["Audit"],
            },
            {
              _name: "CSidebarNavItem",
              name: "Files Report",
              to: "/files-report",
              icon: "cil-history",
            },
            {
              _name: "CSidebarNavItem",
              name: "Users Report",
              to: "/users-report",
              icon: "cil-people",
            },
          ],
        },
      ];
    },
  },
};
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Sarabun:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800&display=swap");
* {
  font-family: "Sarabun", sans-serif !important;
}
</style>