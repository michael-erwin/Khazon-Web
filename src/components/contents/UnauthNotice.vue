<template>
  <div slot="content" class="container">
    <PageErrorNotice>
      <span slot="title">Forbidden</span>
      <span slot="content">You don't have the necessary permissions to access this content.</span>
    </PageErrorNotice>
  </div>
</template>

<script>
  import PageErrorNotice from '@/components/contents/PageErrorNotice'
  export default {
    components: { PageErrorNotice }
  }
</script>

