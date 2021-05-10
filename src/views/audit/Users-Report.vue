<template>
  <div>
    <CCard>
      <CCardHeader
        ><strong style="color: #321fdb"
          >รายงานการเข้าใช้งานระบบ</strong
        ></CCardHeader
      >
      <CCardBody>
        <CDataTable
          :items="list"
          :fields="fields"
          column-filter
          :items-per-page="5"
          :itemsPerPageSelect="{
            label: 'แสดง',
          }"
          :tableFilter="{
            label: 'ค้นหา: ',
            placeholder: 'ค้นหา',
          }"
          sorter
          :loading="isLoaded"
          hover
          striped
          border
          pagination
          cleaner
        >
          <template #date="{ item }">
            <td>
              {{ new Date(item.date).toLocaleDateString("th-TH") }}
            </td>
          </template>
          <template #time="{ item }">
            <td>
              {{ new Date(item.time).toLocaleTimeString("th-TH") }}
            </td>
          </template>
        </CDataTable>
      </CCardBody>
    </CCard>
  </div>
</template>

<script>
const fields = [
  { key: "user", label: "User" },
  { key: "date", label: "Date" },
  { key: "time", label: "Time" },
  { key: "action", label: "Actions" },
];

export default {
  async created() {
    this.isLoaded = true;

    const loginReport = await this.$http.get(
      `${process.env.VUE_APP_ALFRESCO_SERVICES}audit/query/alfresco-access/alfresco-access/login/user?forward=false&verbose=true&limit=1000`
    );

    const logoutReport = await this.$http.get(
      `${process.env.VUE_APP_ALFRESCO_SERVICES}audit/query/alfresco-access/alfresco-access/logout/user?forward=false&verbose=true&limit=1000`
    );

    this.list = [...loginReport.data.entries, ...logoutReport.data.entries]
      .map((item) => {
        item.action =
          "/alfresco-access/login/user" in item.values ? "login" : "logout";
        item.date = item.time;

        return item;
      })
      .sort((a, b) => (new Date(a.time) > new Date(b.time) ? -1 : 1));
    this.isLoaded = false;
  },
  data() {
    return {
      list: [],
      fields,

      isLoaded: false,
    };
  },
};
</script>