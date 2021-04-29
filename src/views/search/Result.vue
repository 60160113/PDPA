<template>
  <div>
    <CRow>
      <!-- Filter Column -->
      <CCol col="4">
        <CCard>
          <CCardHeader>
            <strong style="color: #321fdb">ฟิลเตอร์</strong>
          </CCardHeader>
          <CCardBody>
            <div>
              <!-- Creator Filter -->
              <CCard class="mb-0">
                <CButton
                  block
                  class="card-header"
                  @click="accordion = accordion === 0 ? false : 0"
                >
                  <h5 class="m-0">ผู้สร้าง</h5>
                </CButton>
                <CCollapse :show="accordion === 0">
                  <CCardBody>
                    <CListGroup>
                      <CListGroupItem
                        :key="index"
                        v-for="(data, index) in creatorList"
                      >
                        <CInputCheckbox
                          name="filterCreator"
                          @change="filter"
                          inline
                          custom
                          :label="data.displayName"
                          :value="data.id"
                        />
                      </CListGroupItem>
                    </CListGroup>
                  </CCardBody>
                </CCollapse>
              </CCard>
              <br />
              <!-- File Type Filter -->
              <div v-show="query.indexOf('cmis:document') !== -1">
                <CCard class="mb-0">
                  <CButton
                    block
                    class="card-header"
                    @click="accordion = accordion === 1 ? false : 1"
                  >
                    <h5 class="m-0">Mime type</h5>
                  </CButton>
                  <CCollapse :show="accordion === 1">
                    <CCardBody>
                      <CListGroup>
                        <CListGroupItem
                          :key="index"
                          v-for="(data, index) in fileTypeList"
                        >
                          <CInputCheckbox
                            name="filterFileType"
                            @change="filter"
                            inline
                            custom
                            :label="data.mimeTypeName"
                            :value="data.mimeType"
                          />
                        </CListGroupItem>
                      </CListGroup>
                    </CCardBody>
                  </CCollapse>
                </CCard>
                <br />
              </div>
              <!-- Created Filter -->
              <CCard class="mb-0">
                <CButton
                  block
                  class="card-header"
                  @click="accordion = accordion === 2 ? false : 2"
                >
                  <h5 class="m-0">วันที่สร้าง</h5>
                </CButton>
                <CCollapse :show="accordion === 2">
                  <CCardBody>
                    <CListGroup>
                      <CListGroupItem
                        :key="index"
                        v-for="(data, index) in createdList"
                      >
                        <CInputCheckbox
                          name="filterCreated"
                          @change="filter"
                          inline
                          custom
                          :label="data.text"
                          :value="data"
                        />
                      </CListGroupItem>
                    </CListGroup>
                  </CCardBody>
                </CCollapse>
              </CCard>
              <br />
              <!-- Modifier Filter -->
              <CCard class="mb-0">
                <CButton
                  block
                  class="card-header"
                  @click="accordion = accordion === 3 ? false : 3"
                >
                  <h5 class="m-0">ผู้แก้ไข</h5>
                </CButton>
                <CCollapse :show="accordion === 3">
                  <CCardBody>
                    <CListGroup>
                      <CListGroupItem
                        :key="index"
                        v-for="(data, index) in modifierList"
                      >
                        <CInputCheckbox
                          name="filterModifier"
                          @change="filter"
                          inline
                          custom
                          :label="data.displayName"
                          :value="data.id"
                        />
                      </CListGroupItem>
                    </CListGroup>
                  </CCardBody>
                </CCollapse>
              </CCard>
              <br />
              <!-- Modified Filter -->
              <CCard class="mb-0">
                <CButton
                  block
                  class="card-header"
                  @click="accordion = accordion === 4 ? false : 4"
                >
                  <h5 class="m-0">วันที่แก้ไข</h5>
                </CButton>
                <CCollapse :show="accordion === 4">
                  <CCardBody>
                    <CListGroup>
                      <CListGroupItem
                        :key="index"
                        v-for="(data, index) in modifiedList"
                      >
                        <CInputCheckbox
                          name="filterModified"
                          @change="filter"
                          inline
                          custom
                          :label="data.text"
                          :value="data"
                        />
                      </CListGroupItem>
                    </CListGroup>
                  </CCardBody>
                </CCollapse>
              </CCard>
            </div>
            <hr />
            <CButton color="primary" style="width: 100%" @click="resetFilter()"
              >รีเซ็ต</CButton
            >
          </CCardBody>
        </CCard>
      </CCol>

      <!-- Table Column -->
      <CCol>
        <CCard>
          <CCardHeader>
            <strong style="color: #321fdb">ผลลัพธ์การค้นหา</strong>
          </CCardHeader>
          <CCardBody>
            <CDataTable
              :items="resultList"
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
              hover
              striped
              border
              pagination
              cleaner
            >
              <template #name="{ item }">
                <td style="cursor: pointer">
                  <CRow>
                    <CCol md="2">
                      <CIcon
                        height="42"
                        :name="item.isFile ? 'cil-file' : 'cil-folder'"
                      />
                    </CCol>
                    <CCol>
                      {{ item.name }} {{ item.title }}

                      <br />
                      Description: {{ item.description }}
                    </CCol>
                  </CRow>
                </td>
              </template>
            </CDataTable>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
    <CElementCover :opacity="0.8" v-show="isLoaded" />
  </div>
