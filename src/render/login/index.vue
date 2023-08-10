<template>
  <n-layout class="mt-8 pl-4 pr-4">
    <n-space justify="center" align="center">
      <svg t="1691567483888" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
           p-id="4425" width="64" height="64"
      >
        <path
            d="M112.981333 498.261333c-44.288-77.226667-53.290667-149.504-21.802666-203.989333 42.154667-73.045333 147.968-98.56 281.770666-74.197333a13.738667 13.738667 0 1 1-4.906666 27.008c-123.733333-22.528-218.069333 0.213333-253.098667 60.928-25.813333 44.672-18.048 107.050667 21.845333 176.64a13.738667 13.738667 0 1 1-23.808 13.653333z m636.586667-258.944c78.293333 1.024 134.656 25.429333 160.042667 69.376 34.986667 60.544 7.68 153.386667-73.301334 249.045334a13.738667 13.738667 0 1 0 20.906667 17.749333c87.637333-103.509333 118.229333-207.616 76.16-280.533333-30.976-53.632-96.426667-81.92-183.424-83.072a13.738667 13.738667 0 1 0-0.341333 27.434666z m-79.104 650.197334a13.738667 13.738667 0 0 0-18.858667 4.693333c-39.850667 66.261333-88.746667 102.357333-139.093333 102.357333-70.058667 0-136.874667-70.272-179.2-188.501333a13.738667 13.738667 0 1 0-25.856 9.258667C353.237333 945.237333 428.202667 1024 512.426667 1024c61.44 0 118.314667-41.898667 162.688-115.626667a13.738667 13.738667 0 0 0-4.693334-18.858666z m313.856-110.677334a65.706667 65.706667 0 0 1-103.936 53.333334c-104.746667 61.653333-304.896 30.293333-493.226667-78.506667-80.213333-46.293333-150.485333-102.058667-204.586666-161.493333a13.738667 13.738667 0 1 1 20.309333-18.474667c52.138667 57.301333 120.192 111.317333 197.973333 156.202667 177.792 102.656 364.928 133.12 460.672 81.322666a65.706667 65.706667 0 1 1 122.794667-32.384z m-813.312 0a65.706667 65.706667 0 1 1-97.493333-57.386666c-9.941333-122.752 119.04-287.317333 314.026666-399.872 80.981333-46.762667 165.290667-79.957333 244.522667-96.896a13.738667 13.738667 0 0 1 5.76 26.794666c-76.373333 16.384-157.994667 48.512-236.586667 93.866667-183.637333 106.026667-304.981333 258.858667-300.714666 368.085333 1.621333-0.128 3.2-0.256 4.821333-0.256 36.266667 0 65.706667 29.44 65.706667 65.706667zM446.805333 65.706667a65.706667 65.706667 0 0 1 131.328 0c0 0.981333-0.085333 1.92-0.128 2.858666 108.757333 56.192 184.32 247.893333 184.32 469.461334 0 91.093333-12.714667 178.517333-36.437333 254.293333a13.738667 13.738667 0 1 1-26.197333-8.192c22.869333-73.045333 35.2-157.738667 35.2-246.101333 0-208.64-69.376-388.053333-164.138667-442.154667a65.621333 65.621333 0 0 1-123.946667-30.165333z m55.637334 425.856a47.530667 47.530667 0 1 0 20.053333 92.928 47.530667 47.530667 0 0 0-20.053333-92.928z"
            p-id="4426" fill="#18a058"
        ></path>
      </svg>
      <n-h2 style="margin-bottom: 0">数据归集辅助工具</n-h2>
    </n-space>

    <n-form
        class="mt-4"
        ref="formRef"
        :size="'medium'"
        :model="formModel"
        :rules="signInRules"
    >
      <n-form-item-row label="账号" path="account">
        <n-input v-model:value="formModel.account"/>
      </n-form-item-row>
      <n-form-item-row label="密码" path="password">
        <n-input
            type="password"
            show-password-on="click"
            v-model:value="formModel.password"
        >
          <template #password-visible-icon>
            <n-icon>
              <GlassesOutline/>
            </n-icon>
          </template>
          <template #password-invisible-icon>
            <n-icon>
              <Glasses/>
            </n-icon>
          </template>
        </n-input>
      </n-form-item-row>
      <n-form-item-row label="重复密码" path="password2" v-if="!isSignInTab">
        <n-input
            type="password"
            show-password-on="click"
            v-model:value="formModel.password2"
        >
          <template #password-visible-icon>
            <n-icon>
              <GlassesOutline/>
            </n-icon>
          </template>
          <template #password-invisible-icon>
            <n-icon>
              <Glasses/>
            </n-icon>
          </template>
        </n-input>
      </n-form-item-row>
      <n-form-item-row label="激活码" v-if="!isSignInTab">
        <n-input
            type="password"
            show-password-on="click"
            v-model:value="formModel.cdk"
        >
          <template #password-visible-icon>
            <n-icon>
              <GlassesOutline/>
            </n-icon>
          </template>
          <template #password-invisible-icon>
            <n-icon>
              <Glasses/>
            </n-icon>
          </template>
        </n-input>
      </n-form-item-row>
    </n-form>

    <n-checkbox class="mt-1 ml-1 mb-2" v-model:checked="formModel.rememberMe" v-if="isSignInTab">
      记住密码
    </n-checkbox>

    <n-button v-if="isSignInTab" type="primary" block strong class="mt-2" @click="handleSignIn" :loading="isSignIn">
      登录
    </n-button>
    <n-button v-if="!isSignInTab" type="primary" block strong class="mt-2" @click="handleSignUp" :loading="isSignUp">
      注册
    </n-button>

  </n-layout>
  <n-space justify="center" align="center" class="mt-4" style="position: absolute;left: 44%;bottom: 3%">
    <n-button v-if="isSignInTab" text type="info" @click="signChange">立即注册</n-button>
    <n-button v-if="!isSignInTab" text type="info" @click="signChange">马上登录</n-button>
  </n-space>
