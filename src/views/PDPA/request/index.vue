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
            { key: 'name', label: 'Name', _style: 'width:25%' },
            { key: 'createdAt', label: 'Created At', _style: 'width:15%' },
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
              <CButton
                color="primary"
                shape="pill"
                @click="
                  component = 'RequestData';
                  modal = true;
                "
              >
                <CIcon name="cil-phone" />
                ร้องขอข้อมูล</CButton
              >&nbsp;
              <CButton
                color="primary"
                shape="pill"
                @click="
                  component = 'RequestTo';
                  modal = true;
                "
              >
                <CIcon name="cil-people" />
                ร้องขอข้อมูลจากพนักงาน
              </CButton>
            </div>
          </template>

          <template #name="{ item }">
            <td>
              <b>{{ item.name }}</b>

              <ul class="mt-2" v-if="item.type == 'regular'">
                <li :key="i" v-for="(element, i) in item.documents">
                  {{ element.parent.name }} : {{ element.name }}
                </li>
              </ul>

              <ul class="mt-2" v-else>
                <li :key="i" v-for="(element, i) in item.assignTo">
                  {{ element.displayName }} : {{ element.response }}
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
      <component
        :is="component"
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
import RequestData from "@/views/PDPA/request/RequestData";

import RequestTo from "@/views/PDPA/request/RequestTo";

export default {
  components: {
    RequestData,
    RequestTo,
  },
  created() {
    this.getRequest();
  },
  data() {
    return {
      requests: [],

      loading: false,

      modal: false,

      component: "",
    };
  },
  methods: {
    getRequest() {
      this.loading = true;
      this.$http
        .get(
          `${process.env.VUE_APP_PDPA_SERVICES}data/request_data?requester.id=${this.$store.state.user.userId}`
        )
        .then((res) => {
          this.requests = res.data;
          this.loading = false;
        })
        .catch((err) => {
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
};
</script>