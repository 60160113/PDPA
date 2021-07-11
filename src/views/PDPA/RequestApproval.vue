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
            { key: 'requester', label: 'Requester', _style: 'width:20%' },
            { key: 'consents', label: 'Consents', _style: 'width:20%' },
            { key: 'createdAt', label: 'Created At', _style: 'width:15%' },
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

          <template #actions="{ item }">
            <td>
              <CButton color="success" @click="approveRequest(item)"> อนุมัติ </CButton>&nbsp;
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
    };
  },
  methods: {
    getRequests() {
      this.$http
        .get(`${process.env.VUE_APP_PDPA_SERVICES}personal_data`)
        .then((res) => {
          this.requests = res.data;
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
      this.$http
        .post(`${process.env.VUE_APP_PDPA_SERVICES}publish_data`, {
          data: item.data,
          requester: item.requester,
        })
        .then((res) => {
          console.log(res.data);
        });
    },
  },
};
</script>