</template>

<script setup lang="ts">
import {Result} from "@main/vo/resultVo";
import {read_user_config, remember_me, sign_in, sign_up} from "@render/api/login";
import {FormInst, FormItemRule} from "naive-ui";
import {onMounted, ref, watch} from "vue";
import {GlassesOutline, Glasses} from '@vicons/ionicons5'

const isSignInTab = ref(true)

const formRef = ref<FormInst | null>(null);

const formModel = ref({
  account: '',
  password: '',
  password2: '',
  cdk: '',
  rememberMe: true
})

const signInRules = {
  account: {
    validator(rule: FormItemRule, value: string) {
      if (!value) {
        return new Error('账号不能为空')
      } else if (value.length < 6 && !isSignInTab.value) {
        return new Error('账号最短长度为6')
      } else if (!/^[a-zA-Z0-9]+$/.test(value) && !isSignInTab.value) {
        return new Error('账号只可由数字与大小写字母组成')
      } else if (value.length > 36 && !isSignInTab.value) {
        return new Error('账号最大长度为36')
      }
      return true
    },
    trigger: ['input'],
  },
  password: {
    validator(rule: FormItemRule, value: string) {
      if (!value) {
        return new Error('密码不能为空')
      } else if (value.length < 6 && !isSignInTab.value) {
        return new Error('密码最短长度为6')
      } else if (!/^(?=.*[a-z])(?=.*[A-Z]).*$/.test(value) && !isSignInTab.value) {
        return new Error('密码至少需要一个小写字母与一个大写字母')
      } else if (value.length > 36 && !isSignInTab.value) {
        return new Error('密码最大长度为36')
      }
      return true
    },
    trigger: ['input'],
  },
  password2: {
    validator(rule: FormItemRule, value: string) {
      return value === formModel.value.password
    },
    message: '两次密码输入不一致',
    trigger: ['input'],
  },
  cdk: {
    validator(rule: FormItemRule, value: string) {
      if (!value && !isSignInTab.value) {
        return new Error('激活码不能为空')
      } else if (value.length > 128 && !isSignInTab.value) {
        return new Error('密码长度最长为128')
      }
    },
    trigger: ['input'],
  }
}

onMounted(() => {
  // 读取user-config
  read_user_config().then(res => {
    if (res != null) {
      formModel.value.account = res.account
      formModel.value.password = res.password
    }
  }).catch(err => {
    console.error(err)
  })
})

const isSignIn = ref(false)

const handleSignIn = () => {
  isSignIn.value = true

  formRef.value?.validate((errors) => {
    if (!errors) {
      sign_in(formModel.value)
          .then((res: Result) => {
            if (res.success) {
              // 记住密码
              remember_me(formModel.value)
            } else {
              window.$message.error(res.message)
            }
          })
          .finally(() => isSignIn.value = false)
    } else {
      isSignIn.value = false
    }
  })

}

const isSignUp = ref(false)
const handleSignUp = () => {
  isSignUp.value = true

  formRef.value?.validate((errors) => {
    if (!errors) {
      sign_up(formModel.value)
          .then((res: Result) => {
            if (res.success) {
              window.$message.success(res.message)
              isSignInTab.value = true
            } else {
              window.$message.error(res.message)
            }
          })
          .finally(() => isSignIn.value = false)
    } else {
      isSignIn.value = false
    }
  })
}

const signChange = () => {
  isSignInTab.value = !isSignInTab.value;
  formRef.value.restoreValidation()

  formModel.value = {
    account: '',
    password: '',
    password2: '',
    cdk: '',
    rememberMe: true
  }
}


</script>

<style scoped>

</style>
