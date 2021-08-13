<template>
  <div>
    <CCard>
      <CCardHeader>
        <strong class="text-primary">อนุมัติการร้องขอ</strong>
      </CCardHeader>

      <CCardBody>
        <CDataTable
          :items="tableRecords"
          :fields="[
            { key: 'name', label: 'Name', _style: 'width:30%' },
            {
              key: 'requesterName',
              label: 'Requester',
              _style: 'width:15%',
            },
            { key: 'createdAt', label: 'Created At', _style: 'width:15%' },
            { key: 'status', label: 'Status', _style: 'width:5%' },
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
              <b>{{ item.name }}</b>

              <ul class="mt-2">
                <li :key="i" v-for="(element, i) in item.documents">
                  {{ element.parent.name }} : {{ element.name }}
                </li>
              </ul>

              <div v-if="item.folder" class="mt-2">
                <CLink :href="getSharedURL(item.folder)" target="_blank">
                  Link
                </CLink>
              </div>
            </td>
          </template>

          <template #createdAt="{ item }">
            <td>
              {{ new Date(item.createdAt).toLocaleDateString() }}
              {{ new Date(item.createdAt).toLocaleTimeString() }}
            </td>
          </template>

          <template #actions="{ item }">
            <td>
              <CButton
                color="success"
                :disabled="item.status !== 'pending'"
                @click="
                  selectedItem = item;
                  approvedModal = true;
                "
              >
                อนุมัติ </CButton
              >&nbsp;
              <CButton
                color="danger"
                :disabled="item.status !== 'pending'"
                @click="
                  selectedItem = item;
                  disapprovedModal = true;
                "
              >
                ไม่อนุมัติ
              </CButton>
            </td>
          </template>
        </CDataTable>
      </CCardBody>
    </CCard>

    <!-- ไม่อนุมัติ -->
    <CModal
      :show.sync="disapprovedModal"
      :no-close-on-backdrop="true"
      :centered="true"
      title="ไม่อนุมัติ"
      size="lg"
      color="danger"
    >
      คุณต้องการลบรายการที่เลือกนี้หรือไม่ ?
      <template #footer>
        <CButton @click="disapprovedModal = false" color="danger">
          ยกเลิก
        </CButton>
        <CButton
          @click="disapproveRequest(selectedItem['_id'])"
          color="success"
        >
          ตกลง
        </CButton>
      </template>
    </CModal>

    <!-- อนุมัติ -->
    <CModal
      :show.sync="approvedModal"
      :no-close-on-backdrop="true"
      :centered="true"
      title="อนุมัติ"
      size="lg"
      color="primary"
    >
      <CRow>
        <CCol col="2">
          <label style="margin-top: 6px">วันหมดอายุ: </label>
        </CCol>
        <CCol>
          <v-date-picker
            :min-date="disabledDate"
            mode="date"
            :masks="{
              input: 'DD/MM/YYYY',
            }"
            v-model="expiredAt"
          />
        </CCol>
      </CRow>

      <template #footer>
        <CButton
          :disabled="loading"
          @click="approvedModal = false"
          color="danger"
        >
          ยกเลิก
        </CButton>
        <CButton
          :disabled="!expiredAt || loading"
          @click="approveRequest(selectedItem)"
          color="success"
        >
          ตกลง
        </CButton>
      </template>
      <CElementCover :opacity="0.8" v-show="loading" />
    </CModal>
  </div>
</template>

<script>
import { DatePicker } from "v-calendar";

export default {
  components: {
    "v-date-picker": DatePicker,
  },
  created() {
    this.expiredAt.setDate(this.expiredAt.getDate() + 7);
    this.getRequests();
  },
  data() {
    return {
      requests: [],

      loading: false,

      disapprovedModal: false,
      approvedModal: false,

      selectedItem: null,

      expiredAt: new Date(),

      statusOption: [
        { label: "รออนุมัติ", value: "pending" },
        { label: "อนุมัติ", value: "approved" },
        { label: "ไม่อนุมัติ", value: "disapproved" },
        { label: "หมดอายุ", value: "expired" },
      ],
      statusFilter: ["pending", "approved", "disapproved", "expired"],
    };
  },
  methods: {
    filter(status) {
      const index = this.statusFilter.indexOf(status);
      index !== -1
        ? this.statusFilter.splice(index, 1)
        : this.statusFilter.push(status);
    },
    getRequests() {
      this.loading = true;
      this.$http
        .get(
          `${process.env.VUE_APP_PDPA_SERVICES}data/request_data?type=regular`
        )
        .then((res) => {
          this.requests = res.data.map((item) => {
            item.requesterName = item.requester.name;

            return item;
          });
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },
    disapproveRequest(id) {
      this.$http
        .put(`${process.env.VUE_APP_PDPA_SERVICES}data/request_data/${id}`, {
          status: "disapproved",
        })
        .then(() => {
          this.getRequests();

          this.disapprovedModal = false;
        });
    },
    approveRequest(item) {
      this.loading = true;
      this.$http
        .post(
          `${process.env.VUE_APP_PDPA_SERVICES}request_data/publish/${item["_id"]}`,
          {
            expiredAt: this.expiredAt,
          }
        )
        .then(() => {
          this.getRequests();

          this.approvedModal = false;
          this.loading = false;
        });
    },
    getSharedURL(id) {
      const routeData = this.$router.resolve({
        name: "Repository",
        query: { id },
      });
      return routeData.href;
    },
  },
  computed: {
    disabledDate() {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    },
    tableRecords() {
      return this.requests.filter((item) => {
        return this.statusFilter.includes(item.status);
      });
    },
  },
};
</script>