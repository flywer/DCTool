<template>
  <div style="min-height: 22px" @click="handleOnClick">
    <n-input
        v-if="isEdit"
        ref="inputRef"
        placeholder=""
        v-model:value="inputValue"
        @change="handleChange"
        @blur="handleChange"

    />
    <span v-else>
      {{ value }}
    </span>
  </div>
</template>

<script setup lang="ts">
import {NInput} from "naive-ui";
import {nextTick, ref} from "vue";

const props = defineProps({
  value: [String, Number],
  onUpdateValue: [Function, Array]
})

const emit = defineEmits(['updateValue'])

const isEdit = ref(false)
const inputRef = ref(null)
const inputValue = ref(props.value?.toString())

const handleOnClick = () => {
  isEdit.value = true
  nextTick(() => {
    inputRef.value.focus()
  })
}

function handleChange() {
  emit('updateValue', inputValue.value)
  isEdit.value = false
}
</script>

<style scoped>

</style>
