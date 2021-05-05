<template>
  <div>
    <CRow>
      <CCol>
        <iframe
          sandbox="allow-scripts allow-same-origin"
          :src="src"
          frameborder="0"
          style="width: 100%; height: 400px"
        />
      </CCol>
      <CCol col="4">
        <CButton color="primary">ดาวน์โหลด</CButton>
        <hr />
        <b>ชื่อไฟล์:</b> {{ properties.name }} <br />
        <b>Mime type:</b> {{ properties.content.mimeTypeName }} <br />
        <b>ขนาด:</b>
        {{ (properties.content.sizeInBytes / 1000).toFixed(2) }} KB <br />
        <b>วันที่สร้าง:</b>
        {{ new Date(properties.createdAt).toLocaleDateString("th-TH") }}
      </CCol>
    </CRow>
  </div>
</template>
<script>

export default {
  props: {
    id: String,
  },
  async created() {
    // Get properties
    const { data } = await this.$http.get(
      `${process.env.VUE_APP_ALFRESCO_API}alfresco/versions/1/nodes/${this.id}?include=allowableOperations,path`
    );

    this.properties = data.entry;

    // Preview content
    const requestUrl = `${process.env.VUE_APP_ALFRESCO_API}alfresco/versions/1/nodes/${this.id}/content?alf_ticket=${this.$store.state.user.ticket}`;

    const encodedUrl = await encodeURIComponent(requestUrl);

    this.src = `https://docs.google.com/viewerng/viewer?url=${encodedUrl}&embedded=true`;
  },
  data() {
    return {
      src: "",

      properties: {
        name: "",
        createdByUser: {
          displayName: "",
        },
        createdAt: new Date(),
        content: {
          mimeTypeName: "",
          sizeInBytes: 0,
        },
        properties: {
          "cm:versionLabel": "",
        },
      },
    };
  },
};
</script>