</template>
<script>
const fields = [
  { key: "name", label: "Name", _style: "min-width:40%" },
  { key: "modifiedAt", label: "Modified Date", _style: "min-width:20%;" },
];

export default {
  props: {
    query: {
      type: String,
      default: "",
    },
  },
  async created() {
    if (this.query != "") {
      this.isLoaded = true;
      let isMoreItems = false,
        maxItems = 1000,
        skipCount = 0;

      do {
        const data = {
          query: {
            query: this.query,
            language: "cmis",
          },
          paging: {
            maxItems,
            skipCount,
          },
          include: ["path", "properties"],
        };
        const response = await this.$http.post(
          `${process.env.VUE_APP_ALFRESCO_API}search/versions/1/search`,
          data
        );
        this.searchResponse.push(
          ...response.data.list.entries.map((obj) => {
            let data = obj.entry;
            if (data.hasOwnProperty("properties")) {
              Object.assign(data, {
                title: data.properties.hasOwnProperty("cm:title")
                  ? `(${data["properties"]["cm:title"]})`
                  : "",
                description: data.properties.hasOwnProperty("cm:description")
                  ? data["properties"]["cm:description"]
                  : "-",
              });
            } else {
              Object.assign(data, {
                title: "",
                description: "-",
              });
            }
            data.modifiedAt = new Date(data.modifiedAt).toLocaleDateString(
              "th-TH"
            );

            return data;
          })
        );
        isMoreItems = await response.data.list.pagination.hasMoreItems;
        skipCount += maxItems;
      } while (isMoreItems);

      this.resultList = this.searchResponse;
      this.isLoaded = false;
    } else {
      this.$router.push("/search");
    }

    this.refreshFilter();
  },
  data() {
    return {
      fields,
      accordion: false,

      resultList: [],

      creatorList: [],
      fileTypeList: [],
      modifierList: [],
      createdList: [],
      modifiedList: [],

      searchResponse: [],

      isLoaded: false,
    };
  },
  methods: {
    async refreshFilter() {
      const currentDate = new Date();
      const d = new Date();
      const lastSixMonths = new Date(d.setMonth(d.getMonth() - 6));
      // Created By //
      this.creatorList = [
        ...new Map(
          this.resultList.map((item) => [
            item.createdByUser.id,
            item.createdByUser,
          ])
        ).values(),
      ];
      // Modified By //
      this.modifierList = [
        ...new Map(
          this.resultList.map((item) => [
            item.modifiedByUser.id,
            item.modifiedByUser,
          ])
        ).values(),
      ];
      // Created //
      const filterCreated = await document.querySelector(
        "input[name='filterCreated']:checked"
      );
      if (filterCreated) {
        this.createdList = this.createdList.filter(
          (item) => item.text === filterCreated.value.text
        );
      } else {
        this.createdList = [];
        if (
          this.resultList.find(
            (item) =>
              new Date(item.createdAt).getMonth() === currentDate.getMonth()
          )
        ) {
          this.createdList.push({
            text: "This month",
            value: {
              from: `${currentDate.getFullYear()}-${
                Number(currentDate.getMonth()) + 1
              }-01`,
              to: `${currentDate.getFullYear()}-${
                Number(currentDate.getMonth()) + 1
              }-${new Date(
                currentDate.getFullYear(),
                currentDate.getMonth() + 1,
                0
              ).getDate()}`,
            },
          });
        }

        if (
          this.resultList.find(
            (item) =>
              new Date(item.createdAt).getMonth() >= currentDate.getMonth() - 6
          )
        ) {
          this.createdList.push({
            text: "Last 6 months",
            value: {
              from: `${lastSixMonths.getFullYear()}-${
                lastSixMonths.getMonth() + 1
              }-01`,
              to: `${lastSixMonths.getFullYear()}-${
                lastSixMonths.getMonth() + 1
              }-${new Date(
                lastSixMonths.getFullYear(),
                lastSixMonths.getMonth() + 1,
                0
              ).getDate()}`,
            },
          });
        }

        if (
          this.resultList.find(
            (item) =>
              new Date(item.createdAt).getFullYear() ===
              currentDate.getFullYear()
          )
        ) {
          this.createdList.push({
            text: "This year",
            value: {
              from: `${currentDate.getFullYear()}-01-01`,
              to: `${currentDate.getFullYear()}-12-31`,
            },
          });
        }
      }

      // Modified //
      const filterModified = await document.querySelector(
        "input[name='filterModified']:checked"
      );
      if (filterModified) {
        this.modifiedList = this.modifiedList.filter(
          (item) => item.text === filterModified.value.text
        );
      } else {
        this.modifiedList = [];
        if (
          this.resultList.find(
            (item) =>
              new Date(item.modifiedAt).getMonth() === currentDate.getMonth()
          )
        ) {
          this.modifiedList.push({
            text: "This month",
            value: {
              from: `${currentDate.getFullYear()}-${
                Number(currentDate.getMonth()) + 1
              }-01`,
              to: `${currentDate.getFullYear()}-${
                Number(currentDate.getMonth()) + 1
              }-${new Date(
                currentDate.getFullYear(),
                currentDate.getMonth() + 1,
                0
              ).getDate()}`,
            },
          });
        }

        if (
          this.resultList.find(
            (item) =>
              new Date(item.modifiedAt).getMonth() >= currentDate.getMonth() - 6
          )
        ) {
          this.modifiedList.push({
            text: "Last 6 months",
            value: {
              from: `${lastSixMonths.getFullYear()}-${
                lastSixMonths.getMonth() + 1
              }-01`,
              to: `${lastSixMonths.getFullYear()}-${
                lastSixMonths.getMonth() + 1
              }-${new Date(
                lastSixMonths.getFullYear(),
                lastSixMonths.getMonth() + 1,
                0
              ).getDate()}`,
            },
          });
        }

        if (
          this.resultList.find(
            (item) =>
              new Date(item.modifiedAt).getFullYear() ===
              currentDate.getFullYear()
          )
        ) {
          this.modifiedList.push({
            text: "This year",
            value: {
              from: `${currentDate.getFullYear()}-01-01`,
              to: `${currentDate.getFullYear()}-12-31`,
            },
          });
        }
      }

      if (this.query.indexOf("cmis:document") !== -1) {
        // Type //
        this.fileTypeList = [
          ...new Map(
            this.resultList.map((item) => [item.content.mimeType, item.content])
          ).values(),
        ];
      }
    },
    async filter() {
      this.resultList = this.searchResponse;

      // Creator //
      const filterCreator = await document.querySelector(
        "input[name='filterCreator']:checked"
      );

      if (filterCreator) {
        this.resultList = this.resultList.filter((item) => {
          return item.createdByUser.id == filterCreator.value;
        });
      }

      // file Type //
      const filterFileType = await document.querySelector(
        "input[name='filterFileType']:checked"
      );

      if (filterFileType) {
        this.resultList = this.resultList.filter((item) => {
          return item.content.mimeType == filterFileType.value;
        });
      }

      // Modifier //
      const filterModifier = await document.querySelector(
        "input[name='filterModifier']:checked"
      );

      if (filterModifier) {
        this.resultList = this.resultList.filter((item) => {
          return item.modifiedByUser.id == filterModifier.value;
        });
      }

      // Created //
      // const filterCreated = await document.querySelector(
      //   "input[name='filterCreated']:checked"
      // );

      // if (filterCreated) {
      //   let arr = [];
      //   for (let index = 0; index < this.resultList.length; index++) {
      //     if (
      //       new Date(this.resultList[index].createdAt) >=
      //         new Date(filterCreated.value.value.from) &&
      //       new Date(this.resultList[index].createdAt) <=
      //         new Date(filterCreated.value.value.to)
      //     ) {
      //       arr.push(this.resultList[index]);
      //     }
      //   }
      //   this.resultList = arr;
      // }

      // Modified //
      // const filterModified = await document.querySelector(
      //   "input[name='filterModified']:checked"
      // );

      // if (filterModified) {
      //   let arr = [];
      //   for (let index = 0; index < this.resultList.length; index++) {
      //     if (
      //       new Date(this.resultList[index].modifiedAt) >=
      //         new Date(filterModified.value.value.from) &&
      //       new Date(this.resultList[index].modifiedAt) <=
      //         new Date(filterModified.value.value.to)
      //     ) {
      //       arr.push(this.resultList[index]);
      //     }
      //   }
      //   this.resultList = arr;
      // }

      this.refreshFilter();
    },
    resetFilter() {
      this.resultList = this.searchResponse;
      this.refreshFilter();
    },
  },
};
</script>