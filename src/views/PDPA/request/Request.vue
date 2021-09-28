<template>
  <div>
    <CInput horizontal label="เอกสารที่ต้องการขอ" v-model="form.name" />
    <CTextarea horizontal label="คำอธิบาย" v-model="form.description" />

    <CRow class="mt-3">
      <CCol col="2">
        <label style="margin-top: 6px">ขอเอกสารภายในวันที่: </label>
      </CCol>
      <CCol>
        <v-date-picker
          :min-date="new Date()"
          mode="date"
          :masks="{
            input: 'DD/MM/YYYY',
          }"
          v-model="form.expiredAt"
        />
      </CCol>
    </CRow>

    <CButton block color="primary" class="mt-3">บันทึก</CButton>

    <CElementCover :opacity="0.7" v-show="loading" />
  </div>
</template>

<script>
import { DatePicker } from "v-calendar";

export default {
  props: {
    onComplete: {
      type: Function,
      default: function () {
        return true;
      },
    },
  },
  components: {
    "v-date-picker": DatePicker,
  },
  data() {
    return {
      form: {
        name: "",

        requester: {
          id: this.$store.state.user.userId,
          name: this.$store.state.user.displayName,
          email: this.$store.state.user.email,
        },

        folder: "",
        description: "",
        expiredAt: null,
      },

      loading: false,
    };
  },
  methods: {
    request() {
      this.loading = true;
      this.$http
        .post(`${process.env.VUE_APP_PDPA_SERVICES}data/request`, this.form)
        .then(() => {
          this.loading = false;
          this.onComplete();
        });
    },
  },
};
</script>