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
        <div class="text-primary">
          {{ $store.state.user.displayName }} <br />
          {{ $store.state.user.email }}
        </div>
      </CHeaderNavLink>
    </template>
    <CDropdownHeader tag="div" class="text-center" color="primary">
      <strong style="color: white">Account</strong>
    </CDropdownHeader>
    <CDropdownItem @click.prevent="logout()">
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
      location.reload();
    },
  },
};
</script>

<style scoped>
.c-icon {
  margin-right: 0.3rem;
}
</style>