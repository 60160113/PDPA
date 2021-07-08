<template>
  <div>
    <CCard>
      <CCardHeader>
        <strong class="text-primary">ร้องขอข้อมูล</strong>
      </CCardHeader>

      <CCardBody>
        <!-- <hr /> -->

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
          <CButton color="primary" @click="request"> บันทึก </CButton>
        </div>
      </CCardBody>
    </CCard>
  </div>
</template>

<script>
export default {
  data() {
    return {
      consents: [""],
    };
  },
  methods: {
    request() {
      console.log(this.consents);
    },
  },
};
</script>