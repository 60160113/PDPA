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

<style>
@import url("https://fonts.googleapis.com/css2?family=Sarabun:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800&display=swap");
* {
  font-family: "Sarabun", sans-serif !important;
}
</style>