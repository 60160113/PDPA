<template>
  <div>
    <CCard>
      <CCardHeader>
        <strong class="text-primary">เอกสารที่ต้องการขอ</strong>
      </CCardHeader>
      <CCardBody>
        <CDataTable
          :items="documents"
          :fields="[
            { key: 'label', label: 'Name', _style: 'width:80%' },
            { key: 'action', label: 'Action', _style: 'width:20%' },
          ]"
          :tableFilter="{
            label: 'ค้นหา: ',
            placeholder: 'ค้นหา',
          }"
          pagination
          :items-per-page="5"
          :itemsPerPageSelect="{
            label: 'แสดง',
          }"
          :loading="loading"
          hover
          striped
          border
        >
          <template #no-items-view
            ><div class="text-center">ไม่พบข้อมูล</div>
          </template>

          <template #over-table>
            <div style="margin-bottom: 10px">
              <CButton color="primary" shape="pill" @click="openModal('add')">
                <CIcon name="cil-plus" />
                เพิ่มชื่อเอกสาร
              </CButton>
            </div>
          </template>

          <template #action="{ item }">
            <td>
              <CButton
                color="warning"
                @click="
                  documentName = item.value;
                  selectedItemId = item._id;
                  openModal('edit');
                "
                ><CIcon name="cil-pencil" />แก้ไข</CButton
              >&nbsp;
              <CButton
                color="danger"
                @click="
                  selectedItemId = item._id;
                  openModal('remove');
                "
                ><CIcon name="cil-trash" />ลบ</CButton
              >
            </td>
          </template>
        </CDataTable>
      </CCardBody>
    </CCard>

    <CModal
      :show.sync="modal.show"
      :no-close-on-backdrop="true"
      :centered="true"
      :title="modal.title"
      size="lg"
      :color="modal.color"
    >
      <div v-if="modal.id == 'remove'">คุณต้องการลบรายการนี้หรือไม่ ?</div>
      <div v-else>
        <CInput horizontal label="ชื่อเอกสาร" v-model="documentName" />
      </div>

      <template #footer>
        <CButton @click="modal = false" color="danger"> ยกเลิก </CButton>
        <CButton v-if="modal.id == 'remove'" @click="remove()" color="success">
          ตกลง
        </CButton>
        <CButton
          v-else
          @click="modal.id == 'add' ? insert() : update()"
          color="success"
          :disabled="!documentName"
        >
          ตกลง
        </CButton>
      </template>
    </CModal>
  </div>
</template>

<script>
export default {
  created() {
    this.getDocuments();
  },
  data() {
    return {
      documents: [],

      documentName: "",

      selectedItemId: null,

      loading: false,

      modal: {
        show: false,
        title: "",
        color: "primary",
        id: "",
      },
    };
  },
  methods: {
    openModal(id) {
      var modalObject = {};
      switch (id) {
        case "add":
          modalObject = {
            title: "เพิ่มชื่อเอกสาร",
            color: "success",
          };
          break;
        case "remove":
          modalObject = {
            title: "ลบชื่อเอกสาร",
            color: "danger",
          };
          break;
        case "edit":
          modalObject = {
            title: "แก้ไขชื่อเอกสาร",
            color: "warning",
          };
          break;
      }
      this.modal = { ...modalObject };
      this.modal.id = id;
      this.modal.show = true;
    },
    getDocuments() {
      this.loading = true;
      this.$http({
        method: "get",
        url: `${process.env.VUE_APP_PDPA_SERVICES}data/document`,
      })
        .then((res) => {
          this.documents = res.data;
          this.loading = false;
        })
        .catch((err) => {
          this.loading = false;
        });
    },
    insert() {
      this.loading = true;
      this.$http({
        method: "post",
        url: `${process.env.VUE_APP_PDPA_SERVICES}data/document`,
        data: {
          value: this.documentName,
          label: this.documentName,
        },
      })
        .then(() => {
          this.modal.show = false;
          this.getDocuments();
          this.loading = false;
        })
        .catch((err) => {
          this.loading = false;
        });
    },
    remove() {
      this.loading = true;
      this.$http({
        method: "delete",
        url: `${process.env.VUE_APP_PDPA_SERVICES}data/document/${this.selectedItemId}`,
      })
        .then(() => {
          this.modal.show = false;
          this.getDocuments();
          this.loading = false;
        })
        .catch((err) => {
          this.loading = false;
        });
    },
    update() {
      this.loading = true;
      this.$http({
        method: "put",
        url: `${process.env.VUE_APP_PDPA_SERVICES}data/document/${this.selectedItemId}`,
        data: {
          value: this.documentName,
          label: this.documentName,
        },
      })
        .then(() => {
          this.modal.show = false;
          this.getDocuments();
          this.loading = false;
        })
        .catch((err) => {
          this.loading = false;
        });
    },
  },
  watch: {
    "modal.show": function (val) {
      if (!val) {
        this.documentName = "";
        this.selectedItemId = null;
        this.modal = {};
      }
    },
  },
};
</script>