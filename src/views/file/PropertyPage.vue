<template>
  <CCard>
    <CCardHeader>
      <strong class="text-primary">รายละเอียด</strong>
    </CCardHeader>
    <CCardBody>
      <Properties :id="$route.params.id" />
    </CCardBody>
  </CCard>
</template>

<script>
import Properties from "@/views/file/Properties.vue";
export default {
  components: {
    Properties,
  },
};
</script>