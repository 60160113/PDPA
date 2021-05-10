<template>
  <div>
    <CCard>
      <CCardHeader
        ><strong style="color: #321fdb">รายงานไฟล์</strong></CCardHeader
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
          <template #time="{ item }">
            <td>
              {{ new Date(item.time).toLocaleDateString("th-TH") }}
            </td>
          </template>
        </CDataTable>
      </CCardBody>
    </CCard>
  </div>
</template>

<script>
const fields = [
  { key: "path", label: "Path" },
  { key: "time", label: "Date" },
  { key: "user", label: "Modifier" },
  { key: "action", label: "Actions" },
];
export default {
  async created() {
    this.isLoaded = true;

    const { data } = await this.$http.get(
      `${process.env.VUE_APP_ALFRESCO_SERVICES}audit/query/alfresco-access/alfresco-access/transaction/action?forward=false&verbose=true&limit=1000`
    );

    this.list = data.entries
      .map((item) => {
        item.path = item.values["/alfresco-access/transaction/path"].replace(
          /app:|cm:|st:|fm:/gi,
          ""
        );
        item.action = item.values["/alfresco-access/transaction/action"];
        return item;
      })
      .filter(
        (item) =>
          item.values["/alfresco-access/transaction/path"].search(
            "/sys:system/"
          ) == -1
      );
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