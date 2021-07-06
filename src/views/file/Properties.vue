<template>
  <div>
    <CRow>
      <!-- Preview Section -->
      <CCol>
        <p><b>PATH: </b>{{ properties.path.name }}/{{ properties.name }}</p>
        <iframe id="viewer" frameborder="0" style="width: 100%; height: 500px">
          <p>Your browser does not support iframes.</p>
        </iframe>
        <CElementCover :opacity="0.8" v-show="isContentLoaded" />
      </CCol>
      <!-- Properties Section -->
      <CCol col="3" style="word-wrap: break-word">
        <CButtonToolbar justify>
          <CButton block color="primary" @click="download()">ดาวน์โหลด</CButton
          ><CButton block color="primary" @click="sharedModal = true"
            >แชร์</CButton
          >
          <CButton
            block
            color="primary"
            :disabled="!permissionCheck('update')"
            @click="uploadNewVersionModal = true"
            >นำเข้าเวอร์ชันใหม่</CButton
          >
        </CButtonToolbar>

        <hr />

        <CButton
          block
          class="card-header"
          @click="accordion = accordion === 0 ? false : 0"
        >
          <h5 class="m-0">รายละเอียด</h5>
        </CButton>
        <CCollapse :show="accordion === 0">
          <br />
          <b>ชื่อไฟล์:</b> {{ properties.name }} <br />

          <b>หัวข้อ:</b>
          {{
            properties.properties.hasOwnProperty("cm:title")
              ? properties.properties["cm:title"]
              : "(None)"
          }}
          <br />

          <b>คำอธิบาย:</b>
          {{
            properties.properties.hasOwnProperty("cm:description")
              ? properties.properties["cm:description"]
              : "(None)"
          }}
          <br />

          <b>เวอร์ชัน:</b>&nbsp;
          <CBadge color="primary">{{
            properties.properties["cm:versionLabel"]
          }}</CBadge>
          <br />

          <b>Mime type:</b> {{ properties.content.mimeTypeName }} <br />
          <b>ขนาด:</b>
          {{ (properties.content.sizeInBytes / 1000).toFixed(2) }} KB <br />

          <b>สร้างโดย:</b>
          {{ properties.createdByUser.displayName }} <br />
          <b>วันที่สร้าง:</b>
          {{ new Date(properties.createdAt).toLocaleDateString() }}
          <br />

          <b>แก้ไขโดย:</b>
          {{ properties.modifiedByUser.displayName }} <br />
          <b>วันที่แก้ไข:</b>
          {{ new Date(properties.modifiedAt).toLocaleDateString() }}
          <br />
        </CCollapse>
        <hr />
        <!-- Versions Section -->
        <CButton
          block
          class="card-header"
          @click="accordion = accordion === 1 ? false : 1"
        >
          <h5 class="m-0">ประวัติเวอร์ชัน</h5>
        </CButton>
        <CCollapse :show="accordion === 1"
          ><br />
          <CDataTable
            :items="versions"
            :fields="fields"
            :items-per-page="3"
            sorter
            hover
            striped
            border
            pagination
          >
            <template #id="{ item }">
              <td>
                &nbsp;
                <CBadge color="primary">{{ item.id }}</CBadge
                >&nbsp; {{ item.name }} <br />
                ความคิดเห็น:
                {{
                  item.hasOwnProperty("versionComment")
                    ? item.versionComment
                    : "(ไม่มีความคิดเห็น)"
                }}
              </td>
            </template>
            <template #actions="{ item }">
              <td>
                <CButton
                  color="warning"
                  size="sm"
                  v-c-tooltip="{ content: 'ย้อนเวอร์ชัน', placement: 'left' }"
                  :disabled="!permissionCheck('update')"
                  @click="
                    versionId = item.id;
                    revertModal = true;
                  "
                  ><CIcon name="cil-media-skip-backward" /></CButton
                >&nbsp;
                <CButton
                  color="success"
                  size="sm"
                  v-c-tooltip="{ content: 'ดาวน์โหลด', placement: 'right' }"
                  @click="download(item.id)"
                  ><CIcon name="cil-cloud-download"
                /></CButton>
              </td>
            </template>
          </CDataTable>
        </CCollapse>
      </CCol>
    </CRow>
    <hr />

    <!-- Comment Section -->
    <strong style="color: #321fdb">ความคิดเห็น </strong>
    <CButton
      color="primary"
      size="sm"
      :disabled="!permissionCheck('update')"
      @click="openEditor = true"
      >เพิ่มความคิดเห็น</CButton
    >
    <hr />

    <!-- Editor -->
    <div v-show="openEditor">
      <quill-editor
        v-model="commentInput"
        :options="{
          modules: {
            toolbar: {
              container: [
                ['bold', 'italic', 'underline'],
                [{ color: [] }, { background: [] }],
                [{ header: [1, 2, 3, 4, 5, 6, false] }],
              ],
            },
          },
        }"
      />
      <br />
      <CButton
        :color="commentId == '' ? 'success' : 'warning'"
        size="sm"
        @click="commentId == '' ? addComment() : editComment()"
        >{{ commentId == "" ? "เพิ่มความคิดเห็น" : "บันทึก" }}</CButton
      >&nbsp;
      <CButton color="danger" size="sm" @click="openEditor = false"
        >ยกเลิก</CButton
      >
    </div>
    <br />

    <!-- Comments -->
    <p v-if="comments.length == 0">ไม่มีความคิดเห็น</p>
    <CListGroup v-else style="height: 200px; overflow-y: auto">
      <CListGroupItem :key="index" v-for="(item, index) in comments">
        <strong style="color: #321fdb"
          >{{ item.modifiedBy.firstName }}
          {{ item.modifiedBy.lastName ? item.modifiedBy.lastName : "" }}
        </strong>
        <CButton
          class="float-right"
          size="sm"
          color="warning"
          v-c-tooltip="'แก้ไข'"
          @click="editCommentHandler(item.id, item.content)"
          :disabled="!item.canEdit"
          ><CIcon name="cil-pencil" /></CButton
        >&nbsp;
        <CButton
          class="float-right"
          size="sm"
          color="danger"
          v-c-tooltip="'ลบ'"
          @click="
            commentId = item.id;
            removeCommentModal = true;
          "
          :disabled="!item.canDelete"
          ><CIcon name="cil-trash"
        /></CButton>
        <br />
        <p v-html="item.content" />
      </CListGroupItem>
    </CListGroup>

    <!-- Remove comment Modal -->
    <CModal
      :show.sync="removeCommentModal"
      :no-close-on-backdrop="true"
      :centered="true"
      size="sm"
      color="danger"
    >
      คุณต้องการลบความคิดเห็นที่เลือกนี้หรือไม่ ?
      <template #header>
        <h6 class="modal-title">ลบความคิดเห็น</h6>
        <CButtonClose @click="removeCommentModal = false" class="text-white" />
      </template>
      <template #footer>
        <CButton @click="removeCommentModal = false" color="danger"
          >ยกเลิก</CButton
        >
        <CButton color="success" @click="removeComment">ตกลง</CButton>
      </template>
    </CModal>

    <!-- Revert Modal -->
    <CModal
      :show.sync="revertModal"
      :no-close-on-backdrop="true"
      :centered="true"
      title="ย้อนเวอร์ชัน"
      size="lg"
      color="primary"
    >
      <CInputRadioGroup
        name="revert-isMajor"
        :options="[
          { value: 'false', label: 'การเปลี่ยนแปลงย่อย' },
          { value: 'true', label: 'การเปลี่ยนแปลงหลัก' },
        ]"
        :checked.sync="versionProperties.majorVersion"
        inline
        custom
      />
      <br />
      <CTextarea
        label="คำอธิบาย"
        horizontal
        v-model="versionProperties.comment"
      />
      <template #header>
        <h6 class="modal-title">ย้อนเวอร์ชัน</h6>
        <CButtonClose @click="revertModal = false" class="text-white" />
      </template>
      <template #footer>
        <CButton @click="revertModal = false" color="danger">ยกเลิก</CButton>
        <CButton color="success" @click="revertVersion">ตกลง</CButton>
      </template>
    </CModal>

    <!-- upload new version Modal -->
    <CModal
      :show.sync="uploadNewVersionModal"
      :no-close-on-backdrop="true"
      :centered="true"
      title="นำเข้าเวอร์ชันใหม่"
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
      <CInputRadioGroup
        name="upload-isMajor"
        :options="[
          { value: 'false', label: 'การเปลี่ยนแปลงย่อย' },
          { value: 'true', label: 'การเปลี่ยนแปลงหลัก' },
        ]"
        :checked.sync="versionProperties.majorVersion"
        inline
        custom
      />
      <br />
      <CTextarea
        label="คำอธิบาย"
        horizontal
        v-model="versionProperties.comment"
      />
      <template #header>
        <h6 class="modal-title">นำเข้าเวอร์ชันใหม่</h6>
        <CButtonClose
          @click="uploadNewVersionModal = false"
          class="text-white"
        />
      </template>
      <template #footer>
        <CButton @click="uploadNewVersionModal = false" color="danger"
          >ยกเลิก</CButton
        >
        <CButton color="success" @click="upload">ตกลง</CButton>
      </template>
    </CModal>

    <!-- Shared Modal -->
    <CModal
      :show.sync="sharedModal"
      :no-close-on-backdrop="true"
      :centered="true"
      title="แชร์"
      size="lg"
      color="primary"
    >
      <div v-show="sharedLink.link">
        <CInput
          label="ลิงค์:"
          horizontal
          id="shared-link"
          v-model="sharedLink.link"
          readonly
        />

        <hr />
        <CButton color="danger" @click="deleteSharedLink()">ยกเลิกแชร์</CButton>
      </div>

      <div v-show="!sharedLink.link">
        <CRow>
          <CCol col="2"
            ><label style="margin-top: 6px">ระยะเวลาที่แชร์: </label></CCol
          >
          <CCol>
            <v-date-picker
              :min-date="disabledDate"
              v-model="sharedLink.expiresAt"
            />
          </CCol>
          <CCol col="2"
            ><CButton block color="warning" @click="sharedLink.expiresAt = null"
              >ยกเลิก</CButton
            ></CCol
          >
        </CRow>
        <br />
        <CButton block color="primary" @click="createSharedLink()"
          >แชร์</CButton
        >
      </div>

      <template #header>
        <h6 class="modal-title">แชร์</h6>
        <CButtonClose @click="sharedModal = false" class="text-white" />
      </template>
      <template #footer>
        <CButton @click="sharedModal = false" color="danger">ปิด</CButton>
      </template>
    </CModal>
  </div>
