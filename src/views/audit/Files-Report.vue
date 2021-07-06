<template>
  <div>
    <!-- cannot work with the link ALERT -->
    <CAlert :show="alertStatus" color="danger"
      >Cannot activate this link.</CAlert
    >
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
          <template #path="{ item }">
            <td>
              <CLink @click="pathLink(item.fullPath)">{{ item.path }}</CLink>
            </td>
          </template>
          <template #time="{ item }">
            <td>
              {{ new Date(item.time).toLocaleDateString() }}
              {{ new Date(item.time).toLocaleTimeString() }}
            </td>
          </template>
        </CDataTable>
      </CCardBody>
    </CCard>

    <!-- Properties Modal -->
    <CModal
      v-if="modalProperties"
      :show.sync="modalProperties"
      :no-close-on-backdrop="true"
      :centered="true"
      size="xl"
      color="primary"
    >
      <Properties v-if="selectId != ''" :id="selectId" />
      <template #header>
        <h6 class="modal-title">รายละเอียดเอกสาร</h6>
        <CButtonClose @click="modalProperties = false" class="text-white" />
      </template>
      <template #footer>
        <CButton @click="modalProperties = false" color="secondary"
          >ปิด</CButton
        >
      </template>
    </CModal>
  </div>
</template>

<script>
const fields = [
  { key: "path", label: "Path" },
  { key: "time", label: "Time" },
  { key: "user", label: "Modifier" },
  { key: "action", label: "Actions" },
];

import Properties from "@/views/file/Properties";

export default {
  components: {
    Properties,
  },
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
          fullPath: item.values["/alfresco-access/transaction/path"],
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

      modalProperties: false,
      selectId: "",

      alertStatus: false,
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
        case "deleteNodeAspect":
          return "ลบลักษณะ";
        case "readContent":
          return "อ่านเนื้อหา";
        default:
          return action;
      }
    },
    async pathLink(path) {
      const words = path.split("cm:");

      var txt = words[0];

      words.forEach((item, index) => {
        if (index > 0) {
          txt += item.includes("/")
            ? `cm:"${item.replace("/", "")}"`
            : `cm:"${item}"`;
          if (index < words.length - 1) txt += "/";
        }
      });
      const query = `PATH:"${txt}"`;

      const res = await this.$http.post(
        `${process.env.VUE_APP_ALFRESCO_API}search/versions/1/search`,
        {
          query: {
            query,
            language: "lucene",
          },
          paging: {
            maxItems: 1,
          },
        }
      );

      if (res.data.list.entries.length > 0) {
        if (res.data.list.entries[0].entry.isFile) {
          this.property(res.data.list.entries[0].entry.id);
        } else {
          this.$router.push(
            `/repository?id=${res.data.list.entries[0].entry.id}`
          );
        }
      } else {
        this.alertStatus = true;

        setTimeout(() => {
          this.alertStatus = false;
        }, 2000);
      }
    },
    property(id) {
      this.selectId = id;
      this.modalProperties = true;
    },
  },
};
</script>