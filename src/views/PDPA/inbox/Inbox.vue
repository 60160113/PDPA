<template>
  <div>
    <CCard>
      <CCardHeader>
        <strong class="text-primary">รายการที่ถูกร้องขอ</strong>
      </CCardHeader>
      <CCardBody>
        <CDataTable
          :items="requests"
          :fields="[
            { key: 'name', label: 'Name', _style: 'width:25%' },
            { key: 'requesterName', label: 'Requester', _style: 'width:25%' },
            { key: 'createdAt', label: 'Created At', _style: 'width:15%' },
            { key: 'expiredAt', label: 'Deadline', _style: 'width:15%' },
            { key: 'status', label: 'Status', _style: 'width:10%' },
            { key: 'action', label: 'Action', _style: 'width:10%' },
          ]"
          :tableFilter="{
            label: 'ค้นหา: ',
            placeholder: 'ค้นหา',
          }"
          pagination
          :items-per-page="5"
          :itemsPerPageSelect="{
            label: 'แสดง',
          }"
          :loading="loading"
          hover
          striped
          border
        >
          <template #no-items-view
            ><div class="text-center">ไม่พบข้อมูล</div>
          </template>

          <template #name="{ item }">
            <td>
              {{ item.name }}
              <br /><br />
              <b>เหตุผล: </b
              >{{ item.reason ? item.reason : "-" }}
            </td>
          </template>

          <template #createdAt="{ item }">
            <td>
              {{ new Date(item.createdAt).toLocaleDateString() }}
              {{ new Date(item.createdAt).toLocaleTimeString() }}
            </td>
          </template>

          <template #expiredAt="{ item }">
            <td>
              {{ new Date(item.expiredAt).toLocaleDateString() }}
              {{ new Date(item.expiredAt).toLocaleTimeString() }}
            </td>
          </template>

          <template #status="{ item }">
            <td>
              <CBadge
                shape="pill"
                :color="
                  statusList.filter((e) => e.value == item.status)[0].color
                "
                style="font-size: 12px"
              >
                {{
                  statusList.filter((e) => e.value == item.status)[0].label
                }}</CBadge
              >
            </td>
          </template>

          <template #action="{ item }">
            <td>
              <CButton
                color="success"
                @click="
                  selectedItem = item.folder;
                  modal = true;
                "
                >ดำเนินการ</CButton
              >
            </td>
          </template>
        </CDataTable>
      </CCardBody>
    </CCard>

    <CModal
      :show.sync="modal"
      :no-close-on-backdrop="true"
      :centered="true"
      title="อัปโหลดไฟล์"
      size="lg"
      color="primary"
    >
      <div class="row">
        <label class="col-sm-3">อัปโหลดไฟล์</label>
        <input
          type="file"
          class="col-sm-9"
          ref="fileInput"
          @change="uploadHandler"
        />
      </div>
      <template #footer>
        <CButton @click="modal = false" color="danger"> ยกเลิก </CButton>
        <CButton
          @click="upload()"
          color="success"
          :disabled="file == null ? true : false"
        >
          ตกลง
        </CButton>
      </template>
      <CElementCover :opacity="0.8" v-show="loading" style="z-index: 9999" />
    </CModal>
  </div>
</template>

<script>
export default {
  created() {
    this.getStatus();
    this.getRequests();
  },
  watch: {
    modal: function (val) {
      if (!val) {
        this.file = null;
        this.$refs["fileInput"].value = null;
      }
    },
  },
  data() {
    return {
      requests: [],

      statusList: [],

      loading: false,

      selectedItem: null,

      file: null,

      modal: false,
    };
  },
  methods: {
    getStatus() {
      this.loading = true;
      this.$http
        .get(`${process.env.VUE_APP_PDPA_SERVICES}data/status`)
        .then((res) => {
          this.statusList = res.data;
        });
    },
    getRequests() {
      this.loading = true;
      this.$http({
        method: "get",
        url: `${process.env.VUE_APP_PDPA_SERVICES}data/request`,
        params: {
          status: "approved",
        },
      })
        .then((res) => {
          this.requests = res.data.map((item) => {
            item.requesterName = item.requester.name;
            return item;
          });
          this.loading = false;
        })
        .catch((err) => {
          this.loading = false;
        });
    },
    uploadHandler() {
      this.file = event.currentTarget.files[0];
    },
    async upload() {
      try {
        this.loading = true;
        // upload
        let formData = new FormData();
        formData.append("filedata", this.file);
        await this.$http.post(
          `${process.env.VUE_APP_ALFRESCO_API}alfresco/versions/1/nodes/${this.selectedItem}/children?autoRename=true`,
          formData
        );
        this.modal = false;
        this.loading = false;
        this.getRequests();
      } catch (error) {
        this.modal = false;
      }
    },
  },
};
</script>