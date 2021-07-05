<template>
  <CDropdown
    inNav
    class="c-header-nav-items"
    placement="bottom-end"
    add-menu-classes="pt-0"
  >
    <template #toggler>
      <CHeaderNavLink>
        <div class="c-avatar">
          <img id="avatar-img" class="c-avatar-img" />
        </div>
      </CHeaderNavLink>
    </template>
    <CDropdownHeader tag="div" class="text-center" color="primary">
      <strong style="color: white">Account</strong>
    </CDropdownHeader>
    <!-- <CDropdownItem>
      <CIcon name="cil-bell" /> Updates
      <CBadge color="info" class="mfs-auto">{{ itemsCount }}</CBadge>
    </CDropdownItem> -->
    <!-- <CDropdownItem>
      <CIcon name="cil-envelope-open" /> Messages
      <CBadge color="success" class="mfs-auto">{{ itemsCount }}</CBadge>
    </CDropdownItem> -->
    <!-- <CDropdownItem>
      <CIcon name="cil-task" /> Tasks
      <CBadge color="danger" class="mfs-auto">{{ itemsCount }}</CBadge>
    </CDropdownItem> -->
    <!-- <CDropdownItem>
      <CIcon name="cil-comment-square" /> Comments
      <CBadge color="warning" class="mfs-auto">{{ itemsCount }}</CBadge>
    </CDropdownItem> -->
    <!-- <CDropdownHeader tag="div" class="text-center" color="light">
      <strong>Settings</strong>
    </CDropdownHeader> -->
    <!-- <CDropdownItem> <CIcon name="cil-user" /> Profile </CDropdownItem> -->
    <!-- <CDropdownItem> <CIcon name="cil-settings" /> Settings </CDropdownItem> -->
    <!-- <CDropdownItem>
      <CIcon name="cil-dollar" /> Payments
      <CBadge color="secondary" class="mfs-auto">{{ itemsCount }}</CBadge>
    </CDropdownItem> -->
    <!-- <CDropdownItem>
      <CIcon name="cil-file" /> Projects
      <CBadge color="primary" class="mfs-auto">{{ itemsCount }}</CBadge>
    </CDropdownItem> -->
    <!-- <CDropdownDivider /> -->
    <!-- <CDropdownItem>
      <CIcon name="cil-shield-alt" /> Lock Account
    </CDropdownItem> -->
    <CDropdownItem @click="logout()">
      <CIcon name="cil-lock-locked" /> Logout
    </CDropdownItem>
  </CDropdown>
</template>

<script>
export default {
  name: "TheHeaderDropdownAccnt",
  created() {
    this.$http
      .get(
        `${process.env.VUE_APP_ALFRESCO_BASE}alfresco/s/slingshot/profile/avatar/${this.$store.state.user.userId}`,
        { responseType: "blob" }
      )
      .then(async (res) => {
        const url = await URL.createObjectURL(res.data);

        const avatar = await document.getElementById("avatar-img");
        avatar.setAttribute("src", url);
      });
  },
  data() {
    return {
      itemsCount: 42,
    };
  },
  methods: {
    logout() {
      this.$http.delete(
        `${process.env.VUE_APP_ALFRESCO_API}authentication/versions/1/tickets/-me-`
      );
      localStorage.removeItem("user");
      this.$router.push("/");
    },
  },
};
</script>

<style scoped>
.c-icon {
  margin-right: 0.3rem;
}
</style>