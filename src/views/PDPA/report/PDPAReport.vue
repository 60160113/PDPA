<template>
  <div>
    <!-- Widget -->
    <CRow>
      <CCol :key="index" v-for="(item, index) in statusFields" md="3" sm="12">
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
          Requests in {{ new Date().getFullYear() }}
        </strong>
        <CSelect
          class="float-right mb-0"
          size="sm"
          :value.sync="status"
          :options="
            statusFields.map((item) => {
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
    this.getRequests();
  },
  data() {
    return {
      total: {
        pending: "",
        approved: "",
        disapproved: "",
        expired: "",
      },

      statusFields: [
        {
          value: "pending",
          label: "รออนุมัติ",
          color: "gradient-primary",
          icon: "cil-media-pause",
        },
        {
          value: "approved",
          label: "อนุมัติ",
          color: "gradient-success",
          icon: "cil-check-circle",
        },
        {
          value: "disapproved",
          label: "ไม่อนุมัติ",
          color: "gradient-danger",
          icon: "cil-x-circle",
        },
        {
          value: "expired",
          label: "หมดอายุ",
          color: "gradient-dark",
          icon: "cil-clock",
        },
      ],

      status: "pending",

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
          // widget
          this.statusFields.forEach((item) => {
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
  },
};
</script>