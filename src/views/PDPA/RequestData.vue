<template>
  <div>
    <CCard>
      <CCardHeader>
        <strong class="text-primary">ร้องขอข้อมูล</strong>
      </CCardHeader>

      <CCardBody>
        <b style="font-size: 16px" class="text-primary">ข้อมูล</b>
        <CRow class="mt-3">
          <CCol col="2">
            <label style="margin-top: 5px">
              เจ้าของข้อมูล&nbsp;
              <b style="color: red">*</b>
            </label>
          </CCol>
          <CCol>
            <v-select
              v-model="personalDataId"
              :options="personalDataOptions"
              :reduce="(item) => item.id"
              label="name"
              placeholder="กรุณาเลือก"
            />
          </CCol>
        </CRow>

        <CRow class="mt-3" v-if="personalDataId">
          <CCol col="2">
            <label style="margin-top: 5px">
              ข้อมูล&nbsp;
              <b style="color: red">*</b>
            </label>
          </CCol>
          <CCol>
            <v-select
              v-model="data"
              :options="dataOptions"
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

        <div class="text-right">
          <CButton
            color="primary"
            :disabled="!personalDataId || !data"
            @click="request"
          >
            บันทึก
          </CButton>
        </div>
      </CCardBody>
    </CCard>

    <!-- notify -->
    <CModal
      :show.sync="notify"
      :no-close-on-backdrop="true"
      :centered="true"
      title="เสร็จสิ้น"
      size="sm"
      color="success"
    >
      ส่งคำร้องขอเสร็จสิ้น
      <template #footer>
        <CButton @click="notify = false" color="secondary"> ปิด </CButton>
      </template>
    </CModal>

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
  async created() {
    this.personalDataOptions = await this.getNodeChildrenById(
      process.env.VUE_APP_PERSONAL_DATA_FOLDER,
      { where: "(isFolder=true)", fields: ["name", "id"] }
    );
  },
  watch: {
    personalDataId: async function (id) {
      if (id) {
        this.dataOptions = await this.getNodeChildrenById(id, {
          where: "(isFile=true)",
          fields: ["name", "id"],
        });

        const filter = await this.$http.get(
          `${process.env.VUE_APP_PDPA_SERVICES}personal_data?status=pending&status=approved&requester.id=${this.$store.state.user.userId}`
        );

        this.dataOptions = await this.dataOptions.filter((element) => {
          return (
            filter.data.filter((item) => item.data.id == element.id).length == 0
          );
        });

        this.data = this.dataOptions[0];
      } else {
        this.dataOptions = [];
        this.data = null;
      }
    },
  },
  data() {
    return {
      personalDataOptions: [],
      personalDataId: null,

      dataOptions: [],

      data: null,

      consents: [""],

      loading: false,

      notify: false,
    };
  },
  methods: {
    async getNodeChildrenById(id, query = {}) {
      try {
        let hasMoreItems = false;
        const maxItems = 1000;
        let skipCount = 0;
        let arr = [];

        const BASE_URL = `${process.env.VUE_APP_ALFRESCO_API}alfresco/versions/1/nodes/${id}/children`;

        let query_string = "";

        await Object.keys(query).forEach((key) => {
          query_string += `&${key}=${query[key]}`;
        });

        do {
          const res = await this.$http.get(
            `${BASE_URL}?maxItems=${maxItems}&skipCount=${skipCount}${query_string}`
          );

          arr.push(...res.data.list.entries.map((item) => item.entry));

          hasMoreItems = res.data.list.pagination.hasMoreItems;
          skipCount += maxItems;
        } while (hasMoreItems);

        return arr;
      } catch (error) {
        return [];
      }
    },
    request() {
      this.loading = true;
      this.$http
        .post(`${process.env.VUE_APP_PDPA_SERVICES}personal_data`, {
          requester: {
            id: this.$store.state.user.userId,
            name: this.$store.state.user.displayName,
          },
          data: this.data,

          consents: this.consents,
        })
        .then(() => {
          setTimeout(() => {
            this.loading = false;
            this.personalDataId = null;

            this.notify = true;
          }, 1000);
        })
        .catch((err) => {
          this.loading = false;
        });
    },
  },
};
</script>