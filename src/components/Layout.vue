<style scoped>
  .rpsb-layout {
    display: flex;
    flex-direction: row;
    min-height: 100vh;
    max-height: 100vh;
    height: 100vh;
  }

  .rpsb-content {
    display: flex;
    flex: 1;
    flex-direction: column;
  }

  .rpsb-field {
    flex: 1;
    overflow: hidden;
  }

  .rpsb-float-panel {
    width: 300px;
    display: flex;
    flex-direction: column;
  }

  .rpsb-float-panel-title {
    width: 100%;
    height: 40px;
  }

  @media screen and (max-width: 600px) {
    .rpsb-layout {
      flex-direction: column;
    }
  }
</style>

<template>
  <div class="rpsb-layout">
    <div class="rpsb-content">
      <div class="rpsb-info">
        <slot name="info"/>
      </div>
      <div class="rpsb-field">
        <slot name="field"/>
      </div>
      <div class="rpsb-control-panel">
        <slot name="controls"/>
      </div>
    </div>
    <div class="rpsb-float-panel">
      <div class="rpsb-float-panel-title"></div>
      <div>
        <slot name="float"/>
      </div>
    </div>
  </div>
</template>