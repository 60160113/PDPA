<template>
  <div>
    <CRow>
      <CCol lg="2" md="3" sm="12">
        <CCard>
          <CCardHeader>
            <strong class="text-primary">Status</strong>
          </CCardHeader>
          <CCardBody>
            <CInputCheckbox
              custom
              name="status"
              class="mb-2"
              :key="index"
              v-for="(item, index) in status"
              :label="item.charAt(0).toUpperCase() + item.slice(1)"
              :value="item"
              :checked="statusFilter.indexOf(item) != -1"
              @update:checked="filter(item)"
            />
          </CCardBody>
        </CCard>
      </CCol>
      <CCol>
        <CCard>
          <CCardHeader>
            <strong class="text-primary">อนุมัติการร้องขอ</strong>
          </CCardHeader>

          <CCardBody>
            <CDataTable
              :items="tableRecords"
              :fields="[
                { key: 'name', label: 'Name', _style: 'width:25%' },
                { key: 'requester', label: 'Requester', _style: 'width:20%' },
                { key: 'consents', label: 'Consents', _style: 'width:20%' },
                { key: 'createdAt', label: 'Created At', _style: 'width:15%' },
                { key: 'statusLabel', label: 'Status', _style: 'width:5%' },
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
                  <p class="text-primary">{{ item.data.name }}</p>
                  <span v-if="item.publish.isPublished">
                    Link:
                    <CLink
                      :href="getSharedURL(item.publish.id).href"
                      target="_blank"
                    >
                      {{ getSharedURL(item.publish.id).label }}
                    </CLink>
                  </span>
                </td>
              </template>

              <template #requester="{ item }">
                <td>
                  {{ item.requester.name }}
                </td>
              </template>

              <template #consents="{ item }">
                <td>
                  <ul
                    :key="index"
                    v-for="(consent, index) in item.consents"
                    style="line-height: 80%"
                  >
                    <li>{{ consent }}</li>
                  </ul>
                </td>
              </template>

              <template #createdAt="{ item }">
                <td>
                  {{ new Date(item.createdAt).toLocaleDateString() }}
                  {{ new Date(item.createdAt).toLocaleTimeString() }}
                </td>
              </template>

              <template #statusLabel="{ item }">
                <td>
                  <CBadge style="font-size: 15px" :color="item.statusColor">
                    {{ item.statusLabel }}
                  </CBadge>
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
      </CCol>
    </CRow>

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

      status: ["pending", "approved", "disapproved", "expired"],
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
        .get(`${process.env.VUE_APP_PDPA_SERVICES}personal_data`)
        .then((res) => {
          this.requests = res.data.map((item) => {
            const statusData = this.getStatusBadgeStyle(item.status);
            item.statusLabel = statusData.label;
            item.statusColor = statusData.color;

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
        .put(`${process.env.VUE_APP_PDPA_SERVICES}personal_data/${id}`, {
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
          `${process.env.VUE_APP_PDPA_SERVICES}publish_data/${item["_id"]}`,
          {
            data: item.data,
            requester: item.requester,
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
      const href = `/#/property/${id}`;
      return { label: `${window.location.host}${href}`, href };
    },
    getStatusBadgeStyle(status) {
      switch (status) {
        case "pending":
          return { color: "primary", label: "รออนุมัติ" };
        case "approved":
          return { color: "success", label: "อนุมัติ" };
        case "disapproved":
          return { color: "danger", label: "ไม่อนุมัติ" };
        case "expired":
          return { color: "dark", label: "หมดอายุ" };
        default:
          return { color: "secondary", label: status || "unknown" };
      }
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