<template>
  <div
    class="c-app d-flex align-items-center min-vh-100"
    :class="{ 'c-dark-theme': $store.state.darkMode }"
  >
    <CContainer fluid>
      <CRow class="justify-content-center">
        <CCol md="6">
          <CCard class="mx-4 mb-0" v-if="!complete">
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
                  prepend="@"
                  v-model="form.email"
                />
                <CInput
                  size="lg"
                  placeholder="รหัสผ่าน"
                  type="password"
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
                  v-model="confirmPassword"
                >
                  <template #prepend-content
                    ><CIcon name="cil-lock-locked"
                  /></template>
                </CInput>
              </CForm>
            </CCardBody>
            <CCardFooter>
              <CButton
                color="success"
                block
                size="lg"
                @click="register()"
                :disabled="disabledRegisterBtn"
                ><b>สมัคร</b></CButton
              >
            </CCardFooter>
          </CCard>
          <CCard class="mx-4 mb-0" v-else>
            <CCardHeader
              ><h1><b>ยืนยันตัวตน</b></h1></CCardHeader
            >
            <CCardBody
              ><h5>
                กรุณายืนยันตัวตนผ่านอีเมล <b>{{ form.email }}</b>
              </h5>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CElementCover :opacity="0.8" v-show="loading" style="z-index: 9999" />
    </CContainer>

    <div v-show="false">
      <div id="email-content" v-if="requestId">
        <p>กรุณายืนยันตัวตนโดยกดที่ปุ่มด้านล่าง</p>
        <br />
        <a
          :href="confirmRegisterUrl(requestId)"
          target="_blank"
          style="cursor: pointer"
        >
          <button
            style="
              background-color: #2eb85c;
              color: white;
              border: none;
              font-size: 16px;
              border-radius: 4px;
              padding: 10px 20px;
              text-align: center;
            "
          >
            <b>ยืนยันตัวตน</b>
          </button>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import bcrypt from "bcryptjs";
export default {
  name: "Register",
  data() {
    return {
      form: {
        password: "",
        email: "",

        firstName: "",
        lastName: "",
      },

      requestId: "",

      confirmPassword: "",

      loading: false,
      complete: false,
    };
  },
  methods: {
    async register() {
      this.loading = true;
      // set data
      const salt = bcrypt.genSaltSync(10);
      const bcrypt_password = await bcrypt.hash(this.form.password, salt);

      var data = { ...this.form };
      data.password = bcrypt_password;

      this.$http
        .post(`${process.env.VUE_APP_PDPA_SERVICES}data/register`, data)
        .then((res) => {
          this.requestId = res.data._id;
          this.sendMail();
          this.loading = false;
          this.complete = true;
        })
        .catch((err) => {
          this.loading = false;
        });
    },
    sendMail() {
      var html = document.getElementById("email-content").outerHTML;
      this.$http.post(`${process.env.VUE_APP_PDPA_SERVICES}notify/mail`, {
        from: process.env.VUE_APP_MAIL,
        to: this.form.email,
        subject: "สมัครสมาชิก PDPA: ยืนยันตัวตน",
        html,
      });
    },
    confirmRegisterUrl(id) {
      return location.href.replace("register", "confirm_register/" + id);
    },
  },
  computed: {
    disabledRegisterBtn() {
      return (
        Object.values(this.form).filter((item) => item == "").length > 0 ||
        this.confirmPassword != this.form.password
      );
    },
  },
};
</script>
