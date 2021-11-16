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
            { key: 'name', label: 'Name', _style: 'width:20%' },
            { key: 'reason', label: 'Reason', _style: 'width:20%' },
            {
              key: 'requesterName',
              label: 'Requester',
              _style: 'width:10%',
            },
            { key: 'createdAt', label: 'Created At', _style: 'width:15%' },
            { key: 'expiredIn', label: 'Deadline', _style: 'width:5%' },
            { key: 'status', label: 'Status', _style: 'width:10%' },
            { key: 'actions', label: 'Actions', _style: 'width:20%' },
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

          <template #reason="{ item }">
            <td>
              {{ item.reason ? item.reason : "-" }}
            </td>
          </template>

          <template #createdAt="{ item }">
            <td>
              {{ new Date(item.createdAt).toLocaleDateString() }}
              {{ new Date(item.createdAt).toLocaleTimeString() }}
            </td>
          </template>

          <template #expiredIn="{ item }">
            <td>{{ item.expiredIn }}&nbsp;วัน</td>
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
                  selectedRequest = {
                    id: item._id,
                    name: item.name,
                    requester: item.requesterName,
                  };
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
                  selectedRequest = {
                    id: item._id,
                    name: item.name,
                    requester: item.requesterName,
                  };
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
    this.getStatus().then((res) => {
      this.statusList = res.data;
      this.getRequests();
    });
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
      return this.$http.get(`${process.env.VUE_APP_PDPA_SERVICES}data/status`);
    },
    getRequests() {
      this.loading = true;
      this.$http
        .get(`${process.env.VUE_APP_PDPA_SERVICES}data/request`)
        .then((res) => {
          this.requests = res.data.map((item) => {
            item.requesterName = item.requester.name;

            const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
            const today = new Date();
            const expiredAt = new Date(item.expiredAt);

            const difference = Math.abs(expiredAt.getTime() - today.getTime());

            item.expiredIn = Math.ceil(difference / oneDay);
            return item;
          });
          this.loading = false;
        })
        .catch((err) => {
          this.loading = false;
        });
    },
    disapproveRequest(item) {
      this.loading = true;
      this.$http
        .put(`${process.env.VUE_APP_PDPA_SERVICES}data/request/${item.id}`, {
          status: "disapproved",
        })
        .then(() => {
          this.getRequests();
          this.lineNotify(
            `การร้องขอ "${item.name}" ของคุณ ${item.requester} ไม่ได้รับการอนุมัติ`
          );
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
            name: `${item.name}_${item.requester}_${
              new Date().toISOString().split("T")[0]
            }`,
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
        this.lineNotify(
          `การร้องขอ "${item.name}" ของคุณ ${item.requester} ได้รับการอนุมัติ`
        );
        this.getRequests();
        this.modal = false;
        this.loading = false;

        this.loading = false;
      } catch (error) {
        this.loading = false;
      }
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
  },
};
</script>