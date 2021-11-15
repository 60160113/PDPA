<template>
  <div>
    <CRow>
      <CCol col="3"
        ><label style="margin-top: 6px">เอกสารที่ต้องการขอ: </label></CCol
      >
      <CCol
        ><CSelect :value.sync="requestName" :options="documents" custom
      /></CCol>
    </CRow>
    <CInput
      v-if="requestName === false"
      horizontal
      label="ชื่อเอกสาร"
      v-model="form.name"
    />

    <hr />
    <CTextarea horizontal label="เหตุผลในการขอข้อมูล" v-model="form.description" />

    <CRow class="mt-3">
      <CCol col="3">
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

    <CButton
      block
      color="primary"
      class="mt-3"
      :disabled="(!requestName && !form.name) || !form.expiredAt"
      @click="request()"
      >บันทึก</CButton
    >

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
  created() {
    this.getDocument();
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

      documents: [],
      requestName: "",

      loading: false,
    };
  },
  methods: {
    getDocument() {
      this.loading = true;
      this.documents = [];
      this.$http
        .get(`${process.env.VUE_APP_PDPA_SERVICES}data/document`)
        .then((res) => {
          this.documents.push({
            value: "",
            label: "กรุณาเลือก",
            disabled: true,
          });
          this.documents.push(...res.data);
          this.documents.push({
            value: false,
            label: "อื่น ๆ",
          });
          this.loading = false;
        });
    },
    request() {
      this.loading = true;
      if (this.requestName) {
        this.form.name = this.requestName;
      }
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