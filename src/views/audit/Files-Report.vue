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
          <template #action="{ item }">
            <td>
              <CBadge :color="item.color" style="font-size: 15px">
                {{ item.action }}
              </CBadge>
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
        const action = this.getActionLabel(
          item.values["/alfresco-access/transaction/action"]
        );
        return {
          path: item.values["/alfresco-access/transaction/path"]
            .replace(/app:|cm:|st:|fm:/gi, "")
            .replace("/doclib", "")
            .replace("/imgpreview", "")
            .split("/discussion/Comments/")[0],
          fullPath: item.values["/alfresco-access/transaction/path"]
            .split("/cm:doclib")[0]
            .split("/cm:imgpreview")[0]
            .split("/fm:discussion/cm:Comments/")[0],
          time: item.time,
          user: item.user,
          action: action.label,
          color: action.color,
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
          return { label: "อ่าน", color: "info" };
        case "DELETE":
          return { label: "ลบ", color: "danger" };
        case "MOVE":
          return { label: "เคลื่อนย้าย", color: "warning" };
        case "COPY":
          return { label: "คัดลอก", color: "warning" };
        case "CREATE":
          return { label: "สร้าง", color: "success" };
        case "CREATE VERSION":
          return { label: "สร้างเวอร์ชันใหม่", color: "success" };
        case "CHECK IN":
          return { label: "เช็คอิน", color: "secondary" };
        case "UPDATE CONTENT":
          return { label: "แก้ไขเนื้อหา", color: "warning" };
        case "updateNodeProperties":
          return { label: "แก้ไขคุณสมบัติ", color: "warning" };
        case "addNodeAspect":
          return { label: "เพิ่มลักษณะ", color: "success" };
        case "deleteNodeAspect":
          return { label: "ลบลักษณะ", color: "danger" };
        case "readContent":
          return { label: "อ่านเนื้อหา", color: "info" };
        default:
          return { label: action, color: "secondary" };
      }
    },
    async pathLink(path) {
      try {
        const words = path.split("cm:");

        var txt = words[0];

        words.shift();

        words.forEach((item, index) => {
          item = item.replace("/", "");
          if (/^[A-Za-z0-9]*$/.test(item)) {
            txt += `cm:${item}`;
          } else {
            txt += `cm:"${item}"`;
          }
          if (index < words.length - 1) txt += "/";
        });

        const splitPath = path.split("/");
        const NAME = splitPath[splitPath.length - 1].replace("cm:", "");
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
            fields: ["name", "id", "isFile"],
          }
        );

        if (
          res.data.list.entries.length > 0 &&
          NAME == res.data.list.entries[0].entry.name
        ) {
          if (res.data.list.entries[0].entry.isFile) {
            this.property(res.data.list.entries[0].entry.id);
          } else {
            const routeData = this.$router.resolve({
              name: "Repository",
              query: { id: res.data.list.entries[0].entry.id },
            });
            window.open(routeData.href, "_blank");
          }
        } else {
          throw null;
        }
      } catch (error) {
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