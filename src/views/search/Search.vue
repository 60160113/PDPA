<template>
  <div>
    <CCard>
      <CCardHeader>
        <strong style="color: #321fdb">Search</strong>
      </CCardHeader>
      <CCardBody>
        <CTabs variant="pills" :activeTab.sync="tabIndex">
          <CTab style="width: 50%">
            <template slot="title">
              <CIcon height="25" name="cil-file" /> Files
            </template>
          </CTab>
          <CTab style="width: 50%">
            <template slot="title">
              <CIcon height="25" name="cil-folder" /> Folders
            </template>
          </CTab>
        </CTabs>
        <br />
        <p style="font-size: 16px" class="text-primary">รายละเอียด</p>
        <CRow>
          <CCol>
            <CInput label="คำค้น" horizontal />
          </CCol>
          <CCol>
            <CInput label="ชื่อ" horizontal />
          </CCol>
        </CRow>
        <CRow>
          <CCol>
            <CTextarea label="หัวข้อ" horizontal />
          </CCol>
          <CCol>
            <CTextarea label="คำอธิบาย" horizontal />
          </CCol>
        </CRow>
        <hr />
        <p style="font-size: 16px" class="text-primary">รายละเอียดไฟล์</p>
        <CRow>
          <CCol>
            <CSelect label="Mime type" horizontal placeholder="กรุณาเลือก" />
          </CCol>
          <CCol>
            <CInput label="ผู้แก้ไข" horizontal />
          </CCol>
        </CRow>
        <hr />
        <p style="font-size: 16px" class="text-primary">วันที่แก้ไข</p>
        <CRow>
          <CCol>
            <v-date-picker is-expanded mode="range" v-model="selectedDate" />
            <p>date: {{ selectedDate }}</p>
          </CCol>
          <CCol col="2">
            <CButton
              color="warning"
              @click="selectedDate = null"
              >ยกเลิก</CButton
            >
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  </div>
</template>
<script>
import { DatePicker } from "v-calendar";

export default {
  components: {
    "v-date-picker": DatePicker,
  },
  data() {
    return {
      tabIndex: 0,

      selectedDate: null,
    };
  },
};
</script>