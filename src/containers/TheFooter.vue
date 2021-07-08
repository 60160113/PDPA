<template>
  <CFooter :fixed="false">
    <div>
      <span class="ml-1">
        &copy; {{ new Date().getFullYear() }}
        <a href="http://www.ivsoft.co.th/" target="_blank">IV Soft Co., Ltd.</a>
      </span>
    </div>
  </CFooter>
</template>

<script>
export default {
  name: "TheFooter",
};
</script>
