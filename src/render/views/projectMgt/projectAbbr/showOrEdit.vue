<template>
  <div style="min-height: 22px" @click="handleOnClick">
    <n-input-group v-if="isEdit">
      <n-input
          ref="inputRef"
          placeholder=""
          v-model:value="inputValue"
          @blur="handleBlur"
          @keyup.enter="handleChange"
          :spellcheck="false"
      />
      <n-button @mousedown.prevent @click.stop="handleChange">
        <n-icon>
          <CheckmarkSharp/>
        </n-icon>
      </n-button>
    </n-input-group>
    <span v-else>
      {{ value }}
    </span>
  </div>
</template>

<script setup lang="ts">
import {NInput} from "naive-ui";
import {nextTick, ref} from "vue";
import {CheckmarkSharp} from '@vicons/ionicons5'

const props = defineProps({
  value: String,
  onUpdateValue: [Function, Array]
})

const emit = defineEmits(['updateValue'])

const isEdit = ref(false)
const inputRef = ref(null)
const inputValue = ref(props.value?.toString())

const handleOnClick = () => {
  if (!isEdit.value) {
    inputValue.value = props.value
    isEdit.value = true
    nextTick(() => {
      inputRef.value.focus()
      inputRef.value.select()
    })
  }
}

function handleChange() {
  emit('updateValue', inputValue.value)
  isEdit.value = false
}

/* const handleClose = () => {
  isEdit.value = false
  inputValue.value = props.value.toString()
} */

const handleBlur = () => {
  isEdit.value = false
  inputValue.value = props.value?.toString()
}
</script>

<style scoped>

</style>