</template>

<script>
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";

import { quillEditor } from "vue-quill-editor";

import { DatePicker } from "v-calendar";

import previewableTypes from "@/views/file/previewableTypes";

const fields = [
  { key: "id", label: "Version" },
  { key: "actions", label: "Actions" },
];

export default {
  props: {
    id: String,
  },
  components: {
    quillEditor,
    "v-date-picker": DatePicker,
  },
  watch: {
    openEditor: function (val) {
      if (!val) {
        this.commentId = "";
        this.commentInput = "";
      }
    },
    revertModal: function (val) {
      if (!val) {
        this.versionProperties.majorVersion = "false";
        this.versionProperties.comment = "";
      }
    },
    uploadNewVersionModal: function (val) {
      if (!val) {
        this.$refs["fileInput"].value = null;
        this.versionProperties.majorVersion = "false";
        this.versionProperties.comment = "";
      }
    },
    removeCommentModal: function (val) {
      if (!val) {
        this.commentId = "";
      } else {
        this.openEditor = false;
      }
    },
    "sharedLink.id": function (val) {
      if (val) {
        this.sharedLink.link = `${process.env.VUE_APP_ALFRESCO_BASE}share/s/${val}`;
      }
    },
    sharedModal: function (val) {
      if (val && this.sharedLink.link) {
        this.copyLink();
      }
    },
  },
  computed: {
    disabledDate() {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    },
  },
  created() {
    // Get properties
    this.getProperties();

    // Get Versions
    this.getVersions();

    // Get Comment
    this.getComments();
  },
  data() {
    return {
      openEditor: false,
      isContentLoaded: false,

      accordion: 0,

      commentInput: "",

      commentId: "",
      versionId: "",

      comments: [],

      versions: [],
      fields,

      file: null,

      revertModal: false,
      uploadNewVersionModal: false,
      removeCommentModal: false,
      sharedModal: false,

      sharedLink: {
        expiresAt: null,
        link: "",
        id: "",
      },

      properties: {
        name: "",
        createdByUser: {
          displayName: "",
        },
        modifiedByUser: {
          displayName: "",
        },
        createdAt: new Date(),
        modifiedAt: new Date(),
        content: {
          mimeTypeName: "",
          sizeInBytes: 0,
        },
        properties: {
          "cm:versionLabel": "",
        },
        path: {
          name: "",
        },
      },

      versionProperties: {
        majorVersion: "false",
        comment: "",
      },

      previewableTypes,
    };
  },
  methods: {
    // Properties
    getProperties() {
      this.$http
        .get(
          `${process.env.VUE_APP_ALFRESCO_API}alfresco/versions/1/nodes/${this.id}?include=allowableOperations,path`
        )
        .then((res) => {
          this.properties = res.data.entry;

          if (this.properties.properties.hasOwnProperty("qshare:sharedId")) {
            this.sharedLink.id = this.properties.properties["qshare:sharedId"];
          }

          // Get Content
          if (
            this.previewableTypes.includes(this.properties.content.mimeType)
          ) {
            this.getContent();
          } else {
            document
              .getElementById("viewer")
              .setAttribute(
                "srcdoc",
                "<h1>This document can't be previewed.</h1>"
              );
          }
        });
    },
    // Preview
    getContent() {
      this.isContentLoaded = true;
      this.$http
        .get(
          `${process.env.VUE_APP_ALFRESCO_API}alfresco/versions/1/nodes/${this.id}/content`,
          { responseType: "blob" }
        )
        .then(async (res) => {
          const viewer = await document.getElementById("viewer");
          const url = await URL.createObjectURL(res.data);

          viewer.setAttribute("src", `${url}#toolbar=0`);

          viewer.removeAttribute("srcdoc");
          this.isContentLoaded = false;
          viewer.onload = await function () {
            // Disable Download Video
            if (viewer.contentWindow.document.querySelector("[name='media']")) {
              viewer.contentWindow.document
                .querySelector("[name='media']")
                .setAttribute("controlsList", "nodownload");
            }
            const body = viewer.contentWindow.document.querySelector("body");
            body.setAttribute("oncontextmenu", "return false");
          };
        })
        .catch(() => {
          this.isContentLoaded = false;
        });
    },
    // comment
    getComments() {
      this.$http
        .get(
          `${process.env.VUE_APP_ALFRESCO_API}alfresco/versions/1/nodes/${this.id}/comments?include=properties`
        )
        .then((res) => {
          this.comments = res.data.list.entries.map((item) => {
            return item.entry;
          });
        });
    },
    addComment() {
      this.$http
        .post(
          `${process.env.VUE_APP_ALFRESCO_API}alfresco/versions/1/nodes/${this.id}/comments`,
          {
            content: this.commentInput,
          }
        )
        .then(() => {
          this.openEditor = false;

          this.getComments();
        });
    },
    removeComment() {
      this.$http
        .delete(
          `${process.env.VUE_APP_ALFRESCO_API}alfresco/versions/1/nodes/${this.id}/comments/${this.commentId}`
        )
        .then(() => {
          this.getComments();
          this.removeCommentModal = false;
        });
    },
    editCommentHandler(id, content) {
      this.openEditor = true;
      this.commentInput = content;
      this.commentId = id;
    },
    editComment() {
      this.$http
        .put(
          `${process.env.VUE_APP_ALFRESCO_API}alfresco/versions/1/nodes/${this.id}/comments/${this.commentId}`,
          {
            content: this.commentInput,
          }
        )
        .then(() => {
          this.openEditor = false;

          this.getComments();
        });
    },
    // Versions
    getVersions() {
      this.$http
        .get(
          `${process.env.VUE_APP_ALFRESCO_API}alfresco/versions/1/nodes/${this.id}/versions`
        )
        .then((res) => {
          this.versions = res.data.list.entries.map((item) => {
            return item.entry;
          });
        });
    },
    // Download
    download(version = false) {
      let requestURL = `${process.env.VUE_APP_ALFRESCO_API}alfresco/versions/1/nodes/${this.id}`;

      if (version) {
        requestURL += `/versions/${version}`;
      }

      requestURL += "/content";

      this.$http.get(requestURL, { responseType: "blob" }).then((res) => {
        const url = URL.createObjectURL(res.data);

        let link = document.createElement("a");
        link.href = url;
        link.download = this.properties.name;
        link.dispatchEvent(new MouseEvent("click"));
      });
    },
    // Revert
    revertVersion() {
      const data = {
        majorVersion: JSON.parse(this.versionProperties.majorVersion),
        comment: this.versionProperties.comment,
      };
      this.$http
        .post(
          `${process.env.VUE_APP_ALFRESCO_API}alfresco/versions/1/nodes/${this.id}/versions/${this.versionId}/revert`,
          data
        )
        .then(() => {
          this.getProperties();
          this.getVersions();
          this.revertModal = false;
        });
    },
    // New Version
    uploadHandler() {
      this.file = event.currentTarget.files[0];
    },
    upload() {
      this.$http
        .put(
          `${process.env.VUE_APP_ALFRESCO_API}alfresco/versions/1/nodes/${this.id}/content?majorVersion=${this.versionProperties.majorVersion}&comment=${this.versionProperties.comment}&name=${this.file.name}`,
          this.file
        )
        .then(() => {
          this.getProperties();
          this.getVersions();
          this.uploadNewVersionModal = false;
        });
    },
    // Permission
    permissionCheck(value) {
      return (
        this.properties.hasOwnProperty("allowableOperations") &&
        this.properties.allowableOperations.indexOf(value) != -1
      );
    },
    // Create a shared link to a file
    createSharedLink() {
      var data = {
        nodeId: this.id,
      };
      if (this.sharedLink.expiresAt != null) {
        let expiresAt = this.sharedLink.expiresAt;
        let currentDate = new Date();

        expiresAt.setHours(currentDate.getHours());
        expiresAt.setMinutes(currentDate.getMinutes());
        expiresAt.setSeconds(currentDate.getSeconds());

        data.expiresAt = expiresAt.toISOString().replace("Z", "+0000");
      }
      this.$http
        .post(
          `${process.env.VUE_APP_ALFRESCO_API}alfresco/versions/1/shared-links`,
          data
        )
        .then((response) => {
          this.sharedLink.id = response.data.entry.id;

          this.copyLink();
        });
    },
    // Deletes a shared link
    deleteSharedLink() {
      this.$http
        .delete(
          `${process.env.VUE_APP_ALFRESCO_API}alfresco/versions/1/shared-links/${this.sharedLink.id}`
        )
        .then(() => {
          this.sharedLink = {
            expiresAt: null,
            link: "",
            id: "",
          };
        });
    },
    async copyLink() {
      const Link = await document.getElementById("shared-link");
      Link.select();
      Link.setSelectionRange(0, 99999);
      document.execCommand("copy");
    },
  },
};
</script>