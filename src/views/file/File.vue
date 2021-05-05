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
              :disabled="rootId == currentFolder.id || isTableLoaded"
              @click="getList(currentFolder.parentId)"
              ><CIcon name="cil-arrow-left" /> ย้อนกลับ</CButton
            >&nbsp;
            <CButton
              color="primary"
              shape="pill"
              :disabled="isTableLoaded"
              @click="modalStatus.newFolder = true"
              ><CIcon name="cil-folder" /> สร้างโฟลเดอร์ใหม่</CButton
            >&nbsp;
            <CButton
              color="primary"
              shape="pill"
              :disabled="isTableLoaded"
              @click="modalStatus.upload = true"
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
                  {{
                    item.title != ""
                      ? `(${
                          item.title.length >= 20
                            ? item.title.substring(20, 0) + "..."
                            : item.title
                        })`
                      : ""
                  }}
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
                @click="
                  selectId = item.id;
                  modalStatus.remove = true;
                "
                ><CIcon name="cil-trash"
              /></CButton>
            </td>
          </template>
          <template #actions-filter> <p></p> </template>
        </CDataTable>
      </CCardBody>
    </CCard>

    <!-- Remove Modal -->
    <CModal
      :show.sync="modalStatus.remove"
      :no-close-on-backdrop="true"
      :centered="true"
      title="Modal title 2"
      size="lg"
      color="danger"
    >
      คุณต้องการลบรายการที่เลือกนี้หรือไม่ ?
      <template #header>
        <h6 class="modal-title">ลบรายการ</h6>
        <CButtonClose @click="modalStatus.remove = false" class="text-white" />
      </template>
      <template #footer>
        <CButton @click="modalStatus.remove = false" color="danger"
          >ยกเลิก</CButton
        >
        <CButton @click="remove()" color="success">ตกลง</CButton>
      </template>
    </CModal>

    <!-- New Folder Modal -->
    <CModal
      :show.sync="modalStatus.newFolder"
      :no-close-on-backdrop="true"
      :centered="true"
      title="สร้างโฟลเดอร์ใหม่"
      size="lg"
      color="primary"
    >
      <CInput label="ชื่อ" horizontal v-model="properties.name" />
      <CInput label="หัวข้อ" horizontal v-model="properties.title" />
      <CTextarea label="คำอธิบาย" horizontal v-model="properties.description" />
      <template #header>
        <h6 class="modal-title">สร้างโฟลเดอร์ใหม่</h6>
        <CButtonClose
          @click="modalStatus.newFolder = false"
          class="text-white"
        />
      </template>
      <template #footer>
        <CButton @click="modalStatus.newFolder = false" color="danger"
          >ยกเลิก</CButton
        >
        <CButton @click="createFolder()" color="success">ตกลง</CButton>
      </template>
      <CElementCover :opacity="0.8" v-show="modalLoaded" />
    </CModal>

    <!-- Upload Modal -->
    <CModal
      :show.sync="modalStatus.upload"
      :no-close-on-backdrop="true"
      :centered="true"
      title="อัปโหลด"
      size="lg"
      color="primary"
    >
      <div class="row">
        <label class="col-sm-3">อัปโหลดไฟล์</label>
        <input
          type="file"
          class="col-sm-9"
          ref="fileInput"
          @change="uploadHandler"
        />
      </div>

      <hr />
      <CInput label="ชื่อ" horizontal v-model="properties.name" />
      <CInput label="หัวข้อ" horizontal v-model="properties.title" />
      <CTextarea label="คำอธิบาย" horizontal v-model="properties.description" />
      <template #header>
        <h6 class="modal-title">อัปโหลด</h6>
        <CButtonClose @click="modalStatus.upload = false" class="text-white" />
      </template>
      <template #footer>
        <CButton @click="modalStatus.upload = false" color="danger"
          >ยกเลิก</CButton
        >
        <CButton color="success" @click="upload">ตกลง</CButton>
      </template>
      <CElementCover :opacity="0.8" v-show="modalLoaded" />
    </CModal>

    <!-- Properties Modal -->
    <CModal
      v-if="modalStatus.properties"
      :show.sync="modalStatus.properties"
      :no-close-on-backdrop="true"
      :centered="true"
      title="Properties"
      size="lg"
      color="primary"
    >
      <Properties v-if="selectId != ''" :id="selectId" />
      <template #header>
        <h6 class="modal-title">Properties</h6>
        <CButtonClose
          @click="modalStatus.properties = false"
          class="text-white"
        />
      </template>
      <template #footer>
        <CButton @click="modalStatus.properties = false" color="danger"
          >ยกเลิก</CButton
        >
        <CButton color="success">ตกลง</CButton>
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

