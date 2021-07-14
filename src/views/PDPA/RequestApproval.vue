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
            { key: 'name', label: 'Name', _style: 'width:25%' },
            { key: 'requester', label: 'Requester', _style: 'width:20%' },
            { key: 'consents', label: 'Consents', _style: 'width:20%' },
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
              <p class="text-primary">{{ item.data.name }}</p>
              <span v-if="item.publish.isPublished">
                Link:
                <CLink :href="getSharedURL(item.publish.id).href" target="_blank">
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

          <template #createdAt="{ item }">
            <td>
              {{ new Date(item.createdAt).toLocaleDateString() }}
              {{ new Date(item.createdAt).toLocaleTimeString() }}
            </td>
          </template>

          <template #status="{ item }">
            <td>
              <CBadge
                style="font-size: 15px"
                :color="item.publish.isPublished ? 'success' : 'primary'"
              >
                {{ item.publish.isPublished ? "อนุมัติ" : "รออนุมัติ" }}
              </CBadge>
            </td>
          </template>

          <template #actions="{ item }">
            <td>
              <CButton
                color="success"
                :disabled="item.publish.isPublished"
                @click="approveRequest(item)"
              >
                อนุมัติ </CButton
              >&nbsp;
              <CButton color="danger" @click="removeRequest(item['_id'])">
                ไม่อนุมัติ
              </CButton>
            </td>
          </template>
        </CDataTable>
      </CCardBody>
    </CCard>
  </div>
</template>

<script>
export default {
  created() {
    this.getRequests();
  },
  data() {
    return {
      requests: [],

      loading: false,
    };
  },
  methods: {
    getRequests() {
      this.loading = true;
      this.$http
        .get(`${process.env.VUE_APP_PDPA_SERVICES}personal_data`)
        .then((res) => {
          this.requests = res.data;
          this.loading = false;
        });
    },
    removeRequest(id) {
      this.$http
        .delete(`${process.env.VUE_APP_PDPA_SERVICES}personal_data/${id}`)
        .then(() => {
          this.getRequests();
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
          }
        )
        .then(() => {
          this.getRequests();
          this.loading = false;
        });
    },
    getSharedURL(id) {
      const href = `/#/property/${id}`;
      return { label: `${window.location.host}${href}`, href };
    },
  },
};
</script>