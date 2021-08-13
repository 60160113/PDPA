<template>
  <div>
    <CCard>
      <CCardHeader>
        <strong class="text-primary"
          >รายการที่ถูกร้องขอมายัง {{ $store.state.user.displayName }}</strong
        >
      </CCardHeader>
      <CCardBody>
        <CDataTable
          :items="requests"
          :fields="[
            { key: 'name', label: 'Name', _style: 'width:25%' },
            {
              key: 'requesterName',
              label: 'Requester',
              _style: 'width:20%',
            },
            { key: 'createdAt', label: 'Created At', _style: 'width:15%' },
            { key: 'responseLabel', label: 'Response', _style: 'width:15%' },
            { key: 'action', label: 'Action', _style: 'width:15%' },
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
              <b>{{ item.name }}</b>
            </td>
          </template>

          <template #createdAt="{ item }">
            <td>
              {{ new Date(item.createdAt).toLocaleDateString() }}
              {{ new Date(item.createdAt).toLocaleTimeString() }}
            </td>
          </template>

          <template #action="{ item }">
            <td>
              <CButton
                color="success"
                @click="
                  selectedItem = item;
                  modal = {
                    title: 'ดำเนินการ',
                    color: 'primary',
                    id: 'accept',
                    show: true,
                  };
                "
                :disabled="item.response != 'pending'"
                >ดำเนินการ</CButton
              >&nbsp;
              <CButton
                color="danger"
                @click="
                  selectedItem = item['_id'];
                  modal = {
                    title: 'ปฏิเสธ',
                    color: 'danger',
                    id: 'reject',
                    show: true,
                  };
                "
                :disabled="item.response != 'pending'"
                >ปฏิเสธ</CButton
              >
            </td>
          </template>
        </CDataTable>
      </CCardBody>
    </CCard>

    <CModal
      :show.sync="modal.show"
      :no-close-on-backdrop="true"
      :centered="true"
      :title="modal.title"
      size="lg"
      :color="modal.color"
    >
      <div v-if="modal.id == 'reject'">
        คุณต้องการลบรายการที่เลือกนี้หรือไม่ ?
      </div>
      <div v-else class="row">
        <label class="col-sm-3">อัปโหลดไฟล์</label>
        <input
          type="file"
          class="col-sm-9"
          ref="fileInput"
          @change="uploadHandler"
        />
      </div>
      <template #footer>
        <CButton @click="modal.show = false" color="danger"> ยกเลิก </CButton>
        <CButton
          @click="modal.id == 'reject' ? rejectRequest() : acceptRequest()"
          color="success"
          :disabled="
            modal.id == 'accept' ? (file == null ? true : false) : false
          "
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
    this.getRequests();
  },
  watch: {
    "modal.show": function (val) {
      if (!val) {
        this.file = null;
        this.$refs["fileInput"].value = null;
      }
    },
  },
  data() {
    return {
      requests: [],

      loading: false,

      selectedItem: null,

      file: null,

      modal: {
        title: "",
        color: "primary",
        show: false,
        id: "",
      },
    };
  },
  methods: {
    getRequests() {
      this.loading = true;
      this.$http({
        method: "get",
        url: `${process.env.VUE_APP_PDPA_SERVICES}data/request_data`,
        params: {
          "assignTo.id": this.$store.state.user.userId,
        },
      })
        .then((res) => {
          this.requests = res.data.map((item) => {
            item.requesterName = item.requester.name;

            item.response = item.assignTo.filter(
              (value) => value.id == this.$store.state.user.userId
            )[0].response;

            switch (item.response) {
              case "pending":
                item.responseLabel = "ยังไม่ได้ดำเนินการ";
                break;
              case "reject":
                item.responseLabel = "ปฏิเสธ";
                break;

              default:
                item.responseLabel = "ดำเนินการ";
                break;
            }

            return item;
          });
          this.loading = false;
        })
        .catch((err) => {
          this.loading = false;
        });
    },
    rejectRequest() {
      this.loading = true;
      this.$http
        .put(`${process.env.VUE_APP_PDPA_SERVICES}data/request_data`, {
          condition: {
            _id: this.selectedItem,
            "assignTo.id": this.$store.state.user.userId,
          },
          data: {
            $set: {
              "assignTo.$.response": "reject",
            },
          },
        })
        .then(() => {
          this.modal.show = false;
          this.loading = false;
          this.getRequests();
        });
    },
    uploadHandler() {
      this.file = event.currentTarget.files[0];
    },
    async acceptRequest() {
      try {
        this.loading = true;
        // upload
        let formData = new FormData();
        formData.append("filedata", this.file);
        await this.$http.post(
          `${process.env.VUE_APP_ALFRESCO_API}alfresco/versions/1/nodes/${this.selectedItem.folder}/children?autoRename=true`,
          formData
        );

        // update
        await this.$http.put(
          `${process.env.VUE_APP_PDPA_SERVICES}data/request_data`,
          {
            condition: {
              _id: this.selectedItem["_id"],
              "assignTo.id": this.$store.state.user.userId,
            },
            data: {
              $set: {
                "assignTo.$.response": "accept",
              },
            },
          }
        );
        this.modal.show = false;
        this.loading = false;
        this.getRequests();
      } catch (error) {
        this.modal.show = false;
      }
    },
  },
};
</script>