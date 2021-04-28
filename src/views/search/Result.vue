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

    // this.refreshFilter();
  },
  data() {
    return {
      fields,

      resultList: [],

      creatorList: [],
      fileTypeList: [],
      modifierList: [],
      createdList: [],
      modifiedList: [],

      filterCreator: [],
      filterFileType: [],
      filterModifier: [],
      filterCreated: [],
      filterModified: [],

      searchResponse: [],

      isLoaded: false,
    };
  },
};
</script>