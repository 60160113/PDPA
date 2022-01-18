<template>
  <div>
    <!-- Widget -->
    <CRow>
      <CCol :key="index" v-for="(item, index) in statusList" md="3" sm="12">
        <CWidgetIcon
          :header="total[item.value]"
          :text="item.label"
          :color="item.color"
        >
          <CIcon :name="item.icon" width="24" />
        </CWidgetIcon>
      </CCol>
    </CRow>

    <!-- Chart -->
    <CCard>
      <CCardHeader>
        <strong class="text-primary">
          แผนภูมิการร้องขอข้อมูลในปี {{ new Date().getFullYear() }}
        </strong>
        <CSelect
          class="float-right mb-0"
          size="sm"
          :value.sync="status"
          :options="
            statusList.map((item) => {
              return {
                value: item.value,
                label: item.label,
              };
            })
          "
          custom
        />
      </CCardHeader>
      <CCardBody>
        <CChartBar
          style="height: 400px"
          :datasets="[
            {
              data: chartData[status],
              backgroundColor: '#4638c2',
              label: 'Request',
            },
          ]"
          labels="months"
          :options="{
            maintainAspectRatio: false,
            scales: {
              yAxes: [
                {
                  ticks: {
                    stepSize: 1,
                  },
                },
              ],
            },
          }"
        />
      </CCardBody>
    </CCard>

    <CCard>
      <CCardHeader>
        <strong class="text-primary">รายการการร้องขอ</strong>
      </CCardHeader>

      <CCardBody>
        <CDataTable
          :items="requests"
          :fields="[
            { key: 'name', label: 'ชื่อคำร้อง', _style: 'width:20%' },
            { key: 'reason', label: 'เหตุผล', _style: 'width:20%' },
            { key: 'requesterName', label: 'ผู้ร้องขอ', _style: 'width:25%' },
            { key: 'createdAt', label: 'วันที่ร้องขอ', _style: 'width:15%' },
            { key: 'expiredIn', label: 'กำหนดการ', _style: 'width:5%' },
            { key: 'status', label: 'สถานะ', _style: 'width:15%' },
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

    <CElementCover :opacity="0.7" v-show="loading" />
  </div>
</template>

<script>
import { CChartBar } from "@coreui/vue-chartjs";

export default {
  components: {
    CChartBar,
  },
  created() {
    this.getStatus();
  },
  data() {
    return {
      total: {
        pending: "",
        approved: "",
        disapproved: "",
        expired: "",
      },

      status: "pending",

      requests: [],

      statusList: [],

      chartData: {},

      loading: false,
    };
  },
  methods: {
    getRequests() {
      this.loading = true;
      this.$http
        .get(`${process.env.VUE_APP_PDPA_SERVICES}data/request`)
        .then((res) => {
          // table
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

          // widget
          this.statusList.forEach((item) => {
            this.total[item.value] = res.data
              .filter((element) => element.status == item.value)
              .length.toString();
          });

          // chart
          const currentYearData = res.data.filter(
            (item) =>
              new Date(item.createdAt).getFullYear() == new Date().getFullYear()
          );

          const months = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

          let group = currentYearData.reduce((r, a) => {
            r[a.status] = [...(r[a.status] || []), a];
            return r;
          }, {});

          Object.keys(group).forEach((key) => {
            this.chartData[key] = months.map((item, index) => {
              return group[key].filter(
                (element) => new Date(element.createdAt).getMonth() == index
              ).length;
            });
          });

          this.loading = false;
        })
        .catch((err) => {
          this.loading = false;
        });
    },
    getStatus() {
      this.loading = true;
      this.$http
        .get(`${process.env.VUE_APP_PDPA_SERVICES}data/status`)
        .then((res) => {
          this.statusList = res.data;
          this.getRequests();
        });
    },
  },
};
</script>