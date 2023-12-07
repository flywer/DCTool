<template>
  <n-modal
      v-model:show="_show"
      :mask-closable="true"
      :closable="true"
      preset="card"
      role="card"
      :show-icon="false"
      :title="tableName"
      :size="'small'"
      style="width: calc(100vw - 100px);"
  >

    <n-data-table
        style="overflow: auto"
        class="mt-2 mb-2"
        :key="(row) => row.id"
        :columns="previewColsRef"
        :data="previewTableDataRef"
        :bordered="true"
        :size="'small'"
        :striped="true"
        :loading="isLoading"
        :max-height="450"
    />

  </n-modal>
</template>

<script setup lang="ts">
import {DC_Datasource} from "@common/types/datacenter/common";
import {table_preview} from "@render/api/datacenter.api";
import {onMounted, ref, watch} from "vue";

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
    default: false
  },
  tableName: {
    type: String,
    required: true
  },
  datasourceId: {
    type: Object as () => DC_Datasource,
    required: true
  },
})

const emit = defineEmits(['update:show', 'onAfterLeave'])

const _show = ref(false)

onMounted(() => {
  _show.value = props.show
})

watch(() => props.show, (v) => {
  _show.value = v
})

watch(_show, (v) => {
  if (v) {
    tablePreview(props.datasourceId, props.tableName)
  }
  emit('update:show', v)
})

const previewColsRef = ref([])

const previewTableDataRef = ref([])

const isLoading = ref(false)
const tablePreview = (datasourceId: DC_Datasource, tableName: string) => {
  previewColsRef.value = []
  previewTableDataRef.value = []

  isLoading.value = true

  table_preview(datasourceId, tableName)
      .then(res => {
        if (res.code == 200) {
          if (res.data && res.data.length != 0) {

            // 创建表头
            previewColsRef.value = res.data[0].map((col: any) => ({
              title: col,
              key: col,
              // fixed: key.split('.')[1] === 'id' ? 'left' : false
              width: '200px',
              ellipsis: {
                tooltip: true
              }
            }));

            // 处理数据
            previewTableDataRef.value = res.data.slice(1).map((item: { [s: string]: unknown; } | ArrayLike<unknown>) =>
                Object.values(item).map(
                    (value) => (value === null ? 'null' : value.toString())
                )
            )

            previewTableDataRef.value = transform(previewColsRef.value, res.data.slice(1).map((item: ArrayLike<unknown> | {
                  [s: string]: unknown;
                }) =>
                    Object.values(item).map(
                        (value) => (value === null ? 'null' : value.toString())
                    )
            ));
          }
        } else {
          window.$message.error(res.message)
        }
      })
      .finally(() => isLoading.value = false)
}

const transform = (objA: { title: string, key: string }[], objB: Array<string[]>): Record<string, string>[] => {
  const transformed: Record<string, string>[] = [];
  for (const row of objB) {
    const obj: Record<string, string> = {};
    for (let i = 0; i < row.length && i < objA.length; i++) {
      obj[objA[i].key] = row[i];
    }
    transformed.push(obj);
  }
  return transformed;
}
</script>

<style scoped>

</style>
