<template>
  <div>
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
      :checked.sync="selectType"
    />

    <CRow class="mt-3" v-if="dataType">
      <CCol col="2">
        <label style="margin-top: 5px">
          {{ selectType == "individual" ? "รายบุคคล" : "แผนก" }}&nbsp;
          <b style="color: red">*</b>
        </label>
      </CCol>
      <CCol>
        <div
          :style="`display: ${selectType == 'individual' ? 'inline' : 'none'}`"
        >
          <CMultiSelect
            v-if="documentOptions.length != 0"
            :options="documentOptions"
            :search="true"
            @update="
              (value) => {
                documents = value;
              }
            "
          />
        </div>
        <div
          :style="`display: ${selectType == 'department' ? 'inline' : 'none'}`"
        >
          <CMultiSelect
            v-if="departmentOptions.length != 0"
            :options="departmentOptions"
            :search="true"
            @update="
              (value) => {
                departments = value;
              }
            "
          />
        </div>
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
        @update:checked="
          () => {
            const index = documentTypes.indexOf(item.value);
            index !== -1
              ? documentTypes.splice(index, 1)
              : documentTypes.push(item.value);
          }
        "
      />
    </div>

    <CButton
      @click="request"
      block
      color="primary"
      class="mt-3"
      :disabled="
        documentTypes.length == 0 ||
        (selectType == 'individual'
          ? documents.length == 0
          : departments.length == 0)
      "
      >บันทึก</CButton
    >

    <CElementCover :opacity="0.7" v-show="loading" />
  </div>
</template>

<script>
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";

export default {
  props: {
    onComplete: {
      type: Function,
      default: function () {
        return true;
      },
    },
  },
  components: {
    vSelect,
  },
  async created() {
    this.dataTypeOptions = await this.getNodeChildren(
      process.env.VUE_APP_PERSONAL_DATA_FOLDER,
      { where: "(isFolder=true)", fields: "name,id" }
    );
    this.departmentOptions = await this.getChildren(
      `${process.env.VUE_APP_ALFRESCO_API}alfresco/versions/1/groups/GROUP_PDPA/members`,
      { where: "(memberType='GROUP')" }
    );
    this.departmentOptions = this.departmentOptions.map((item) => {
      return {
        value: item.id,
        text: item.displayName,
      };
    });
    this.$http
      .get(`${process.env.VUE_APP_PDPA_SERVICES}data/document_type`)
      .then((res) => {
        this.documentTypeOptions = res.data;
      });
  },
  watch: {
    dataType: async function (value) {
      if (value) {
        this.requestData.name = value.name;
        this.documentOptions = await this.getNodeChildren(value.id, {
          where: "(isFolder=true)",
          include: "properties",
          fields: "name,id,properties",
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
      requestData: {
        requester: {
          id: this.$store.state.user.userId,
          name: this.$store.state.user.displayName,
        },
        documents: [],
        name: "",
      },

      // ขอเอกสาร
      dataType: null,
      dataTypeOptions: [],

      // ชื่อพนักงาน
      documentOptions: [],
      documents: [],

      // เอกสาร
      documentTypeOptions: [],
      documentTypes: [],

      loading: false,

      selectType: "individual",

      departmentOptions: [],
      departments: [],
    };
  },
  methods: {
    async getChildren(url, query = {}) {
      try {
        let hasMoreItems = false;
        const maxItems = 1000;
        let skipCount = 0;
        let arr = [];

        do {
          const res = await this.$http({
            method: "get",
            url: url,
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
    async getNodeChildren(id, query = {}) {
      try {
        var arr = await this.getChildren(
          `${process.env.VUE_APP_ALFRESCO_API}alfresco/versions/1/nodes/${id}/children`,
          query
        );
        return arr;
      } catch (error) {
        return [];
      }
    },
    async request() {
      try {
        this.loading = true;
        this.requestData.documents = [];

        var documentList = [];

        if (this.selectType == "individual") {
          documentList = this.documents;
        } else {
          const res = await this.getNodeChildren(this.dataType.id, {
            where: "(isFolder=true)",
            include: "properties",
            fields: "name,id,properties",
          });
          documentList = res.filter(
            (item) =>
              this.departments.indexOf(item.properties["op:groupId"]) != -1
          );
        }
        documentList.forEach(async (item, index) => {
          const res = await this.getNodeChildren(item.id, {
            where: "(isFile=true)",
            include: "properties",
            fields: "name,id,properties",
          });
          this.requestData.documents.push(
            ...res
              .filter(
                (element) =>
                  this.documentTypes.indexOf(element.properties["op:type"]) !=
                  -1
              )
              .map((element) => {
                return {
                  parent: {
                    id: item.id,
                    name: item.name,
                    group: item.properties["op:groupId"] || "",
                    owner: item.properties["op:ownerId"] || "",
                  },
                  name: element.name,
                  id: element.id,
                  type: element.properties["op:type"],
                };
              })
          );

          if (index == documentList.length - 1) {
            await this.$http
              .post(
                `${process.env.VUE_APP_PDPA_SERVICES}data/request`,
                this.requestData
              )
              .then(() => {
                this.loading = false;
                this.onComplete();
              })
              .catch((err) => {
                this.loading = false;
              });
          }
        });
      } catch (error) {
        this.loading = false;
      }
    },
  },
};
</script>