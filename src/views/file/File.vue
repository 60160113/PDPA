<template>
  <div>
    <CCard>
      <CCardHeader>
        <strong style="color: #321fdb">{{ currentFolder.name }}</strong>
      </CCardHeader>
      <CCardBody>
        <CRow class="align-items-center">
          <CCol> {{ list }} </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  </div>
</template>

<script>
export default {
  created() {
    if (this.$route.params.hasOwnProperty("id")) {
      this.getList(this.$route.params.id);
    } else {
      switch (this.$route.name) {
        case "My Files":
          this.getList("-my-");
          break;
        case "Shared Files":
          this.getList("-shared-");
          break;
        default:
          this.getList("-root-");
          break;
      }
    }
  },
  data() {
    return {
      list: [],
      currentFolder: {
        id: "",
        name: "Loading...",
        path: {
          name: "",
        },
      },
    };
  },
  methods: {
    async getList(nodeId) {
      const currentFolder = await this.$http.get(
        `${process.env.VUE_APP_ALFRESCO_API}alfresco/versions/1/nodes/${nodeId}?include=allowableOperations,path,properties`
      );
      this.currentFolder = await currentFolder.data.entry;
      this.list = [];
      let isMoreItems = false,
        maxItems = 1000,
        skipCount = 0;
      do {
        const response = await this.$http.get(
          `${process.env.VUE_APP_ALFRESCO_API}alfresco/versions/1/nodes/${nodeId}/children?maxItems=${maxItems}&skipCount=${skipCount}&include=properties,allowableOperations`
        );
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
          this.list.push(e.entry);
        });
        isMoreItems = await response.data.list.pagination.hasMoreItems;
        skipCount += maxItems;
      } while (isMoreItems);
    },
  },
};
</script>