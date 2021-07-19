<template>
  <div>
    <!-- Widget -->
    <CRow>
      <CCol :key="index" v-for="(item, index) in statusFields">
        <CWidgetIcon
          :header="total[item.label]"
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
        {{ status }}
        <CSelect
          class="float-right mb-0"
          size="sm"
          :value.sync="status"
          :options="statusFields.map((item) => item.label)"
          custom
        />
      </CCardHeader>
      <CCardBody>
        <CChartBar
          style="height: 300px"
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
  </div>
</template>

<script>
import { CChartBar } from "@coreui/vue-chartjs";

export default {
  components: {
    CChartBar,
  },
  created() {
    this.getData();
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
          label: "pending",
          color: "gradient-primary",
          icon: "cil-media-pause",
        },
        {
          label: "approved",
          color: "gradient-success",
          icon: "cil-check-circle",
        },
        {
          label: "disapproved",
          color: "gradient-danger",
          icon: "cil-x-circle",
        },
        { label: "expired", color: "gradient-secondary", icon: "cil-clock" },
      ],

      status: "pending",

      chartData: {},
    };
  },
  methods: {
    getData() {
      this.$http
        .get(`${process.env.VUE_APP_PDPA_SERVICES}personal_data`)
        .then((res) => {
          // widget
          this.statusFields.forEach((item) => {
            this.total[item.label] = res.data
              .filter((element) => element.status == item.label)
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
        });
    },
  },
};
</script>