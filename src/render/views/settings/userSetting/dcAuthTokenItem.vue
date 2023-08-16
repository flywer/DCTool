<template>
  <n-card size="small" :style="{borderRadius:'6px',borderColor:'rgb(224 224 233)'}">
    <n-grid :cols="2">
      <n-gi>
        <div class="select-none leading-8">
          <span>数据中台访问令牌</span>
        </div>
      </n-gi>
      <n-gi @click="handleClickOnAuthToken">
        <n-input-group v-if="authTokenIsEdit">
          <n-input ref="authTokenInputRef" v-model:value="authTokenValueRef"/>
          <n-button @click.stop="handleUpdateAuthToken" :loading="authTokenIsUpdating">
            <n-icon>
              <CheckmarkSharp/>
            </n-icon>
          </n-button>
          <n-button @click.stop="handleCloseOnAuthToken">
            <n-icon>
              <CloseSharp/>
            </n-icon>
          </n-button>
        </n-input-group>
        <span v-else class="leading-8">
                  <n-input :value="authTokenRef" placeholder="" readonly/>
                </span>
      </n-gi>
    </n-grid>
  </n-card>
</template>

<script setup lang="ts">
import {app_relaunch} from "@render/api/app.api";
import {get_auth_token, update_auth_token} from "@render/api/auxiliaryDb.api";
import {useUserStore} from "@render/stores/user";
import {nextTick, onMounted, ref} from "vue";
import {CheckmarkSharp, CloseSharp} from '@vicons/ionicons5'

const user = useUserStore()

const authTokenRef = ref('')
const authTokenIsEdit = ref(false)
const authTokenInputRef = ref()
const authTokenValueRef = ref('')
const authTokenIsUpdating = ref(false)

onMounted(() => {
  get_auth_token(user.account).then((res) => {
    authTokenRef.value = res.dcToken
  })
})

const handleClickOnAuthToken = () => {
  authTokenValueRef.value = authTokenRef.value
  authTokenIsEdit.value = true
  nextTick(() => {
    authTokenInputRef.value.focus()
  })
}

const handleUpdateAuthToken = () => {
  authTokenRef.value = authTokenValueRef.value
  authTokenIsUpdating.value = true
  update_auth_token(authTokenRef.value, user.account).then(() => {
    authTokenIsEdit.value = false
    window.$dialog.success({
      title: '更新成功',
      content: '是否立即重启应用？',
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: () => {
        app_relaunch();
      }
    })
  }).finally(() => {
    authTokenIsUpdating.value = false
  })
}

const handleCloseOnAuthToken = () => {
  authTokenIsEdit.value = false
}

</script>

<style scoped>

</style>
