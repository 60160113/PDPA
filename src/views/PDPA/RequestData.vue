<template>
  <div>
    <CCard>
      <CCardHeader>
        <strong class="text-primary">ร้องขอข้อมูล</strong>
      </CCardHeader>

      <CCardBody>
        <b style="font-size: 16px" class="text-primary">ไฟล์</b>
        <CRow class="mt-3">
          <CCol col="2">
            <label style="margin-top: 5px"
              >เลือกไฟล์&nbsp;<b style="color: red">*</b>
            </label>
          </CCol>
          <CCol>
            <v-select
              v-model="personalData"
              :options="personalDataList"
              label="name"
              placeholder="กรุณาเลือก"
            />
          </CCol>
        </CRow>

        <hr />

        <CRow>
          <CCol>
            <b style="font-size: 16px" class="text-primary">Consents</b>
          </CCol>
          <CCol class="d-flex justify-content-end">
            <CButton
              color="primary"
              v-c-tooltip="'เพิ่ม'"
              @click="consents.push('')"
            >
              <CIcon name="cil-plus" />&nbsp;เพิ่ม
            </CButton>
          </CCol>
        </CRow>
        <br />
        <CRow v-for="(item, index) in consents" :key="index">
          <CCol md="10" sm="6">
            <CTextarea
              :label="`Consent ที่ ${index + 1}:`"
              horizontal
              v-model="consents[index]"
            />
          </CCol>
          <CCol class="text-right">
            <CButton
              color="danger"
              v-c-tooltip="'ลบ'"
              @click="consents.splice(index, 1)"
            >
              <CIcon name="cil-trash" />
            </CButton>
          </CCol>
        </CRow>
        <CAlert :show="alertConfig.show" :color="alertConfig.color">
          {{ alertConfig.text }}
        </CAlert>
        <div class="text-right">
          <CButton color="primary" :disabled="!personalData" @click="request">
            บันทึก
          </CButton>
        </div>
      </CCardBody>
    </CCard>

    <CElementCover :opacity="0.7" v-show="loading" />
  </div>
</template>

<script>
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";

export default {
  components: {
    vSelect,
  },
  created() {
    this.getPersonalDataList();
  },
  data() {
    return {
      personalDataList: [],
      personalData: null,

      consents: [""],

      alertConfig: {
        show: false,
        text: "บันทึกเสร็จสิ้น",
        color: "success",
      },

      loading: false,
    };
  },
  methods: {
    async getPersonalDataList() {
      this.personalDataList = [];

      let hasMoreItems = false,
        maxItems = 1000,
        skipCount = 0;

      do {
        const res = await this.$http.get(
          `${process.env.VUE_APP_ALFRESCO_API}alfresco/versions/1/nodes/${process.env.VUE_APP_PERSONAL_DATA_FOLDER}/children?maxItems=${maxItems}&skipCount=${skipCount}&where=(isFile=true)`
        );

        this.personalDataList.push(
          ...res.data.list.entries.map((item) => {
            return {
              id: item.entry.id,
              name: item.entry.name,
            };
          })
        );
        hasMoreItems = res.data.list.pagination.hasMoreItems;
        skipCount += maxItems;
      } while (hasMoreItems);

      const filter = await this.$http.get(
        `${process.env.VUE_APP_PDPA_SERVICES}personal_data?status=pending&requester.id=${this.$store.state.user.userId}`
      );

      this.personalDataList = this.personalDataList.filter((item) => {
        return (
          filter.data.filter(
            (element) =>
              element.data.id == item.id || element.data.status == "approved"
          ).length === 0
        );
      });
    },
    request() {
      this.loading = true;
      this.$http
        .post(`${process.env.VUE_APP_PDPA_SERVICES}personal_data`, {
          requester: {
            id: this.$store.state.user.userId,
            name: this.$store.state.user.displayName,
          },
          data: {
            id: this.personalData.id,
            name: this.personalData.name,
          },
          consents: this.consents,
        })
        .then((res) => {
          this.loading = false;
          if (res.response) {
            this.alertConfig = {
              show: true,
              text: res.response.data,
              color: "danger",
            };
          } else {
            this.alertConfig = {
              show: true,
              text: "บันทึกเสร็จสิ้น",
              color: "success",
            };
            this.personalData = null;
            this.getPersonalDataList();
          }

          setTimeout(() => {
            this.alertConfig.show = false;
          }, 1500);
        })
        .catch((err) => {
          this.loading = false;
        });
    },
  },
};
</script>