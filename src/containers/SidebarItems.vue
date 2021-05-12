<script>
import menu from "./menu";
export default {
  name: "nav",
  data() {
    return {
      items: menu.filter((element) => {
        if (element["_name"] == "CSidebarNavItem") {
          // CSidebarNavItem
          if (
            this.$router.match(element.to).meta.hasOwnProperty("restriction")
          ) {
            if (
              this.$store.state.user.groups.indexOf(
                this.$router.match(element.to).meta.restriction
              ) != -1
            ) {
              return true;
            }
            return false;
          }
          return true;
        } else {
          // CSidebarNavTitle
          if (element.hasOwnProperty("restriction")) {
            if (
              this.$store.state.user.groups.indexOf(element.restriction) != -1
            ) {
              return true;
            }
            return false;
          }
          return true;
        }
      }),
    };
  },
  computed: {
    sidebarItems() {
      return [
        {
          _name: "CSidebarNav",
          _children: [...this.items],
        },
      ];
    },
  },
};
</script>
