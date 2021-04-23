<template>
  <div>
    <CCard>
      <CCardHeader>
        <strong style="color: #321fdb">{{ currentFolder.name }}</strong>
        <div style="margin-top: 10px; opacity: 0.7">
          Path : {{ currentFolder.path.name + "/" + currentFolder.name }}
        </div>
      </CCardHeader>
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
          :sorterValue="{
            column: 'name',
            asc: 'true',
          }"
          :loading="isTableLoaded"
          hover
          striped
          border
          pagination
          cleaner
        >
          <template #no-items-view
            ><div class="text-center">ไม่พบข้อมูล</div>
          </template>

          <template #over-table>
            <CButton
              color="primary"
              shape="pill"
              :disabled="rootId == currentFolder.id"
              @click="getList(currentFolder.parentId)"
              ><CIcon name="cil-arrow-left" /> ย้อนกลับ</CButton
            >&nbsp;
            <CButton color="primary" shape="pill"
              ><CIcon name="cil-folder" /> สร้างโฟลเดอร์ใหม่</CButton
            >&nbsp;
            <CButton color="primary" shape="pill"
              ><CIcon name="cil-file" /> อัปโหลด</CButton
            >
          </template>
          <template #name="{ item }">
            <td
              style="cursor: pointer"
              @click="item.isFile ? property(item.id) : getList(item.id)"
            >
              <CRow>
                <CCol md="2">
                  <CIcon
                    height="42"
                    :name="item.isFile ? 'cil-file' : 'cil-folder'"
                  />
                </CCol>
                <CCol>
                  {{ item.name }}
                  <br />
                  Description:
                  {{ item.description != "" ? item.description : "-" }}
                </CCol>
              </CRow>
            </td>
          </template>
          <template #modifiedAt="{ item }">
            <td>
              {{ item.modifiedAt }}
            </td>
          </template>
          <template #actions="{ item }">
            <td>
              <CButton color="success" v-c-tooltip="'ย้าย'"
                ><CIcon name="cil-cursor" /></CButton
              >&nbsp;
              <CButton color="warning" v-c-tooltip="'คัดลอก'"
                ><CIcon name="cil-copy" /></CButton
              >&nbsp;
              <CButton
                color="danger"
                v-c-tooltip="'ลบ'"
                @click="modalStatus.delete = true"
                ><CIcon name="cil-trash"
              /></CButton>
            </td>
          </template>
          <template #actions-filter> <p></p> </template>
        </CDataTable>
      </CCardBody>
    </CCard>

    <!-- Delete Modal -->
    <CModal
      :show.sync="modalStatus.delete"
      :no-close-on-backdrop="true"
      :centered="true"
      title="Modal title 2"
      size="lg"
      color="danger"
    >
      คุณต้องการลบรายการที่เลือกนี้หรือไม่ ?
      <template #header>
        <h6 class="modal-title">ลบรายการ</h6>
        <CButtonClose @click="modalStatus.delete = false" class="text-white" />
      </template>
      <template #footer>
        <CButton @click="modalStatus.delete = false" color="danger"
          >ยกเลิก</CButton
        >
        <CButton @click="modalStatus.delete = false" color="success"
          >ตกลง</CButton
        >
      </template>
    </CModal>
  </div>
</template>

<script>
const fields = [
  { key: "name", label: "Name", _style: "min-width:40%" },
  { key: "modifiedAt", label: "Modified Date", _style: "min-width:20%;" },
  { key: "actions", label: "Actions", _style: "min-width:20%;" },
];

export default {
  async created() {
    let id = "-my-";
    switch (this.$route.name) {
      case "Shared Files":
        id = "-shared-";
        break;
      case "Repository":
        id = "-root-";
        break;
    }
    await this.getList(id);
    this.rootId = this.currentFolder.id;
  },
  data() {
    return {
      list: [
        {
          name: "",
          modifiedAt: "",
        },
      ],
      fields,

      currentFolder: {
        id: "",
        name: "Loading...",
        path: {
          name: "",
        },
      },

      modalStatus: {
        delete: false,
        move: false,
        copy: false,
      },

      isTableLoaded: false,

      rootId: "",
    };
  },
  methods: {
    async getList(id) {
      this.isTableLoaded = true;
      try {
        const currentFolder = await this.$http.get(
          `${process.env.VUE_APP_ALFRESCO_API}alfresco/versions/1/nodes/${id}?include=allowableOperations,path,properties`
        );
        this.currentFolder = await currentFolder.data.entry;
        let isMoreItems = false,
          maxItems = 1000,
          skipCount = 0;
        do {
          const response = await this.$http.get(
            `${process.env.VUE_APP_ALFRESCO_API}alfresco/versions/1/nodes/${id}/children?maxItems=${maxItems}&skipCount=${skipCount}&include=properties,allowableOperations`
          );

          this.list = [];

          response.data.list.entries.map((e) => {
            if (e.entry.hasOwnProperty("properties")) {
              Object.assign(e.entry, {
                title: e.entry.properties.hasOwnProperty("cm:title")
                  ? e["entry"]["properties"]["cm:title"]
                  : "",
                description: e.entry.properties.hasOwnProperty("cm:description")
                  ? e["entry"]["properties"]["cm:description"]
                  : "",
              });
            } else {
              Object.assign(e.entry, {
                title: "",
                description: "",
              });
            }
            e.entry.modifiedAt = new Date(
              e.entry.modifiedAt
            ).toLocaleDateString("th-TH");
            this.list.push(e.entry);
          });
          isMoreItems = await response.data.list.pagination.hasMoreItems;
          skipCount += maxItems;
        } while (isMoreItems);
        this.isTableLoaded = false;
      } catch (error) {
        this.isTableLoaded = false;
      }
    },
    property(id) {
      console.log(id);
    },
  },
};
</script>