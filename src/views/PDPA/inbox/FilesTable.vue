<template>
  <div>
    <!-- alf files -->
    <CDataTable
      :items="files"
      :fields="fields"
      :items-per-page="5"
      :itemsPerPageSelect="{
        label: 'แสดง',
      }"
      :tableFilter="{
        label: 'ค้นหา: ',
        placeholder: 'ค้นหา',
      }"
      :loading="loading"
      hover
      striped
      border
      pagination
    >
      <template #no-items-view
        ><div class="text-center">ไม่พบข้อมูล</div>
      </template>
      <template #modifiedAt="{ item }">
        <td>
          {{ new Date(item.modifiedAt).toLocaleDateString() }}
          {{ new Date(item.modifiedAt).toLocaleTimeString() }}
        </td>
      </template>
      <template #actions="{ item }">
        <td>
          <CButton color="danger" @click="removeFile(item.id, item.name)"
            >ลบ</CButton
          >
        </td>
      </template>
    </CDataTable>
    <hr />
    <div class="row">
      <label class="col-sm-3">อัปโหลดไฟล์</label>
      <input
        type="file"
        class="col-sm-9"
        ref="fileInput"
        multiple
        @change="uploadHandler"
      />
    </div>
    <!-- uploaded files -->
    <CDataTable
      :items="newFiles"
      :fields="fields"
      :items-per-page="5"
      :itemsPerPageSelect="{
        label: 'แสดง',
      }"
      :tableFilter="{
        label: 'ค้นหา: ',
        placeholder: 'ค้นหา',
      }"
      :loading="loading"
      hover
      striped
      border
      pagination
    >
      <template #no-items-view
        ><div class="text-center">ไม่พบข้อมูล</div>
      </template>
      <template #modifiedAt>
        <td>
          {{ new Date().toLocaleDateString() }}
          {{ new Date().toLocaleTimeString() }}
        </td>
      </template>
      <template #actions="{ index }">
        <td>
          <CButton color="danger" @click="newFiles.splice(index, 1)"
            >ลบ</CButton
          >
        </td>
      </template>
    </CDataTable>

    <CButton
      block
      color="primary"
      :disabled="loading || newFiles.length == 0"
      @click="uploadNewFiles()"
      >อัปโหลด</CButton
    >
  </div>
</template>

<script>
export default {
  props: {
    id: {
      type: String,
      default: "",
    },
  },
  async created() {
    this.files = await this.getFiles(this.id);
  },
  data() {
    return {
      files: [],

      newFiles: [],

      fields: [
        { key: "name", label: "ชื่อไฟล์", _style: "width:60%" },
        { key: "modifiedAt", label: "วันที่", _style: "width:30%;" },
        { key: "actions", label: "", _style: "width:10%;" },
      ],

      loading: false,
    };
  },
  methods: {
    async getFiles(id) {
      try {
        var hasMoreItems = false;
        const maxItems = 1000;
        var skipCount = 0;
        var arr = [];

        this.loading = true;
        do {
          const res = await this.$http.get(
            `${process.env.VUE_APP_ALFRESCO_API}alfresco/versions/1/nodes/${id}/children?maxItems=${maxItems}&skipCount=${skipCount}&include=properties,allowableOperations`
          );
          arr.push(...res.data.list.entries.map((item) => item.entry));

          hasMoreItems = res.data.list.pagination.hasMoreItems;
          skipCount += maxItems;

          if (res.data.list.pagination.count <= 0) {
            hasMoreItems = false;
          }
        } while (hasMoreItems);
        this.loading = false;
        return arr;
      } catch (error) {
        this.loading = false;
      }
    },
    removeFile(id, name = "") {
      this.$http
        .delete(
          `${process.env.VUE_APP_ALFRESCO_API}alfresco/versions/1/nodes/${id}`
        )
        .then(async () => {
          this.lineNotify(`เอกสารชื่อ "${name}" ถูกลบ`);
          this.sendMail(
            this.$store.state.user.email,
            `<p>เอกสารชื่อ "${name}" ถูกลบ</p>`,
            "เอกสรถูกลบ"
          );
          this.files = await this.getFiles(this.id);
        });
    },
    uploadHandler(event) {
      this.newFiles.push(...event.currentTarget.files);
    },
    upload(file) {
      let formData = new FormData();
      formData.append("filedata", file);
      return this.$http.post(
        `${process.env.VUE_APP_ALFRESCO_API}alfresco/versions/1/nodes/${this.id}/children?autoRename=true`,
        formData
      );
    },
    uploadNewFiles() {
      this.loading = true;
      this.newFiles.forEach(async (item, index) => {
        await this.upload(item);
        if (index == this.newFiles.length - 1) {
          this.lineNotify(`มีการนำเข้าเอกสาร ${this.newFiles.length} รายการ`);
          this.sendMail(
            this.$store.state.user.email,
            `<p>มีการนำเข้าเอกสาร ${this.newFiles.length} รายการ</p>`,
            "มีการนำเข้าเอกสาร"
          );
          this.files = await this.getFiles(this.id);
          this.newFiles = [];

          this.loading = false;
        }
      });
    },
    lineNotify(message) {
      this.$http({
        method: "POST",
        url: `${process.env.VUE_APP_PDPA_SERVICES}notify/line`,
        data: { message },
        headers: {
          Authorization: "Bearer eofn4Su4ULh2TesoPMAjkSIrYK5ycQNq4dAM1odu7Zi",
        },
      });
    },
    sendMail(to, html, subject = "") {
      this.$http.post(`${process.env.VUE_APP_PDPA_SERVICES}notify/mail`, {
        from: "jrk-crm@jorakay.co.th",
        to: to,
        subject: subject,
        html,
      });
    },
  },
};
</script>