<template>
  <div>
    <CCard>
      <CCardHeader>
        <strong class="text-primary">ร้องขอข้อมูล</strong>
      </CCardHeader>

      <CCardBody>
        <b style="font-size: 16px" class="text-primary">ข้อมูล</b>
        <CRow class="mt-3">
          <CCol col="2">
            <label style="margin-top: 5px">
              ขอเอกสาร&nbsp;
              <b style="color: red">*</b>
            </label>
          </CCol>
          <CCol>
            <v-select
              v-model="dataType"
              :options="dataTypeOptions"
              :reduce="(item) => item.id"
              label="name"
              placeholder="กรุณาเลือก"
            />
          </CCol>
        </CRow>

        <CInputRadioGroup
          class="mt-3"
          :options="[
            { value: 'individual', label: 'รายบุคคล' },
            {
              value: 'department',
              label: 'แผนก',
            },
          ]"
          custom
          inline
        />

        <CRow class="mt-3" v-if="dataType">
          <CCol col="2">
            <label style="margin-top: 5px">
              ชื่อพนักงาน&nbsp;
              <b style="color: red">*</b>
            </label>
          </CCol>
          <CCol>
            <CMultiSelect
              v-if="documentOptions.length != 0"
              :options="documentOptions"
              :search="true"
              @update="
                (value) => {
                  personalData.documents = value;
                }
              "
            />
          </CCol>
        </CRow>

        <div class="mt-3">
          <CInputCheckbox
            class="mb-2"
            :key="index"
            v-for="(item, index) in documentTypeOptions"
            custom
            :label="item.label"
            :value="item.value"
          />
        </div>
      </CCardBody>
    </CCard>

    <CElementCover :opacity="0.7" v-show="loading" />
  </div>
</template>

<script>
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";

export default {
  components: {
    vSelect,
  },
  async created() {
    this.dataTypeOptions = await this.getNodeChildrenById(
      process.env.VUE_APP_PERSONAL_DATA_FOLDER,
      { where: "(isFolder=true)", fields: "name,id" }
    );
    this.$http
      .get(`${process.env.VUE_APP_PDPA_SERVICES}data/document_type`)
      .then((res) => {
        this.documentTypeOptions = res.data;
      });
  },
  watch: {
    dataType: async function (id) {
      if (id) {
        this.documentOptions = await this.getNodeChildrenById(id, {
          where: "(isFolder=true)",
          fields: "name,id",
        });
        this.documentOptions = this.documentOptions.map((item) => {
          return {
            value: item,
            text: item.name,
          };
        });
      } else {
        this.documentOptions = [];
      }
    },
  },
  data() {
    return {
      personalData: {
        requester: {
          id: this.$store.state.user.userId,
          name: this.$store.state.user.displayName,
        },
        documents: [],
      },

      dataType: null,
      dataTypeOptions: [],

      documentOptions: [],

      documentTypeOptions: [],

      loading: false,
    };
  },
  methods: {
    async getNodeChildrenById(id, query = {}) {
      try {
        let hasMoreItems = false;
        const maxItems = 1000;
        let skipCount = 0;
        let arr = [];

        do {
          const res = await this.$http({
            method: "get",
            url: `${process.env.VUE_APP_ALFRESCO_API}alfresco/versions/1/nodes/${id}/children`,
            params: {
              maxItems,
              skipCount,
              ...query,
            },
          });

          arr.push(...res.data.list.entries.map((item) => item.entry));

          hasMoreItems = res.data.list.pagination.hasMoreItems;
          skipCount += maxItems;
        } while (hasMoreItems);

        return arr;
      } catch (error) {
        return [];
      }
    },
  },
};
</script>