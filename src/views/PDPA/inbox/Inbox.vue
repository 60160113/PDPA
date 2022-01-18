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
            { key: 'name', label: 'ชื่อคำร้อง', _style: 'width:25%' },
            { key: 'reason', label: 'เหตุผล', _style: 'width:25%' },
            { key: 'requesterName', label: 'ผู้ร้องขอ', _style: 'width:15%' },
            { key: 'createdAt', label: 'วันที่ร้องขอ', _style: 'width:15%' },
            { key: 'expiredIn', label: 'กำหนดการ', _style: 'width:5%' },
            { key: 'action', label: '', _style: 'width:15%' },
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
      <FilesTable :id="selectedItem" v-if="selectedItem && modal" />
      <template #footer>
        <CButton @click="modal = false" color="secondary"> ปิด </CButton>
      </template>
      <CElementCover :opacity="0.8" v-show="loading" style="z-index: 9999" />
    </CModal>
  </div>
</template>

<script>
import FilesTable from "@/views/PDPA/inbox/FilesTable.vue";
export default {
  components: {
    FilesTable,
  },
  created() {
    this.getRequests();
  },
  data() {
    return {
      requests: [],

      loading: false,

      selectedItem: null,

      modal: false,
    };
  },
  methods: {
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

            const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
            const today = new Date();
            const expiredAt = new Date(item.expiredAt);

            const difference =
              expiredAt > today
                ? Math.abs(expiredAt.getTime() - today.getTime())
                : 0;

            item.expiredIn = Math.ceil(difference / oneDay);
            return item;
          });
          this.loading = false;
        })
        .catch((err) => {
          this.loading = false;
        });
    },
  },
};
</script>