<template>
  <div>
    <CCard>
      <CCardHeader>
        <strong class="text-primary"
          >รายการการร้องขอข้อมูลของ {{ $store.state.user.displayName }}</strong
        >
      </CCardHeader>
      <CCardBody>
        <CDataTable
          :items="requests"
          :fields="[
            { key: 'name', label: 'Name', _style: 'width:50%' },
            { key: 'createdAt', label: 'Created At', _style: 'width:15%' },
            { key: 'expiredIn', label: 'Deadline', _style: 'width:15%' },
            { key: 'status', label: 'Status', _style: 'width:5%' },
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
          <template #over-table>
            <div style="margin-bottom: 10px">
              <CButton color="primary" shape="pill" @click="modal = true">
                <CIcon name="cil-people" />
                ร้องขอข้อมูล
              </CButton>
            </div>
          </template>

          <template #name="{ item }">
            <td>
              {{ item.name }}
              <br /><br />
              <b>เหตุผล: </b>{{ item.reason ? item.reason : "-" }}
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
        </CDataTable>
      </CCardBody>
    </CCard>

    <CModal
      :show.sync="modal"
      :no-close-on-backdrop="true"
      :centered="true"
      size="xl"
      color="primary"
    >
      <request
        :onComplete="
          () => {
            getRequest();
            modal = false;
          }
        "
      />
      <template #header>
        <h6 class="modal-title">ร้องขอข้อมูล</h6>
        <CButtonClose @click="modal = false" class="text-white" />
      </template>
      <template #footer>
        <CButton @click="modal = false" color="secondary">ปิด</CButton>
      </template>
    </CModal>
  </div>
</template>

<script>
import request from "@/views/PDPA/request/Request";

export default {
  components: {
    request,
  },
  created() {
    this.getStatus().then((res) => {
      this.statusList = res.data;

      this.getRequest();
    });
  },
  data() {
    return {
      requests: [],

      statusList: [],

      loading: false,

      modal: false,
    };
  },
  methods: {
    getRequest() {
      this.loading = true;
      this.$http
        .get(
          `${process.env.VUE_APP_PDPA_SERVICES}data/request?requester.id=${this.$store.state.user.userId}`
        )
        .then((res) => {
          this.requests = res.data.map((item) => {
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
    getStatus() {
      return this.$http.get(`${process.env.VUE_APP_PDPA_SERVICES}data/status`);
    },
  },
};
</script>