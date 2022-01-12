<template>
  <div>
    <CDataTable
      :items="files"
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
      hover
      striped
      border
      pagination
    >
      <template #modifiedAt="{ item }">
        <td>
          {{ new Date(item.modifiedAt).toLocaleDateString() }}
          {{ new Date(item.modifiedAt).toLocaleTimeString() }}
        </td>
      </template>
      <template #actions="{ item }">
        <td>
          <CButton color="danger" @click="removeFile(item.id)">ลบ</CButton>
        </td>
      </template>
    </CDataTable>
  </div>
</template>

<script>
export default {
  props: {
    id: {
      type: String,
      default: "",
    },
  },
  async created() {
    this.files = await this.getFiles(this.id);
  },
  data() {
    return {
      files: [],

      fields: [
        { key: "name", label: "ชื่อไฟล์", _style: "width:60%" },
        { key: "modifiedAt", label: "วันที่", _style: "width:30%;" },
        { key: "actions", label: "", _style: "width:10%;" },
      ],

      loading: false,
    };
  },
  methods: {
    async getFiles(id) {
      try {
        var hasMoreItems = false;
        const maxItems = 1000;
        var skipCount = 0;
        var arr = [];

        this.loading = true;
        do {
          const res = await this.$http.get(
            `${process.env.VUE_APP_ALFRESCO_API}alfresco/versions/1/nodes/${id}/children?maxItems=${maxItems}&skipCount=${skipCount}&include=properties,allowableOperations`
          );
          arr.push(...res.data.list.entries.map((item) => item.entry));

          hasMoreItems = res.data.list.pagination.hasMoreItems;
          skipCount += maxItems;

          if (res.data.list.pagination.count <= 0) {
            hasMoreItems = false;
          }
        } while (hasMoreItems);
        this.loading = false;
        return arr;
      } catch (error) {
        this.loading = false;
      }
    },
    removeFile(id) {
      this.$http
        .delete(
          `${process.env.VUE_APP_ALFRESCO_API}alfresco/versions/1/nodes/${id}`
        )
        .then(async () => {
          this.files = await this.getFiles(this.id);
        });
    },
  },
};
</script>