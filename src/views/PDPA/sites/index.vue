<template>
  <div>
    <CCard>
      <CCardBody>
        <CDataTable
          :items="sites"
          :fields="fields"
          :items-per-page="5"
          :itemsPerPageSelect="{
            label: 'แสดง',
          }"
          :tableFilter="{
            label: 'ค้นหา: ',
            placeholder: 'ค้นหา',
          }"
          :loading="loading"
          :responsive="false"
          hover
          border
          pagination
        >
          <template #no-items-view>
            <div class="text-center">ไม่มีข้อมูล</div>
          </template>

          <template #over-table>
            <div class="mb-2">
              <CButton color="success" @click.prevent="modal = true">
                เพิ่ม
              </CButton>
            </div>
          </template>

          <template #title="{ item }">
            <td>
              <b>{{ item.site.title }}</b>
              <div v-if="item.site.description" class="mt-2">
                <p>คำอธิบาย: {{ item.site.description }}</p>
              </div>
            </td>
          </template>

          <template #role="{ item }">
            <td>
              {{ roleLabel(item.role) }}
            </td>
          </template>

          <template #action="{ item }">
            <td>
              <center>
                <CDropdown color="primary" toggler-text="" size="sm">
                  <template slot="toggler-content">
                    <CIcon name="cil-options" />
                  </template>
                  <CDropdownItem v-c-tooltip="'เปิด'">เปิด</CDropdownItem>
                  <CDropdownItem
                    v-c-tooltip="'ลบ'"
                    @click.prevent="removeSite(item.id)"
                    v-if="item.role == 'SiteManager'"
                    >ลบ</CDropdownItem
                  >
                  <CDropdownItem
                    v-c-tooltip="'ออก'"
                    @click.prevent="leaveSite(item.id)"
                    >ออก</CDropdownItem
                  >
                </CDropdown>
              </center>
            </td>
          </template>
        </CDataTable>
      </CCardBody>
    </CCard>

    <!-- Modal -->
    <CModal
      :show.sync="modal"
      :no-close-on-backdrop="true"
      :centered="true"
      color="success"
    >
      <CInput label="ชื่อ" v-model="form.title" />
      <CTextarea label="คำอธิบาย" v-model="form.description" />
      <template #header>
        <h6 class="modal-title">เพิ่ม</h6>
        <CButtonClose @click="modal = false" class="text-white" />
      </template>
      <template #footer>
        <CButton
          block
          :disabled="!form.title"
          color="success"
          @click.prevent="addSite()"
          >บันทึก</CButton
        >
      </template>
    </CModal>
  </div>
</template>

<script>
export default {
  created() {
    this.getSites();
  },
  data() {
    return {
      sites: [],

      form: {
        title: "",
        description: "",
        visibility: "MODERATED",
      },

      modal: false,

      loading: false,

      fields: [
        { key: "title", label: "ชื่อ", _style: "width:70%" },
        { key: "role", label: "บทบาท", _style: "width:20%;" },
        { key: "action", label: "", _style: "min-width:10%;" },
      ],
    };
  },
  methods: {
    getSites() {
      this.loading = true;
      this.$http
        .get(
          `${process.env.VUE_APP_ALFRESCO_API}alfresco/versions/1/people/-me-/sites`
        )
        .then((res) => {
          this.sites = res.data.list.entries.map((s) => s.entry);
          this.loading = false;
        })
        .catch((err) => {
          this.loading = false;
        });
    },
    removeSite(id) {
      this.$swal({
        title: "ลบ",
        text: "คุณต้องการลบรายการนี้หรือไม่?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "ตกลง",
        cancelButtonText: "ยกเลิก",
      }).then((result) => {
        if (result.isConfirmed) {
          this.$http
            .delete(
              `${process.env.VUE_APP_ALFRESCO_API}alfresco/versions/1/sites/${id}`
            )
            .then((res) => {
              this.$swal({
                title: "เสร็จสิ้น",
                text: "รายการที่เลือกถูกลบออกจากระบบ",
                icon: "success",
                showConfirmButton: false,
                timer: 1500,
              }).then(() => {
                this.getSites();
              });
            });
        }
      });
    },
    addSite() {
      this.$http
        .post(
          `${process.env.VUE_APP_ALFRESCO_API}alfresco/versions/1/sites`,
          this.form
        )
        .then((res) => {
          if (res.response) {
            this.$swal({
              title: "409",
              text: "ชื่อซ้ำ",
              icon: "error",
              showConfirmButton: false,
              timer: 1000,
            });
          } else {
            this.modal = false;
            this.$swal({
              title: "เสร็จสิ้น",
              text: "เพิ่มรายการสำเร็จ",
              icon: "success",
              showConfirmButton: false,
              timer: 1500,
            }).then(() => {
              this.getSites();
            });
          }
        })
        .catch((err) => {
          if (err.response.status == 409) {
            this.$swal({
              title: "409",
              text: "ชื่อซ้ำ",
              icon: "error",
              showConfirmButton: false,
              timer: 1000,
            });
          }
        });
    },
    leaveSite(id) {
      this.$swal({
        title: "ออก",
        text: "คุณต้องการออกจาก Site ที่เลือกหรือไม่?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "ตกลง",
        cancelButtonText: "ยกเลิก",
      }).then((result) => {
        if (result.isConfirmed) {
          this.$http
            .delete(
              `${process.env.VUE_APP_ALFRESCO_API}alfresco/versions/1/people/-me-/sites/${id}`
            )
            .then((res) => {
              this.$swal({
                title: "เสร็จสิ้น",
                text: "ออกจาก Site ที่เลือกเสร็จสิ้น",
                icon: "success",
                showConfirmButton: false,
                timer: 1500,
              }).then(() => {
                this.getSites();
              });
            });
        }
      });
    },
    roleLabel(role) {
      switch (role) {
        case "SiteConsumer":
          return "ผู้ร้องขอ";
        case "SiteCollaborator":
          return "ผู้อนุมัติ";
        case "SiteContributor":
          return "ผู้นำเข้าข้อมูล";
        case "SiteManager":
          return "ผู้จัดการ";
        default:
          return role;
      }
    },
  },
  watch: {
    modal: function (val) {
      if (!val) {
        this.form = {
          title: "",
          description: "",
          visibility: "MODERATED",
        };
      }
    },
  },
};
</script>