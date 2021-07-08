<template>
  <CFooter :fixed="false">
    <div>
      <span class="ml-1">
        &copy; {{ new Date().getFullYear() }} IV Soft Co., Ltd.
      </span>
    </div>
  </CFooter>
</template>

<script>
export default {
  name: "TheFooter",
};
</script>