import Properties from "./Properties";

export default {
  components: {
    Properties,
  },
  async created() {
    const id = () => {
      switch (this.$route.name) {
        case "My Files":
          return "-my-";
        case "Shared Files":
          return "-shared-";
        case "Repository":
          return "-root-";
        default:
          return this.$route.params.id;
      }
    };
    await this.getList(id());
    this.rootId = this.currentFolder.id;
  },
  watch: {
    "modalStatus.newFolder": function (value) {
      if (!value) {
        this.clearProperties();
      }
    },
    "modalStatus.upload": function (value) {
      if (!value) {
        this.clearProperties();
        this.$refs["fileInput"].value = null;
      }
    },
  },
  data() {
    return {
      list: [
        {
          name: "",
          modifiedAt: "",
          title: "",
          description: "",
        },
      ],
      fields,

      file: null,

      currentFolder: {
        id: "",
        name: "Loading...",
        path: {
          name: "",
        },
      },

      properties: {
        name: "",
        title: "",
        description: "",
      },

      modalStatus: {
        remove: false,
        move: false,
        copy: false,
        newFolder: false,
        upload: false,
        properties: false,
      },

      isTableLoaded: false,
      modalLoaded: false,

      selectId: "",
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
    createFolder() {
      this.modalLoaded = true;
      this.$http
        .post(
          `${process.env.VUE_APP_ALFRESCO_API}alfresco/versions/1/nodes/${this.currentFolder.id}/children?autoRename=true`,
          {
            name: this.properties.name,
            nodeType: "cm:folder",
            properties: {
              "cm:title": this.properties.title,
              "cm:description": this.properties.description,
            },
          }
        )
        .then(() => {
          this.modalStatus.newFolder = false;
          this.getList(this.currentFolder.id);
        });
      this.modalLoaded = false;
    },
    remove() {
      this.$http
        .delete(
          `${process.env.VUE_APP_ALFRESCO_API}alfresco/versions/1/nodes/${this.selectId}`
        )
        .then(() => {
          this.modalStatus.remove = false;
          this.getList(this.currentFolder.id);
        });
    },
    uploadHandler() {
      this.file = event.currentTarget.files[0];
      if (this.file) {
        this.properties.name = this.file.name.substring(
          0,
          this.file.name.lastIndexOf(".")
        );
      } else {
        this.clearProperties();
      }
    },
    async upload() {
      this.modalLoaded = true;
      let formData = new FormData();
      formData.append(
        "filedata",
        this.file,
        this.properties.name +
          this.file.name.slice(this.file.name.lastIndexOf("."))
      );
      const { data } = await this.$http.post(
        `${process.env.VUE_APP_ALFRESCO_API}alfresco/versions/1/nodes/${this.currentFolder.id}/children?autoRename=true`,
        formData
      );
      await this.$http
        .put(
          `${process.env.VUE_APP_ALFRESCO_API}alfresco/versions/1/nodes/${data.entry.id}`,
          {
            properties: {
              "cm:title": this.properties.title,
              "cm:description": this.properties.description,
            },
          }
        )
        .then(() => {
          this.modalStatus.upload = false;
          this.getList(this.currentFolder.id);
        });
      this.modalLoaded = false;
    },
    clearProperties() {
      this.properties = {
        name: "",
        title: "",
        description: "",
      };
    },
    property(id) {
      this.selectId = id;
      this.modalStatus.properties = true;
    },
  },
};
</script>