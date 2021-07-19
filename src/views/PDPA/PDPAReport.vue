<template>
  <div></div>
</template>

<script>
export default {
  created() {
    this.getData()
  },
  data() {
    return {
      total: {
        pending: 0,
        approved: 0,
        disapproved: 0,
        expired: 0,
      },
    };
  },
  methods: {
    getData() {
      this.$http
        .get(`${process.env.VUE_APP_PDPA_SERVICES}personal_data`)
        .then((res) => {
          console.log(res.data);
        });
    },
  },
};
</script>