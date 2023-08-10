<template>
  <n-layout class="m-2">
    <n-scrollbar style="height: calc(100vh - 42px);" trigger="hover">
      <n-grid :cols="1">
        <n-gi>
          <n-card size="small" :embedded="true">
            <n-grid :cols="2">
              <n-gi>
                <div class="select-none" style="line-height: 34px;"
                ><span>数据中台访问令牌</span>
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
                <span v-else style="line-height: 34px;">
                  <n-input :value="authTokenRef" placeholder="" readonly/>
                </span>
              </n-gi>
            </n-grid>
          </n-card>

        </n-gi>
      </n-grid>
    </n-scrollbar>
  </n-layout>
</template>

<script setup lang="ts">
import {app_relaunch} from "@render/api/app.api";
import {get_auth_token, update_auth_token} from "@render/api/auxiliaryDb";
import {nextTick, onMounted, ref} from "vue";
import {CheckmarkSharp, CloseSharp} from '@vicons/ionicons5'

const authTokenRef = ref('')
const authTokenIsEdit = ref(false)
const authTokenInputRef = ref()
const authTokenValueRef = ref('')
const authTokenIsUpdating = ref(false)

onMounted(() => {
  get_auth_token().then((res) => {
    authTokenRef.value = res.value
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
  update_auth_token(authTokenRef.value).then(() => {
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
