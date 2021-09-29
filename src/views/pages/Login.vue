<template>
  <div
    class="c-app flex-row align-items-center"
    :class="{ 'c-dark-theme': $store.state.darkMode }"
  >
    <CContainer>
      <CRow class="justify-content-center">
        <CCol lg="6">
          <CCard class="p-4">
            <CCardBody>
              <CForm>
                <h1>Login</h1>
                <p class="text-muted">Sign In to your account</p>
                <CInput
                  placeholder="Username"
                  autocomplete="username email"
                  v-model="user.userId"
                >
                  <template #prepend-content
                    ><CIcon name="cil-user"
                  /></template>
                </CInput>
                <CInput
                  placeholder="Password"
                  type="password"
                  autocomplete="curent-password"
                  v-model="user.password"
                >
                  <template #prepend-content
                    ><CIcon name="cil-lock-locked"
                  /></template>
                </CInput>
                <CRow>
                  <CCol col="6" class="text-left">
                    <CButton color="primary" class="px-4" @click="login"
                      >Login</CButton
                    >
                  </CCol>
                  <CCol col="6" class="text-right">
                    <!-- <CButton color="link" class="px-0"
                      >Forgot password?</CButton
                    > -->
                  </CCol>
                </CRow>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
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
  name: "Login",
  data() {
    return {
      user: {
        userId: "",
        password: "",
      },
      loginErrorModal: false,
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
  },
};
</script>
