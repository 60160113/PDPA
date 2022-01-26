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
              ><h1><b>ยืนยันการสมัคร</b></h1></CCardHeader
            >
            <CCardBody>
              <CForm>
                <CInput size="lg" placeholder="รหัสผ่าน" v-model="password" />
              </CForm>
            </CCardBody>
            <CCardFooter>
              <CButton
                block
                color="primary"
                @click.prevent="submit()"
                :disabled="!password"
                ><b>สมัคร</b></CButton
              >
            </CCardFooter>
          </CCard>
        </CCol>
      </CRow>
      <CElementCover :opacity="0.8" v-show="loading" style="z-index: 9999" />
    </CContainer>

    <!-- error modal -->
    <CModal
      title="ข้อมูลไม่ถูกต้อง"
      color="danger"
      size="sm"
      :show.sync="errModal"
      centered
    >
      <p>รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง</p>
      <template #footer>
        <CButton color="danger" class="float-right" @click="errModal = false"
          >ปิด</CButton
        >
      </template>
    </CModal>
  </div>
</template>

<script>
import bcrypt from "bcryptjs";
export default {
  created() {
    this.loading = true;
    this.$http
      .get(
        `${process.env.VUE_APP_PDPA_SERVICES}data/register/${this.$route.params.id}`
      )
      .then((res) => {
        this.loading = false;
        this.registerData = res.data;
      })
      .catch((err) => {
        this.loading = false;
      });
  },
  data() {
    return {
      loading: false,

      password: "",

      registerData: {
        email: "",
        firstName: "",
        lastName: "",
        password: "",
      },

      errModal: false,
    };
  },
  methods: {
    async submit() {
      const checkPassword = await bcrypt.compare(
        this.password,
        this.registerData.password
      );
      if (checkPassword) {
        this.loading = true;
        const loginResponse = await this.$http.post(
          `${process.env.VUE_APP_ALFRESCO_API}authentication/versions/1/tickets`,
          {
            userId: "jack",
            password: "ivsoft",
          }
        );

        await this.$http
          .post(
            `${process.env.VUE_APP_ALFRESCO_API}alfresco/versions/1/people`,
            {
              id: this.registerData.email,
              firstName: this.registerData.firstName,
              lastName: this.registerData.lastName,
              email: this.registerData.email,
            //   displayName: `${this.registerData.firstName} ${this.registerData.lastName}`,
              password: this.password,
            },
            {
              headers: {
                Authorization:
                  "Basic " + window.btoa(loginResponse.data.entry.id),
              },
            }
          )
          .then(() => {
            this.loading = false;
            this.$router.push("/");
          });
      } else {
        this.errModal = true;
      }
    },
  },
};
</script>