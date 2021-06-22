<template >
  <div>
    <CRow>
      <CCol col="4">
        <CCard>
          <CCardHeader
            ><strong style="color: #321fdb">Destination</strong></CCardHeader
          >
          <CCardBody>
            <CInputRadioGroup
              name="destination"
              :options="[
                { value: '-my-', label: 'My files' },
                { value: '-shared-', label: 'Shared file' },
                { value: '-root-', label: 'Repository' },
              ]"
              :checked.sync="destination"
              custom
            />
          </CCardBody>
        </CCard>
      </CCol>

      <CCol>
        <CCard>
          <CCardHeader
            ><strong style="color: #321fdb">Path</strong></CCardHeader
          >
          <CCardBody>
            <CInput
              horizontal
              label="ค้นหา"
              placeholder="พิมพ์ข้อความเพื่อค้นหา"
              v-model.lazy="keyword"
              @keyup="search"
            />
            <v-tree
              ref="tree"
              @node-select="setSelectDestination"
              :data="list"
              :radio="true"
              style="height: 200px; overflow: auto"
            />
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
    <CButton
      :color="button.color ? button.color : 'primary'"
      style="width: 100%"
      :disabled="!selectedDestination"
      @click="onComplete(selectedDestination)"
      >{{ button.label }}</CButton
    >
    <CElementCover :opacity="0.8" v-show="isLoaded" style="z-index: 9999" />
  </div>
</template>

<script>
import "vue-tree-halower/dist/halower-tree.min.css";
import { VTree, VSelectTree } from "vue-tree-halower";

const arrayToTree = require("array-to-tree");
export default {
  props: {
    button: {
      type: Object,
      default: function () {
        return {
          label: "Confirm",
          color: "primary",
        };
      },
    },
    onComplete: {
      type: Function,
      default: function () {
        return true;
      },
    },
    operation: {
      type: String,
      default: "create",
    },
    from: {
      type: Object,
      default: function () {
        return {
          selected: "",
          destination: "",
        };
      },
    },
  },
  components: {
    VTree,
    VSelectTree,
  },
  created() {
    this.getDestinationList();
  },
  watch: {
    destination: function () {
      this.getDestinationList();
    },
  },
  data() {
    return {
      destination: "-my-",

      isLoaded: false,

      list: [],

      selectedDestination: null,

      keyword: "",
    };
  },
  methods: {
    setSelectDestination() {
      let selected =
        this.$refs.tree.getSelectedNodes().length != 0
          ? this.$refs.tree.getSelectedNodes()[0]
          : null;
      if (selected) {
        selected.path.name += "/" + selected.title;
      }
      this.selectedDestination = selected;
    },
    async getDestinationList() {
      try {
        this.isLoaded = true;
        const rootPath = await this.$http.get(
          `${process.env.VUE_APP_ALFRESCO_API}alfresco/versions/1/nodes/${this.destination}?include=allowableOperations,path`
        );
        this.list = [];
        this.list.push({
          id: rootPath.data.entry.id,
          title: rootPath.data.entry.name,
          pid: rootPath.data.entry.parentId,
          path: rootPath.data.entry.path,

          selDisabled: this.checkPermission(rootPath.data.entry),

          expanded: true,
        });

        let hasMoreItems = false,
          maxItems = 1000,
          skipCount = 0;

        do {
          const { data } = await this.$http.post(
            `${process.env.VUE_APP_ALFRESCO_API}search/versions/1/search`,
            {
              query: {
                query: `SELECT * FROM cmis:folder WHERE IN_TREE('${rootPath.data.entry.id}')`,
                language: "cmis",
              },
              include: ["path", "allowableOperations"],
              paging: {
                maxItems,
                skipCount,
              },
            }
          );
          data.list.entries.forEach((element) => {
            this.list.push({
              id: element.entry.id,
              title: element.entry.name,
              pid: element.entry.parentId,
              path: element.entry.path,

              selDisabled: this.checkPermission(element.entry),
            });
          });

          hasMoreItems = data.list.pagination.hasMoreItems;
          skipCount += maxItems;
        } while (hasMoreItems);

        this.list = arrayToTree(this.list, {
          parentProperty: "pid",
        });
        this.list.splice(1, this.list.length);

        this.selectedDestination = null;
        this.isLoaded = false;
      } catch (error) {
        this.isLoaded = false;
      }
    },
    checkPermission(element) {
      let allowableOperations = true;
      if (element.hasOwnProperty("allowableOperations")) {
        allowableOperations =
          element.allowableOperations.indexOf(this.operation) == -1;
      }
      return (
        allowableOperations ||
        this.from.destination == element.id ||
        this.from.selected == element.id
      );
    },
    search() {
      this.$refs.tree.searchNodes(this.keyword);
    },
  },
};
</script>