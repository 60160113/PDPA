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
              v-model="personalDataId"
              :options="personalDataList"
              :reduce="(item) => item.id"
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
          <CButton color="primary" :disabled="!personalDataId" @click="request">
            บันทึก
          </CButton>
        </div>
      </CCardBody>
    </CCard>
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
      personalDataId: "",

      consents: [""],
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
    },
    request() {
      console.log(this.personalDataId);
      console.log(this.consents);
      console.log(this.$store.state.user.userId);
      console.log(this.$store.state.user.displayName);
      console.log("-------------------");
    },
  },
};
</script>