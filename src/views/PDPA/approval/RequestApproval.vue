<template>
  <div>
    <CCard>
      <CCardHeader>
        <strong class="text-primary">อนุมัติการร้องขอ</strong>
      </CCardHeader>

      <CCardBody>
        <CDataTable
          :items="requests"
          :fields="[
            { key: 'name', label: 'Name', _style: 'width:30%' },
            {
              key: 'requesterName',
              label: 'Requester',
              _style: 'width:15%',
            },
            { key: 'createdAt', label: 'Created At', _style: 'width:15%' },
            { key: 'expiredAt', label: 'Deadline', _style: 'width:15%' },
            { key: 'status', label: 'Status', _style: 'width:10%' },
            { key: 'actions', label: 'Actions', _style: 'width:15%' },
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
          <template #no-items-view>
            <div class="text-center">ไม่พบข้อมูล</div>
          </template>

          <template #name="{ item }">
            <td>
              {{ item.name }}
              <br /><br />
              <b>Description: </b
              >{{ item.description ? item.description : "-" }}
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

          <template #actions="{ item }">
            <td>
              <CButton
                color="success"
                :disabled="item.status !== 'pending'"
                @click="
                  selectedRequest = { id: item._id, name: item.name };
                  isApproved = true;
                  modal = true;
                "
              >
                อนุมัติ </CButton
              >&nbsp;
              <CButton
                color="danger"
                :disabled="item.status !== 'pending'"
                @click="
                  selectedRequest = item._id;
                  isApproved = false;
                  modal = true;
                "
              >
                ไม่อนุมัติ
              </CButton>
            </td>
          </template>
        </CDataTable>
      </CCardBody>
    </CCard>

    <CModal
      :show.sync="modal"
      :no-close-on-backdrop="true"
      :centered="true"
      :title="isApproved ? 'อนุมัติ' : 'ไม่อนุมัติ'"
      size="lg"
      :color="isApproved ? 'success' : 'danger'"
    >
      คุณต้องการ{{ isApproved ? "" : "ไม่" }}อนุมัติรายการนี้หรือไม่ ?
      <template #footer>
        <CButton @click="modal = false" color="danger"> ยกเลิก </CButton>
        <CButton
          @click="
            isApproved
              ? approveRequest(selectedRequest)
              : disapproveRequest(selectedRequest)
          "
          color="success"
        >
          ตกลง
        </CButton>
      </template>
    </CModal>
  </div>
</template>

<script>
export default {
  created() {
    this.getStatus();
    this.getRequests();
  },
  data() {
    return {
      requests: [],
      statusList: [],

      loading: false,

      modal: false,

      isApproved: false,

      selectedRequest: null,
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
      this.$http
        .get(`${process.env.VUE_APP_PDPA_SERVICES}data/request`)
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
    disapproveRequest(id) {
      this.loading = true;
      this.$http
        .put(`${process.env.VUE_APP_PDPA_SERVICES}data/request/${id}`, {
          status: "disapproved",
        })
        .then(() => {
          this.getRequests();
          this.modal = false;
          this.loading = false;
        })
        .catch((err) => {
          this.loading = false;
        });
    },
    async approveRequest(item) {
      try {
        this.loading = true;

        const folder = await this.$http({
          method: "post",
          url: `${process.env.VUE_APP_ALFRESCO_API}alfresco/versions/1/nodes/${process.env.VUE_APP_PUBLISHED_DATA_FOLDER}/children?autoRename=true`,
          data: {
            name: item.name,
            nodeType: "cm:folder",
          },
        });

        await this.$http.put(
          `${process.env.VUE_APP_PDPA_SERVICES}data/request/${item.id}`,
          {
            status: "approved",
            folder: folder.data.entry.id,
          }
        );

        this.getRequests();
        this.modal = false;
        this.loading = false;

        this.loading = false;
      } catch (error) {
        this.loading = false;
      }
    },
  },
};
</script>