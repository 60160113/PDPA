<template>
  <div
    class="c-app d-flex align-items-center min-vh-100"
    :class="{ 'c-dark-theme': $store.state.darkMode }"
  >
    <CContainer fluid>
      <CRow class="justify-content-center">
        <CCol md="6">
          <CCard class="mx-4 mb-0">
            <CCardHeader
              ><h1><b>สมัคร</b></h1>
              <p class="text-muted mb-0">สร้างบัญชีใหม่</p></CCardHeader
            >
            <CCardBody>
              <CForm>
                <CRow>
                  <CCol md="6">
                    <CInput
                      size="lg"
                      placeholder="ชื่อ"
                      v-model="form.firstName"
                  /></CCol>
                  <CCol md="6">
                    <CInput
                      size="lg"
                      placeholder="นามสกุล"
                      v-model="form.lastName"
                  /></CCol>
                </CRow>
                <CInput
                  size="lg"
                  placeholder="อีเมล"
                  autocomplete="email"
                  prepend="@"
                  v-model="form.email"
                />
                <CInput
                  size="lg"
                  placeholder="รหัสผ่าน"
                  type="password"
                  autocomplete="new-password"
                  v-model="form.password"
                >
                  <template #prepend-content
                    ><CIcon name="cil-lock-locked"
                  /></template>
                </CInput>
                <CInput
                  size="lg"
                  placeholder="กรอกรหัสผ่านอีกครั้ง"
                  type="password"
                  autocomplete="new-password"
                  class="mb-4"
                  v-model="confirmPassword"
                >
                  <template #prepend-content
                    ><CIcon name="cil-lock-locked"
                  /></template>
                </CInput>
              </CForm>
            </CCardBody>
            <CCardFooter>
              <CButton color="success" block size="lg" @click="register()"
                ><b>สมัคร</b></CButton
              >
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
      // set data
      var data = { ...this.form };
      data.id = data.email;
      data.displayName = `${data.firstName} ${data.lastName}`;
      console.log(data);
    },
  },
};
</script>
