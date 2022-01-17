<template>
  <div
    class="c-app d-flex align-items-center min-vh-100"
    :class="{ 'c-dark-theme': $store.state.darkMode }"
  >
    <CContainer fluid>
      <CRow class="justify-content-center">
        <CCol md="6">
          <CCard class="mx-4 mb-0">
            <CCardBody class="p-4">
              <CForm>
                <h1>Register</h1>
                <p class="text-muted">Create your account</p>
                <CInput placeholder="Username" autocomplete="username">
                  <template #prepend-content
                    ><CIcon name="cil-user"
                  /></template>
                </CInput>
                <CInput placeholder="Email" autocomplete="email" prepend="@" />
                <CInput
                  placeholder="Password"
                  type="password"
                  autocomplete="new-password"
                >
                  <template #prepend-content
                    ><CIcon name="cil-lock-locked"
                  /></template>
                </CInput>
                <CInput
                  placeholder="Repeat password"
                  type="password"
                  autocomplete="new-password"
                  class="mb-4"
                >
                  <template #prepend-content
                    ><CIcon name="cil-lock-locked"
                  /></template>
                </CInput>
              </CForm>
            </CCardBody>
            <CCardFooter class="p-4">
              <CButton color="success" block>Create Account</CButton>
            </CCardFooter>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  </div>
</template>

<script>
export default {
  name: "Register",
  data() {
    return {
      form: {
        id: "",
        password: "",
        email: "",

        firstName: "",
        lastName: "",
        displayName: "",
      },

      confirmPassword: "",
    };
  },
  methods: {
    register() {
      console.log(this.form)
    }
  },
};
</script>
