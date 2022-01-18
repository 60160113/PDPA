<template>
  <div
    class="c-app flex-row align-items-center"
    :class="{ 'c-dark-theme': $store.state.darkMode }"
  >
    <CContainer>
      <CRow class="justify-content-center">
        <CCol>
          <h1 class="text-primary"><b>PDPA</b></h1>
          <h5>Personal Data Protection Act (PDPA)</h5>
        </CCol>
        <CCol md="6">
          <CCard>
            <CCardBody>
              <CForm>
                <CInput
                  size="lg"
                  placeholder="อีเมล"
                  autocomplete="username email"
                  v-model="user.userId"
                >
                  <template #prepend-content
                    ><CIcon name="cil-user"
                  /></template>
                </CInput>
                <CInput
                  size="lg"
                  placeholder="รหัสผ่าน"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="curent-password"
                  v-model="user.password"
                >
                  <template #prepend-content
                    ><CIcon name="cil-lock-locked"
                  /></template>
                  <template #append-content
                    ><span @click="showPassword = !showPassword">
                      <CIcon
                        :name="
                          showPassword ? 'cil-toggle-on' : 'cil-toggle-off'
                        " /></span
                  ></template>
                </CInput>
                <CButton
                  size="lg"
                  block
                  color="primary"
                  class="px-4"
                  @click.prevent="login"
                  ><b>เข้าสู่ระบบ</b>
                </CButton>
                <hr />
                <center>
                  <CButton
                    size="lg"
                    color="success"
                    class="px-4"
                    @click.prevent="openRegisterPage"
                    ><b>สร้างบัญชีใหม่</b>
                  </CButton>
                </center>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>

    <!-- login error modal -->
    <CModal
      title="ข้อมูลไม่ถูกต้อง"
      color="danger"
      size="lg"
      :show.sync="loginErrorModal"
      centered
    >
      <p>อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง</p>
      <template #footer>
        <CButton
          color="danger"
          class="float-right"
          @click="loginErrorModal = false"
          >ปิด</CButton
        >
      </template>
    </CModal>
  </div>
</template>

<script>
export default {
  beforeCreate() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      this.$router.push("/request");
    }
  },
  data() {
    return {
      user: {
        userId: "",
        password: "",
      },
      loginErrorModal: false,

      showPassword: false,
    };
  },
  methods: {
    async login() {
      try {
        const loginResponse = await this.$http.post(
          `${process.env.VUE_APP_ALFRESCO_API}authentication/versions/1/tickets`,
          this.user
        );

        this.$http.defaults.headers["Authorization"] = `Basic ${window.btoa(
          loginResponse.data.entry.id
        )}`;

        const userDataResponse = await this.$http.get(
          `${process.env.VUE_APP_ALFRESCO_API}alfresco/versions/1/people/-me-`
        );

        const userGroupsResponse = await this.$http.get(
          `${process.env.VUE_APP_ALFRESCO_API}alfresco/versions/1/people/-me-/groups`
        );

        const data = {
          ticket: loginResponse.data.entry.id,
          userId: this.user.userId,
          displayName:
            userDataResponse.data.entry.firstName +
            (userDataResponse.data.entry.hasOwnProperty("lastName")
              ? " " + userDataResponse.data.entry.lastName
              : ""),
          groups: userGroupsResponse.data.list.entries.map(
            (item) => item.entry.id
          ),
          email: userDataResponse.data.entry.email,
        };
        this.$store.commit("set", ["user", data]);
        localStorage.setItem("user", JSON.stringify(data));

        this.$router.push("/request");
      } catch (error) {
        this.loginErrorModal = true;
      }
    },
    openRegisterPage() {
      let routeData = this.$router.resolve("/register");
      Object.assign(document.createElement("a"), {
        target: "_blank",
        href: routeData.href,
      }).click();
    },
  },
};
</script>
