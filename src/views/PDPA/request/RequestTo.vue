<template>
  <div>
    <CInput horizontal label="เอกสารที่ต้องการขอ" v-model="requestData.name" />
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
      :checked.sync="assignType"
    />

    <CRow class="mt-3">
      <CCol col="2">
        <label style="margin-top: 5px"> Assign To </label>
      </CCol>
      <CCol>
        <CMultiSelect
          v-if="peopleOptions.length != 0"
          :style="`display: ${assignType == 'individual' ? 'inline' : 'none'}`"
          :options="peopleOptions"
          :search="true"
          @update="
            (value) => {
              assignTo = value;
            }
          "
        />
        <CMultiSelect
          v-if="groupOptions.length != 0"
          :style="`display: ${assignType == 'department' ? 'inline' : 'none'}`"
          :options="groupOptions"
          :search="true"
          @update="
            (value) => {
              assignTo = value;
            }
          "
        />
      </CCol>
    </CRow>

    <CRow class="mt-3">
      <CCol col="2">
        <label style="margin-top: 6px">ขอเอกสารภายในวันที่: </label>
      </CCol>
      <CCol>
        <v-date-picker
          :min-date="new Date()"
          mode="date"
          :masks="{
            input: 'DD/MM/YYYY',
          }"
          v-model="requestData.deadline"
        />
      </CCol>
    </CRow>
    <CRow class="mt-3">
      <CCol col="2">
        <label style="margin-top: 6px">ใช้งานถึงวันที่: </label>
      </CCol>
      <CCol>
        <v-date-picker
          :min-date="new Date()"
          mode="date"
          :masks="{
            input: 'DD/MM/YYYY',
          }"
          v-model="requestData.expiredAt"
        />
      </CCol>
    </CRow>

    <CButton
      block
      color="primary"
      class="mt-3"
      @click="request"
      :disabled="
        assignTo.length == 0 ||
        requestData.name == '' ||
        requestData.deadline == null ||
        requestData.expiredAt == null
      "
      >บันทึก</CButton
    >

    <CElementCover :opacity="0.7" v-show="loading" />
  </div>
</template>

<script>
import { DatePicker } from "v-calendar";

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
    "v-date-picker": DatePicker,
  },
  async created() {
    this.peopleOptions = await this.getChildren(
      `${process.env.VUE_APP_ALFRESCO_API}alfresco/versions/1/groups/GROUP_PDPA/members`,
      { where: "(memberType='PERSON')" }
    );
    this.peopleOptions = this.peopleOptions.map((item) => {
      return {
        value: {
          id: item.id,
          displayName: item.displayName,
        },
        text: item.displayName,
      };
    });
    this.groupOptions = await this.getChildren(
      `${process.env.VUE_APP_ALFRESCO_API}alfresco/versions/1/groups/GROUP_PDPA/members`,
      { where: "(memberType='GROUP')" }
    );
    this.groupOptions = this.groupOptions.map((item) => {
      return {
        value: item.id,
        text: item.displayName,
      };
    });
  },
  data() {
    return {
      requestData: {
        name: "",

        type: "specific",
        requester: {
          id: this.$store.state.user.userId,
          name: this.$store.state.user.displayName,
        },

        folder: "",
        assignTo: [],
        deadline: null,
        expiredAt: null,
      },

      assignType: "individual",

      peopleOptions: [],
      groupOptions: [],

      assignTo: [],

      loading: false,
    };
  },
  methods: {
    async request() {
      try {
        this.loading = true;
        if (this.assignType == "individual") {
          this.requestData.assignTo = this.assignTo;
        } else {
          await this.assignTo.forEach(async (element) => {
            const people = await this.getChildren(
              `${process.env.VUE_APP_ALFRESCO_API}alfresco/versions/1/groups/${element}/members`,
              { where: "(memberType='PERSON')" }
            );
            this.requestData.assignTo.push(
              ...people.map((item) => {
                return {
                  id: item.id,
                  displayName: item.displayName,
                };
              })
            );
          });
        }

        const folder = await this.$http.post(
          `${process.env.VUE_APP_ALFRESCO_API}alfresco/versions/1/nodes/${process.env.VUE_APP_PUBLISHED_DATA_FOLDER}/children?autoRename=true`,
          {
            name: `ร้องขอข้อมูล${this.requestData.name}_โดย_${this.requestData.requester.name}`,
            nodeType: "cm:folder",
          }
        );
        this.requestData.folder = folder.data.entry.id;

        await this.$http.post(
          `${process.env.VUE_APP_PDPA_SERVICES}data/request_data`,
          this.requestData
        );
        this.loading = false;

        this.onComplete();
      } catch (error) {
        this.loading = false;
      }

      //   console.log(this.requestData);
    },
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
  },
};
</script>