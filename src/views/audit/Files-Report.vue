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
              {{ new Date(item.time).toLocaleDateString() }}
              {{ new Date(item.time).toLocaleTimeString() }}
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
  { key: "time", label: "Time" },
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
        return {
          path: item.values["/alfresco-access/transaction/path"]
            .replace(/app:|cm:|st:|fm:/gi, "")
            .replace("/doclib", "")
            .replace("/imgpreview", "")
            .split("/discussion/Comments/")[0],
          time: item.time,
          user: item.user,
          action: this.getActionLabel(
            item.values["/alfresco-access/transaction/action"]
          ),
        };
      })
      .filter(
        (item) =>
          item.path.search("/sys:system/") == -1 &&
          item.path.search("ver2:versionedState") == -1
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
  methods: {
    getActionLabel(action) {
      switch (action) {
        case "READ":
          return "อ่าน";
        case "DELETE":
          return "ลบ";
        case "MOVE":
          return "เคลื่อนย้าย";
        case "COPY":
          return "คัดลอก";
        case "CREATE":
          return "สร้าง";
        case "CREATE VERSION":
          return "สร้างเวอร์ชันใหม่";
        case "CHECK IN":
          return "เช็คอิน";
        case "UPDATE CONTENT":
          return "แก้ไขเนื้อหา";
        case "updateNodeProperties":
          return "แก้ไขคุณสมบัติ";
        case "addNodeAspect":
          return "เพิ่มลักษณะ";
        case "readContent":
          return "อ่านเนื้อหา";
        default:
          return action;
      }
    },
  },
};
</script>