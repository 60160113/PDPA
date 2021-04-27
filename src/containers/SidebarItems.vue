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
          ],
        },
      ];
    },
  },
};
</script>
