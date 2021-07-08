<template>
  <CCard>
    <CCardHeader>
      <strong class="text-primary">Search</strong>
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
          <CInput label="คำค้น" horizontal v-model="search.keywords" />
        </CCol>
        <CCol>
          <CInput label="ชื่อ" horizontal v-model="search.name" />
        </CCol>
      </CRow>
      <CRow>
        <CCol>
          <CTextarea label="หัวข้อ" horizontal v-model="search.title" />
        </CCol>
        <CCol>
          <CTextarea label="คำอธิบาย" horizontal v-model="search.description" />
        </CCol>
      </CRow>
      <div v-show="tabIndex == 0">
        <hr />
        <p style="font-size: 16px" class="text-primary">รายละเอียดไฟล์</p>
        <CRow>
          <CCol col="1"><label style="margin-top: 5px">Mime Type</label></CCol>
          <CCol>
            <v-select
              v-model="search.mimeType"
              :options="mimeTypeOptions"
              label="description"
              placeholder="กรุณาเลือก"
            />
          </CCol>
          <CCol>
            <CInput label="ผู้แก้ไข" horizontal v-model="search.modifier" />
          </CCol>
        </CRow>
        <hr />
        <p style="font-size: 16px" class="text-primary">วันที่แก้ไข</p>
        <CRow>
          <CCol>
            <v-date-picker is-expanded mode="range" v-model="search.date" />
          </CCol>
          <CCol col="2">
            <CButton block color="warning" @click="search.date = null"
              >ยกเลิก</CButton
            >
          </CCol>
        </CRow>
      </div>
      <hr />
      <CRow>
        <CCol>
          <CButton color="primary" style="width: 100%" @click="searching"
            >ค้นหา</CButton
          >
        </CCol>
      </CRow>
    </CCardBody>
  </CCard>
</template>
<script>
import { DatePicker } from "v-calendar";
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";

export default {
  components: {
    "v-date-picker": DatePicker,
    vSelect,
  },
  data() {
    return {
      tabIndex: 0,

      mimeTypeOptions: [],

      search: {
        keywords: "",
        name: "",
        title: "",
        description: "",
        mimeType: null,
        modifier: "",
        date: null,
      },
    };
  },
  methods: {
    async getMimeTypeOptions() {
      const { data } = await this.$http.get(
        `${process.env.VUE_APP_ALFRESCO_SERVICES}mimetypes/descriptions`
      );

      for (let index = 0; index < Object.values(data.data).length; index += 1) {
        Object.values(data.data)[index].name = Object.keys(data.data)[index];
      }
      this.mimeTypeOptions = Object.values(data.data);
    },
    searching() {
      const baseType = this.tabIndex == 0 ? "cmis:document" : "cmis:folder";

      let query = `SELECT * FROM ${baseType} AS D JOIN cm:titled AS T ON D.cmis:objectId = T.cmis:objectId`;
      // key word //
      if (this.search.keywords !== "") {
        query += query.search("WHERE") === -1 ? " WHERE " : " AND ";
        query += `CONTAINS(D, '${this.search.keywords}')`;
      }
      // name //
      if (this.search.name !== "") {
        query += query.search("WHERE") === -1 ? " WHERE " : " AND ";
        query += `D.cmis:name LIKE '%${this.search.name}%'`;
      }
      // title //
      if (this.search.title !== "") {
        query += query.search("WHERE") === -1 ? " WHERE " : " AND ";
        query += `T.cm:title LIKE '%${this.search.title}%'`;
      }
      // description //
      if (this.search.description !== "") {
        query += query.search("WHERE") === -1 ? " WHERE " : " AND ";
        query += `D.cmis:description LIKE '%${this.search.description}%'`;
      }

      if (this.tabIndex === 0) {
        // mimeType //
        if (this.search.mimeType !== null) {
          query += query.search("WHERE") === -1 ? " WHERE " : " AND ";
          query += `D.cmis:contentStreamMimeType = '${this.search.mimeType.name}'`;
        }
        // modifier //
        if (this.search.modifier !== "") {
          query += query.search("WHERE") === -1 ? " WHERE " : " AND ";
          query += `D.cmis:createdBy LIKE '%${this.search.modifier}%'`;
        }
        // modified date //
        if (this.search.date !== null) {
          query += query.search("WHERE") === -1 ? " WHERE " : " AND ";
          query += `D.cmis:lastModificationDate >= TIMESTAMP'${this.search.date.start.toISOString()}' AND D.cmis:lastModificationDate <= TIMESTAMP'${this.search.date.end.toISOString()}'`;
        }
      }
      this.$router.push({
        name: "search-results",
        query: { query, language: "cmis" },
      });
    },
  },
  created() {
    this.getMimeTypeOptions();
  },
};
</script>