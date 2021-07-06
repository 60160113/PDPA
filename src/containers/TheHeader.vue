<template>
  <CHeader with-subheader>
    <CToggler
      in-header
      class="ml-3 d-lg-none"
      @click="$store.commit('toggleSidebarMobile')"
    />
    <CToggler
      in-header
      class="ml-3 d-md-down-none"
      @click="$store.commit('toggleSidebarDesktop')"
    />
    <CHeaderBrand class="mx-auto d-lg-none" to="/">
      <CIcon name="logo" height="48" alt="Logo" />
    </CHeaderBrand>
    <CHeaderNav class="d-md-down-none mr-auto">
      <!-- <CHeaderNavItem class="px-3">
        <CHeaderNavLink to="/dashboard">
          Dashboard
        </CHeaderNavLink>
      </CHeaderNavItem>
      <CHeaderNavItem class="px-3">
        <CHeaderNavLink to="/users" exact>
          Users
        </CHeaderNavLink>
      </CHeaderNavItem>
      <CHeaderNavItem class="px-3">
        <CHeaderNavLink>
          Settings
        </CHeaderNavLink>
      </CHeaderNavItem> -->
    </CHeaderNav>
    <CHeaderNav>
      <CHeaderNavItem>
        <CRow class="mt-3 c-header-nav-item">
          <CCol col="8">
            <CInput
              size="sm"
              placeholder="Search"
              @keypress.enter="keyword ? search() : null"
              v-model="keyword"
            />
          </CCol>
          <CCol>
            <CButton
              size="sm"
              color="primary"
              :disabled="!keyword"
              @click="search"
              >Search</CButton
            >
          </CCol>
        </CRow>
      </CHeaderNavItem>

      <CHeaderNavItem class="px-3 c-d-legacy-none">
        <button
          @click="() => $store.commit('toggle', 'darkMode')"
          class="c-header-nav-btn"
        >
          <CIcon v-if="$store.state.darkMode" name="cil-sun" />
          <CIcon v-else name="cil-moon" />
        </button>
      </CHeaderNavItem>
      <!-- <TheHeaderDropdownNotif/> -->
      <!-- <TheHeaderDropdownTasks/> -->
      <!-- <TheHeaderDropdownMssgs/> -->
      <TheHeaderDropdownAccnt />
      <!-- <CHeaderNavItem class="px-3">
        <button
          class="c-header-nav-btn"
          @click="$store.commit('toggle', 'asideShow')"
        >
          <CIcon size="lg" name="cil-applications-settings" class="mr-2"/>
        </button>
      </CHeaderNavItem> -->
    </CHeaderNav>

    <!-- <CSubheader class="px-3">
      <CBreadcrumbRouter class="border-0 mb-0"/>
    </CSubheader> -->
  </CHeader>
</template>

<script>
import TheHeaderDropdownAccnt from "./TheHeaderDropdownAccnt";
import TheHeaderDropdownNotif from "./TheHeaderDropdownNotif";
import TheHeaderDropdownTasks from "./TheHeaderDropdownTasks";
import TheHeaderDropdownMssgs from "./TheHeaderDropdownMssgs";

export default {
  name: "TheHeader",
  components: {
    TheHeaderDropdownAccnt,
    TheHeaderDropdownNotif,
    TheHeaderDropdownTasks,
    TheHeaderDropdownMssgs,
  },
  data() {
    return {
      keyword: "",
    };
  },
  methods: {
    search() {
      let query = `(TEXT:*${this.keyword}* OR cm:name:*${this.keyword}* OR cm:title:*${this.keyword}* OR cm:description:*${this.keyword}* OR cm:creator:*${this.keyword}* OR cm:modifier:*${this.keyword}*) AND NOT (TYPE:'fm:topic' OR TYPE:'fm:post')`;
      this.$router.push({
        name: "search-results",
        query: { query, language: "afts" },
      });
    },
  },
};
</script>
