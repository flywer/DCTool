<template>
  <n-layout>
    <n-scrollbar class="pr-2" style="height: calc(100vh - 170px);" trigger="hover">
      <div class="w-auto h-8 mb-2">
        <div class="float-left leading-8 font-bold text-base" style="max-width: 40%">
          <n-skeleton v-if="isTableLoading" :width="300" size="small"/>
          <n-ellipsis style="max-width: 100%" v-else>
            {{ title }}
          </n-ellipsis>
        </div>
        <n-space inline class="float-right" style="max-width: 60%">

          <n-button secondary type="info" @click="quickCreateModalInit">
            快捷创建
            <template #icon>
              <n-icon>
                <AddSquareMultiple16Regular/>
              </n-icon>
            </template>
          </n-button>

          <n-button secondary color="#8a2be2" @click="validConfigModalInit">
            配置管理{{ isValidConfigRef ? '（已配置）' : '（未配置）' }}
            <template #icon>
              <n-icon>
                <Options16Regular/>
              </n-icon>
            </template>
          </n-button>

          <n-button secondary strong @click="tableDataInit">
            刷新
            <template #icon>
              <n-icon>
                <Refresh/>
              </n-icon>
            </template>
          </n-button>
        </n-space>
      </div>
      <n-data-table
          :key="(row) => row.id"
          class="mt-2 mb-2"
          :columns="columnsRef"
          :data="tableDataRef"
          :bordered="true"
          :size="'small'"
          :loading="isTableLoading"
          :striped="true"
          :scroll-x="1200"
      >
        <template #empty>
          <span style="color: rgba(194, 194, 194, 1)">未选择项目对应表</span>
        </template>
      </n-data-table>
    </n-scrollbar>
  </n-layout>

  <n-modal
      v-model:show="showModalRef"
      :mask-closable="false"
      :closable="true"
      preset="dialog"
      role="dialog"
      :show-icon="false"
      :title="modalTitle"
      :size="'small'"
      @afterLeave="onModelAfterLeave"
      style="width: 566px"
  >
    <n-scrollbar class="pr-2" style="max-height: calc(100vh - 300px);" trigger="hover">
      <n-alert type="warning" :show-icon="false" v-if="formSelect.addSchedJob && showCronUnConfigAlert">
        此项目未进行调度配置，可能会与其他项目执行时间产生冲突，前往<b>调度管理</b>进行配置
      </n-alert>

      <n-form
          v-if="formSelect.addSchedJob"
          class="mt-4"
          ref="addSchedJobModalFormRef"
          :model="addSchedJobModalFormModel"
          :rules="addSchedJobModalFormRules"
          :size="'small'"
      >
        <n-grid :cols="14" :x-gap="4">
          <n-form-item-gi :span="7" label="调度任务名" path="jobContent">
            <n-input
                v-model:value="addSchedJobModalFormModel.jobContent"
                placeholder=""
                readonly
                @keydown.enter.prevent
            />
          </n-form-item-gi>
          <n-form-item-gi :span="7" label="项目名" path="projectName">
            <n-input
                v-model:value="addSchedJobModalFormModel.projectName"
                placeholder=""
                readonly
                @keydown.enter.prevent
            />
          </n-form-item-gi>
          <n-form-item-gi :span="7" label="是否重试" path="retry">
            <n-radio-group v-model:value="addSchedJobModalFormModel.retry">
              <n-radio-button
                  :key="1"
                  :value="'1'"
                  label="是"
              />
              <n-radio-button
                  :key="0"
                  :value="'0'"
                  label="否"
              />
            </n-radio-group>
          </n-form-item-gi>
          <n-form-item-gi :span="7" label="重试次数" path="executorFailRetryCount">
            <n-input-number v-model:value="addSchedJobModalFormModel.executorFailRetryCount" button-placement="both"/>
          </n-form-item-gi>

          <n-form-item-gi :span="1" label="秒" path="sec" :label-style="{margin:'0 auto'}">
            <n-input class="text-center"
                     v-model:value="addSchedJobModalFormModel.sec"
                     placeholder=""
                     @keydown.enter.prevent
                     readonly
            />
          </n-form-item-gi>
          <n-form-item-gi :span="3" label="分" path="min" :label-style="{margin:'0 auto'}">
            <n-input-number class="text-center" v-model:value="addSchedJobModalFormModel.min"
                            :min="schedMinRange.startMin" :max="schedMinRange.endMIn" placeholder=""
                            @keydown.enter.prevent
            />
          </n-form-item-gi>
          <n-form-item-gi :span="2" label="时" path="hour" :label-style="{margin:'0 auto'}">
            <n-input class="text-center" v-model:value="addSchedJobModalFormModel.hour" placeholder=""
                     @keydown.enter.prevent
            />
          </n-form-item-gi>
          <n-form-item-gi :span="2" label="日" path="day" :label-style="{margin:'0 auto'}">
            <n-input class="text-center" v-model:value="addSchedJobModalFormModel.day" placeholder=""
                     @keydown.enter.prevent
            />
          </n-form-item-gi>
          <n-form-item-gi :span="2" label="月" path="month" :label-style="{margin:'0 auto'}">
            <n-input class="text-center" v-model:value="addSchedJobModalFormModel.month" placeholder=""
                     @keydown.enter.prevent
            />
          </n-form-item-gi>
          <n-form-item-gi :span="2" label="周" path="week" :label-style="{margin:'0 auto'}">
            <n-input class="text-center" v-model:value="addSchedJobModalFormModel.week" placeholder=""
                     @keydown.enter.prevent
            />
          </n-form-item-gi>
          <n-form-item-gi :span="2" label="年" path="year" :label-style="{margin:'0 auto'}">
            <n-input class="text-center" v-model:value="addSchedJobModalFormModel.year" placeholder=""
                     @keydown.enter.prevent
            />
          </n-form-item-gi>
        </n-grid>

      </n-form>

      <n-form
          v-if="formSelect.createCjJob"
          class="mt-4"
          ref="cjJobModalFormRef"
          :model="cjJobModalFormModel"
          :rules="cjJobModalFormRules"
          :size="'small'"
      >
        <n-grid :cols="4" :x-gap="4">
          <n-form-item-gi :span="4" label="工作流名称" path="name">
            <n-input v-model:value="cjJobModalFormModel.name" placeholder=""
                     readonly
            />
          </n-form-item-gi>
          <n-form-item-gi :span="4" label="来源表" path="sourceTableName">
            <n-select :size="'small'"
                      v-model:value="cjJobModalFormModel.sourceTableName"
                      :options="sourceTableOptions"
                      filterable
                      remote
                      @search="handleSourceTableSearch"
                      @update:value="handleSourceTableUpdate"
                      :consistent-menu-width="false"
            />
          </n-form-item-gi>
          <n-form-item-gi :span="4" label="目标表" path="targetTableName">
            <n-input :size="'small'"
                     v-model:value="cjJobModalFormModel.targetTableName"
                     readonly
            />
          </n-form-item-gi>
        </n-grid>
      </n-form>

      <n-form
          v-if="formSelect.createZjJob"
          class="mt-4"
          ref="zjJobModalFormRef"
          :model="zjJobModalFormModel"
          :rules="zjJobModalFormRules"
          :size="'small'"
      >
        <n-grid :cols="4" :x-gap="4">
          <n-form-item-gi :span="4" label="表名" path="tableName">
            <n-input
                v-model:value="zjJobModalFormModel.tableName"
                readonly
            />
          </n-form-item-gi>
          <n-form-item-gi :span="4" label="项目" path="projectName">
            <n-input
                v-model:value="zjJobModalFormModel.projectName"
                readonly
            />
          </n-form-item-gi>
          <n-form-item-gi :span="4" label="任务类型" path="jobType">
            <n-radio-group v-model:value="zjJobModalFormModel.jobType">
              <n-radio-button
                  :key="1"
                  :value="'1'"
                  label="完整版质检"
              />
              <n-radio-button
                  :key="2"
                  :value="'2'"
                  label="简化版质检"
              />
            </n-radio-group>
          </n-form-item-gi>
          <n-form-item-gi :span="4" label="责任人" path="personId">
            <n-select
                v-model:value="zjJobModalFormModel.personId"
                placeholder="选择责任人"
                :options="personIdOptions"
                :consistent-menu-width="false"
            />
          </n-form-item-gi>
        </n-grid>
      </n-form>

      <n-form
          v-if="formSelect.createBfJob"
          class="mt-4"
          ref="bfJobModalFormRef"
          :model="bfJobModalFormModel"
          :rules="bfJobModalFormRules"
          :size="'small'"
      >
        <n-grid :cols="4" :x-gap="4">
          <n-form-item-gi :span="4" label="表名" path="tableName">
            <n-input
                v-model:value="bfJobModalFormModel.tableName"
                readonly
            />
          </n-form-item-gi>
          <n-form-item-gi :span="4" label="项目" path="projectName">
            <n-input
                v-model:value="bfJobModalFormModel.projectName"
                readonly
            />
          </n-form-item-gi>
          <n-form-item-gi :span="4" label="责任人" path="personId">
            <n-select
                v-model:value="bfJobModalFormModel.personId"
                placeholder="选择责任人"
                :options="personIdOptions"
                :consistent-menu-width="false"
            />
          </n-form-item-gi>
        </n-grid>
      </n-form>

      <n-form
          v-if="formSelect.createRhJob"
          class="mt-4"
          ref="rhJobModalFormRef"
          :model="rhJobModalFormModel"
          :rules="rhJobModalFormRules"
          :size="'small'"
      >
        <n-grid :cols="4" :x-gap="4">
          <n-form-item-gi :span="4" label="表名" path="tableName">
            <n-input
                v-model:value="rhJobModalFormModel.tableName"
                readonly
            />
          </n-form-item-gi>
          <n-form-item-gi :span="4" label="项目" path="projectName">
            <n-input
                v-model:value="rhJobModalFormModel.projectName"
                readonly
            />
          </n-form-item-gi>
          <n-form-item-gi :span="4" label="责任人" path="personId">
            <n-select
                v-model:value="rhJobModalFormModel.personId"
                placeholder="选择责任人"
                :options="personIdOptions"
                :consistent-menu-width="false"
            />
          </n-form-item-gi>
        </n-grid>
      </n-form>

      <n-form
          v-if="formSelect.createQcJob"
          class="mt-4"
          ref="qcJobModalFormRef"
          :model="qcJobModalFormModel"
          :rules="qcJobModalFormRules"
          :size="'small'"
      >
        <n-grid :cols="4" :x-gap="4">
          <n-form-item-gi :span="4" label="表名" path="tableName">
            <n-input
                v-model:value="qcJobModalFormModel.tableName"
                readonly
            />
          </n-form-item-gi>
          <n-form-item-gi :span="4" label="项目" path="projectName">
            <n-input
                v-model:value="qcJobModalFormModel.projectName"
                readonly
            />
          </n-form-item-gi>
          <n-form-item-gi :span="4" label="责任人" path="personId">
            <n-select
                v-model:value="qcJobModalFormModel.personId"
                placeholder="选择责任人"
                :options="personIdOptions"
                :consistent-menu-width="false"
            />
          </n-form-item-gi>
        </n-grid>
      </n-form>

      <n-form
          v-if="formSelect.createRh2Job"
          class="mt-4"
          ref="rh2JobModalFormRef"
          :model="rh2JobModalFormModel"
          :rules="rh2JobModalFormRules"
          :size="'small'"
      >
        <n-grid :cols="4" :x-gap="4">
          <n-form-item-gi :span="4" label="表名" path="tableName">
            <n-input
                v-model:value="rh2JobModalFormModel.tableName"
                readonly
            />
          </n-form-item-gi>
          <n-form-item-gi :span="4" label="项目" path="projectName">
            <n-input
                v-model:value="rh2JobModalFormModel.projectName"
                readonly
            />
          </n-form-item-gi>
          <n-form-item-gi :span="4" label="责任人" path="personId">
            <n-select
                v-model:value="rh2JobModalFormModel.personId"
                placeholder="选择责任人"
                :options="personIdOptions"
                :consistent-menu-width="false"
            />
          </n-form-item-gi>
        </n-grid>
      </n-form>

      <n-form
          v-if="formSelect.quickCreate"
          class="mt-4"
          ref="quickCreateModalFormRef"
          :model="quickCreateModalFormModel"
          :rules="quickCreateModalFormRules"
          :size="'small'"
      >
        <n-grid :cols="4" :x-gap="4">

          <n-form-item-gi :span="4" label="项目" path="projectName">
            <n-input
                v-model:value="quickCreateModalFormModel.projectName"
                readonly
            />
          </n-form-item-gi>

          <n-form-item-gi :span="4" label="任务选择" path="jobSelect">
            <n-tree-select
                v-model:value="quickCreateModalFormModel.jobSelect"
                multiple
                cascade
                checkable
                :check-strategy="'child'"
                :options="jobTypeTreeOptionsRef"
                @update:value="handleJobTreeUpdateValue"
            />
          </n-form-item-gi>

          <n-gi v-if="quickCreateModalFormModel.jobSelect.includes('cj')" :span="4">
            <n-divider style="margin: 0">
              数据采集任务
            </n-divider>
          </n-gi>

          <n-form-item-gi v-if="quickCreateModalFormModel.jobSelect.includes('cj')" :span="4" label="采集来源表"
                          path="sourceTableName"
          >
            <n-select :size="'small'"
                      v-model:value="quickCreateModalFormModel.sourceTableName"
                      :options="sourceTableOptions"
                      filterable
                      remote
                      @search="handleQuickCreateSourceTableSearch"
                      @update:value="handleQuickCreateSourceTableUpdate"
                      :consistent-menu-width="false"
            />
          </n-form-item-gi>

          <n-form-item-gi v-if="quickCreateModalFormModel.jobSelect.includes('cj')" :span="4" label="采集目标表"
                          path="targetTableName"
          >
            <n-input :size="'small'"
                     v-model:value="quickCreateModalFormModel.targetTableName"
                     readonly
            />
          </n-form-item-gi>

          <n-gi v-if="quickCreateModalFormModel.jobSelect.includes('cj')" :span="4">
            <n-divider style="margin-top: 0"/>
          </n-gi>

          <n-gi v-if="quickCreateModalFormModel.jobSelect.includes('zj')" :span="4">
            <n-divider style="margin: 0">
              数据质检任务
            </n-divider>
          </n-gi>
          <n-form-item-gi v-if="quickCreateModalFormModel.jobSelect.includes('zj')" :span="4" label="任务类型"
                          path="zjJobType"
          >
            <n-radio-group v-model:value="quickCreateModalFormModel.zjJobType">
              <n-radio-button
                  :key="1"
                  :value="'1'"
                  label="完整版质检"
              />
              <n-radio-button
                  :key="2"
                  :value="'2'"
                  label="简化版质检"
              />
            </n-radio-group>
          </n-form-item-gi>

          <n-gi v-if="quickCreateModalFormModel.jobSelect.includes('zj')" :span="4">
            <n-divider style="margin-top: 0"/>
          </n-gi>

          <n-form-item-gi :span="4" label="责任人" path="personId">
            <n-select
                v-model:value="quickCreateModalFormModel.personId"
                placeholder="选择责任人"
                :options="personIdOptions"
                :consistent-menu-width="false"
            />
          </n-form-item-gi>

        </n-grid>
      </n-form>

      <n-alert v-if="formSelect.validConfig && isValidConfigRef" class="mt-4" type="default" :show-icon="false">
        一旦创建无法修改，只可删除
      </n-alert>

      <n-form
          v-if="formSelect.validConfig"
          class="mt-4"
          ref="validConfigModalFormRef"
          :model="validConfigModalFormModel"
          :rules="validConfigModalFormRules"
          :size="'small'"
      >
        <n-grid :cols="4" :x-gap="4">
          <n-form-item-gi :span="4" label="表名" path="tableName">
            <n-input
                v-model:value="validConfigModalFormModel.tableName"
                readonly
            />
          </n-form-item-gi>

          <n-form-item-gi :span="2" label="主键字段" path="pkeyName">
            <n-input
                v-model:value="validConfigModalFormModel.pkeyName"
                :readonly="isValidConfigRef"
            />
          </n-form-item-gi>

          <n-form-item-gi :span="2" label="批次号字段" path="cdBatchName">
            <n-input
                v-model:value="validConfigModalFormModel.cdBatchName"
                :readonly="isValidConfigRef"
            />
          </n-form-item-gi>

          <n-form-item-gi :span="4" label="组织机构" path="mechanismId">
            <n-select
                v-model:value="validConfigModalFormModel.mechanismId"
                placeholder="选择组织机构"
                :options="mechanismOptions"
                :consistent-menu-width="false"
                filterable
                :disabled="isValidConfigRef"
                @update:value="handlemechanismIdUpdate"
            />
          </n-form-item-gi>
        </n-grid>
      </n-form>
    </n-scrollbar>
    <template #action>
      <n-button type="primary" :size="'small'" @click="onPositiveClick" :loading="isSaving">{{
          confirmBtnText
        }}
      </n-button>
      <n-button :size="'small'" @click="onNegativeClick">返回</n-button>
    </template>

  </n-modal>

  <job-log-drawer v-model:show="showDrawerRef" :job="drawerJobRef"/>

  <n-modal
      v-model:show="showUpdateZjJobModalRef"
      :mask-closable="false"
      :closable="true"
      preset="dialog"
      role="dialog"
      :show-icon="false"
      :title="'更新质检规则'"
      :size="'small'"
      style="width: 370px"
  >
    <n-form
        class="mt-4"
        :model="updateZjJobFormRef"
        :size="'small'"
    >
      <n-grid :cols="1">
        <n-form-item-gi :span="1" label="表名" path="tableName">
          <n-input
              v-model:value="updateZjJobFormRef.tableName"
              readonly
          />
        </n-form-item-gi>
        <n-form-item-gi :span="1" label="规则类型">
          <n-radio-group v-model:value="updateZjJobFormRef.type" :size="'small'">
            <n-radio-button
                :key="1"
                :value="'1'"
                label="完整版规则"
            />
            <n-radio-button
                :key="2"
                :value="'2'"
                label="简化版规则"
            />
          </n-radio-group>
        </n-form-item-gi>
      </n-grid>
    </n-form>
    <template #action>
      <n-button type="primary" :size="'small'" @click="onUpdateZjJob" :loading="isUpdateZjJob">更新</n-button>
      <n-button :size="'small'" @click="showUpdateZjJobModalRef=!showUpdateZjJobModalRef">返回</n-button>
    </template>
  </n-modal>

  <n-modal
      v-model:show="showPreviewModalRef"
      :mask-closable="true"
      :closable="true"
      preset="card"
      role="card"
      :show-icon="false"
      :title="previewModalTitle"
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
        :loading="isPreviewTableLoading"
        :max-height="450"
    />

  </n-modal>

  <n-modal
      v-model:show="showDataXJobSetupModalRef"
      :mask-closable="false"
      :closable="true"
      preset="dialog"
      role="dialog"
      :show-icon="false"
      :title="dataXJobSetupModalTitle"
      :size="'small'"
      style="width: 566px"
  >
    <n-scrollbar class="pr-2" style="max-height: calc(100vh - 300px);" trigger="hover">
      <n-layout class="m-2">
        <n-collapse :default-expanded-names="['1']">
          <n-collapse-item title="采集配置" name="1">
            <n-form
                ref="dataXJobSetupFormRef"
                class="mt-4"
                :model="dataXJobSetupModelRef"
                :rules="dataXJobSetupModelRules"
                :size="'small'"
            >
              <n-grid :cols="12" :x-gap="12">
                <n-form-item-gi :span="6" label="工作流名称">
                  <n-input v-model:value="dataXJobSetupModelRef.jonInfo.jobDesc"
                           readonly
                  />
                </n-form-item-gi>
                <n-form-item-gi :span="6" label="项目" path="projectName">
                  <n-input
                      v-model:value="dataXJobSetupModelRef.projectName"
                      readonly
                  />
                </n-form-item-gi>
                <n-form-item-gi :span="12" label="来源表" path="readerTable">
                  <n-select :size="'small'"
                            v-model:value="dataXJobSetupModelRef.readerTable"
                            :options="sourceTableOptions"
                            filterable
                            remote
                            @search="handleSourceTableSearchByDataXJobSetup"
                            @update:value="handleSourceTableUpdateByDataXJobSetup"
                            :consistent-menu-width="false"
                  />
                </n-form-item-gi>
                <n-form-item-gi :span="12" label="采集方式" path="incrementType">
                  <n-radio-group v-model:value="dataXJobSetupModelRef.jonInfo.incrementType" name="incrementType">
                    <n-radio-button :value="0">
                      全量采集
                    </n-radio-button>
                    <n-radio-button :value="2">
                      时间自增增量采集
                    </n-radio-button>
                  </n-radio-group>
                </n-form-item-gi>

                <template v-if="dataXJobSetupModelRef.jonInfo.incrementType === 2">
                  <n-form-item-gi :span="6" label="增量时间字段">
                    <n-input v-model:value="dataXJobSetupModelRef.jonInfo.replaceParam"/>
                  </n-form-item-gi>

                  <n-form-item-gi :span="6" label="增量时间格式">
                    <n-input v-model:value="dataXJobSetupModelRef.jonInfo.replaceParamType"/>
                  </n-form-item-gi>

                  <n-form-item-gi :span="12" label="增量开始时间" path="incStartTime">
                    <n-date-picker v-model:value="dataXJobSetupModelRef.incStartTime" type="datetime"
                                   :shortcuts="incStartTimeShorCuts"
                    />
                  </n-form-item-gi>
                </template>
              </n-grid>
            </n-form>
          </n-collapse-item>
          <n-collapse-item title="调度配置" name="2">
            <n-form
                ref="SchedJobSetupFormRef"
                class="mt-4"
                :model="dataXJobSetupModelRef.schedJob"
                :rules="dataXJobSetupModelRules"
                :size="'small'"
            >
              <n-grid :cols="17" :x-gap="4">
                <n-form-item-gi :span="7" label="是否重试" path="retry">
                  <n-radio-group v-model:value="dataXJobSetupModelRef.schedJob.retry">
                    <n-radio-button
                        :key="1"
                        :value="'1'"
                        label="是"
                    />
                    <n-radio-button
                        :key="0"
                        :value="'0'"
                        label="否"
                    />
                  </n-radio-group>
                </n-form-item-gi>
                <n-form-item-gi :span="10" label="重试次数" path="executorFailRetryCount">
                  <n-input-number v-model:value="dataXJobSetupModelRef.schedJob.executorFailRetryCount"
                                  button-placement="both"
                  />
                </n-form-item-gi>

                <n-form-item-gi :span="3" label="秒" path="sec" :label-style="{margin:'0 auto'}">
                  <n-input class="text-center"
                           v-model:value="dataXJobSetupModelRef.schedJob.sec"
                           placeholder=""
                           @keydown.enter.prevent
                           readonly
                  />
                </n-form-item-gi>
                <n-form-item-gi :span="3" label="分" path="min" :label-style="{margin:'0 auto'}">
                  <n-input-number class="text-center" v-model:value="dataXJobSetupModelRef.schedJob.min"
                                  :min="schedMinRange.startMin" :max="schedMinRange.endMIn" placeholder=""
                                  @keydown.enter.prevent
                  />
                </n-form-item-gi>
                <n-form-item-gi :span="3" label="时" path="hour" :label-style="{margin:'0 auto'}">
                  <n-input class="text-center" v-model:value="dataXJobSetupModelRef.schedJob.hour" placeholder=""
                           @keydown.enter.prevent
                  />
                </n-form-item-gi>
                <n-form-item-gi :span="2" label="日" path="day" :label-style="{margin:'0 auto'}">
                  <n-input class="text-center" v-model:value="dataXJobSetupModelRef.schedJob.day" placeholder=""
                           @keydown.enter.prevent
                  />
                </n-form-item-gi>
                <n-form-item-gi :span="2" label="月" path="month" :label-style="{margin:'0 auto'}">
                  <n-input class="text-center" v-model:value="dataXJobSetupModelRef.schedJob.month" placeholder=""
                           @keydown.enter.prevent
                  />
                </n-form-item-gi>
                <n-form-item-gi :span="2" label="周" path="week" :label-style="{margin:'0 auto'}">
                  <n-input class="text-center" v-model:value="dataXJobSetupModelRef.schedJob.week" placeholder=""
                           @keydown.enter.prevent
                  />
                </n-form-item-gi>
                <n-form-item-gi :span="2" label="年" path="year" :label-style="{margin:'0 auto'}">
                  <n-input class="text-center" v-model:value="dataXJobSetupModelRef.schedJob.year" placeholder=""
                           @keydown.enter.prevent
                  />
                </n-form-item-gi>
              </n-grid>
            </n-form>
          </n-collapse-item>
        </n-collapse>
      </n-layout>
    </n-scrollbar>
    <template #action>
      <n-button type="primary" :size="'small'" @click="handleDataXJobSetupSave" :loading="isDataXJobSetupSaving">保存
      </n-button>
      <n-button :size="'small'" @click="showDataXJobSetupModalRef=!showDataXJobSetupModalRef">返回</n-button>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import {JobTemplateType, ProjectInfo, WorkflowType} from "@common/types";
import {get_table_sql} from "@render/api/auxiliaryDb/tableSql.api";
import {
  create_valid_config,
  get_cj_job_page,
  get_columns,
  get_dataXJob, get_job_project_by_id,
  get_valid_config_page,
  get_workflow_page,
  gte_usrc_org_tree, update_sched_job
} from "@render/api/datacenter.api";
import {get_table_data} from "@render/api/front.api";
import {find_by_project_id, get_project_by_pro_abbr} from "@render/api/auxiliaryDb/projectInfo.api";
import {useProjectTreeStore} from "@render/stores/projectTree";
import {personIdOptions} from "@render/typings/datacenterOptions";
import {convertCronExpression} from "@render/utils/common/cronUtils";
import {formatDate} from "@render/utils/common/dateUtils";
import {createBfJob} from "@render/utils/datacenter/bfJob";
import {CjFormModelType, createCjJob, createSchedJob, updateDataXJob} from "@render/utils/datacenter/cjJob";
import {getTablesOptions} from "@render/utils/datacenter/getTablesOptions";
import {createGxJob} from "@render/utils/datacenter/gxJob";
import {
  dataXJobGetNextExecTime,
  getDataXJobStatus,
  getDataXJobType,
  getDCTableIsValidConfig,
  getSchedJob,
  getWorkflowJobStatus,
  getWorkflowJobType,
  Job,
  jobNameCompare,
  pushUnExistJobs, renderDataXJobActionButton, renderWorkflowActionButton,
  setJobStatus,
  showButton, showButtonPopover,
  showConfirmation, showTextButton,
  workflowJobGetLastExecTime,
  workflowJobGetNextExecTime,
} from "@render/utils/datacenter/jobTabUtil";
import {createQcJob} from "@render/utils/datacenter/qcJob";
import {createRhJob} from "@render/utils/datacenter/rhJob";
import {createRkJob} from "@render/utils/datacenter/rkJob";
import {createZjJob, updateZjJob} from "@render/utils/datacenter/zjJob";
import JobLogDrawer from "@render/views/projectMgt/components/jobLogDrawer.vue";
import {
  AddSquareMultiple16Regular,
  Options16Regular,
} from '@vicons/fluent'
import {Refresh} from '@vicons/ionicons5'
import {VNode} from "@vue/runtime-core";
import {cloneDeep, isEmpty} from "lodash-es";
import {
  DataTableColumns,
  FormInst,
  NButton,
  NSpace,
  SelectGroupOption,
  SelectOption,
  TreeSelectOption
} from "naive-ui";
import {computed, h, onMounted, ref, watch} from "vue";

const projectTree = useProjectTreeStore()

// 创建计算属性来获取 Pinia 存储中的值
const defaultSelectedKeys = computed(() => projectTree.defaultSelectedKeys)

// 当前项目示例，辅助库信息
const projectRef = ref<ProjectInfo>(null)

// 当前项目示例，数据中台信息
const datacenterProjectRef = ref(null)

// 此项目中的质检任务是否已配置组织机构
const isValidConfigRef = ref(false)

const queryParam = ref({
  projectId: null,
  tableAbbr: null as string //此为表名的最简化，比如di_ssft_z2010_temp_ods 则为z2010
})

watch(defaultSelectedKeys, (newValue, oldValue) => {
  if (newValue.length == 0) {
    newValue = oldValue
    projectTree.defaultSelectedKeys = newValue
  }
  if (newValue[0] != null) {
    pageInit(newValue)
  }
})

onMounted(() => {
  pageInit(useProjectTreeStore().defaultSelectedKeys)
})

const pageInit = async (defaultSelectedKeys: string[]) => {
  const segments = defaultSelectedKeys[0].split('-');
  projectTree.isBasicData = segments[0] === '0'
  const pattern: RegExp = /[a-zA-Z]/; // 包含字母的正则表达式
  if (pattern.test(segments[segments.length - 1]) && segments[segments.length - 1].length === 5) {
    queryParam.value.projectId = segments[segments.length - 2]
    queryParam.value.tableAbbr = segments[segments.length - 1]
    projectRef.value = await find_by_project_id(queryParam.value.projectId)
    datacenterProjectRef.value = await get_job_project_by_id(queryParam.value.projectId)
    isValidConfigRef.value = await getDCTableIsValidConfig(projectRef.value.tableAbbr, queryParam.value.tableAbbr)
    await tableDataInit()
  }
}

// region 数据表

const title = ref('')

const tableDataRef = ref([])

const isTableLoading = ref(false)

const setTitle = async (project: ProjectInfo) => {
  const tableComment = (await get_table_sql({
    tableName: queryParam.value?.tableAbbr.toString().toUpperCase()
  }))[0]?.comment || '未知信息'

  const projectName = project.projectName.replaceAll('行政行为', '')

  const index = projectName.indexOf('数据归集')

  title.value = projectName.slice(0, index) + '-' + tableComment
}

const tableDataInit = async () => {
  isTableLoading.value = true

  let jobs = []

  await setTitle(projectRef.value)

  const projectAbbr = projectRef.value.projectAbbr || '';
  if (projectAbbr !== '') {
    // 采集任务
    let dataXJobs = (await get_cj_job_page({
      current: 1,
      size: 10000,
      jobDesc: `${projectAbbr}_${queryParam.value.tableAbbr}`,
      subsystemName: "采集"
    })).data.records

    let newDataXJobs = []

    for (const v of dataXJobs) {
      const schedJob = await getSchedJob(v.jobDesc)

      const job: Job = {
        id: v.id,
        jobName: v.jobDesc,
        status: await getDataXJobStatus(v, schedJob),
        type: getDataXJobType(v),
        schedMode: 2,
        cron: schedJob?.jobCron || null,
        lastExecTime: v.triggerLastTime || '--',
        nextExecTime: dataXJobGetNextExecTime(schedJob),
        createBy: null,
        createTime: schedJob?.addTime || '--',
        updateTime: schedJob?.updateTime || '--',
        project: projectRef.value
      }

      newDataXJobs.push(job)
    }

    // 若不存在采集任务
    if (!newDataXJobs.some(job => job.type === '数据采集任务')) {
      newDataXJobs.push({
        id: null,
        jobName: `cj_${projectAbbr}_${queryParam.value.tableAbbr.toString().toLowerCase()}`,
        status: -1,
        type: '数据采集任务',
        schedMode: 2,
        cron: null,
        lastExecTime: '--',
        nextExecTime: '未配置调度任务',
        createBy: null
      })
    }

    // 若不存在共享任务
    if (!newDataXJobs.some(job => job.type === '数据共享任务')) {
      newDataXJobs.push({
        id: null,
        jobName: `gx_${projectAbbr}_${queryParam.value.tableAbbr.toString().toLowerCase()}`,
        status: -1,
        type: '数据共享任务',
        schedMode: 2,
        cron: null,
        lastExecTime: '--',
        nextExecTime: '未配置调度任务',
        createBy: null
      })
    }

    // 行为数据的共享任务不显示
    if (!projectTree.isBasicData) {
      newDataXJobs = newDataXJobs.filter(job => job.type !== '数据共享任务')
    }

    //工作流任务
    const workflowJobs: WorkflowType[] = (await get_workflow_page({
      page: 1,
      size: 10000,
      status: null,
      procName: `${projectAbbr}_${queryParam.value.tableAbbr}`
    })).data.records

    let newWorkflowJobs = []

    for (const v of workflowJobs) {
      const job: Job = {
        id: v.id,
        jobName: v.procName,
        type: getWorkflowJobType(v),
        status: getWorkflowJobStatus(v),
        schedMode: parseInt(v.schedulingMode),
        cron: v.crontab == '' ? null : v.crontab,
        lastExecTime: await workflowJobGetLastExecTime(v),
        nextExecTime: workflowJobGetNextExecTime(v),
        createBy: v.createBy,
        code: v.procCode,
        createTime: v.createTime,
        updateTime: v.updateTime,
        project: projectRef.value
      }

      newWorkflowJobs.push(job)
    }

    // 添加未创建的任务
    newWorkflowJobs = pushUnExistJobs(newWorkflowJobs, projectAbbr, queryParam.value.tableAbbr, projectTree.isBasicData)

    // 行为数据的入库任务不显示
    if (!projectTree.isBasicData) {
      newWorkflowJobs = newWorkflowJobs.filter(job => job.type !== '数据入库任务')
    }

    jobs.push(...newDataXJobs, ...newWorkflowJobs)
  } else {
    tableDataRef.value = []
  }

  tableDataRef.value = jobs.sort(jobNameCompare)

  isTableLoading.value = false
}

const createColumns = (): DataTableColumns<Job> => {
  return [
    {
      title: '任务名',
      key: 'jobName',
      width: '8%'
    },
    {
      title: '任务类型',
      key: 'type',
      width: '6%'
    },
    {
      title: '状态',
      key: 'status',
      width: '3%',
      align: 'center',
      render(row) {
        return setJobStatus(row)
      }
    },
    {
      title: '上次执行时间',
      key: 'lastExecTime',
      width: '8%'
    },
    {
      title: '下次执行时间',
      key: 'nextExecTime',
      width: '8%'
    },
    {
      title: '任务创建时间',
      key: 'createTime',
      width: '8%'
    },
    {
      title: '任务更新时间',
      key: 'updateTime',
      width: '8%'
    },
    {
      title: '操作',
      key: 'actions',
      width: '13%',
      align: 'center',
      fixed: 'right',
      render(row) {

        let container = h(NSpace, {
          justify: 'center'
        })

        let children: VNode[] = []

        // 未创建的任务
        if (row.status == -1) {
          if (row.type != '数据共享任务') {
            children = [showButton('创建', async () => {
              const project = (await find_by_project_id(queryParam.value.projectId))
              switch (row.type) {
                case '数据采集任务':
                  await createCjJobModalInit(project, row)
                  break
                case '数据质检任务':
                  createZjJobModalInit(project)
                  break
                case '数据融合任务':
                  createRhJobModalInit(project)
                  showModalRef.value = true
                  modalTitle = '创建融合任务'
                  formSelect.value.createRhJob = true
                  break
                case '单表融合任务':
                  createRhJobModalInit(project)
                  showModalRef.value = true
                  modalTitle = '创建单表融合任务'
                  formSelect.value.createRhJob = true
                  break
                case '多表融合任务':
                  createRh2JobModalInit(project)
                  showModalRef.value = true
                  modalTitle = '创建多表融合任务'
                  formSelect.value.createRh2Job = true
                  break
                case '数据备份任务':
                  createBfJobModalInit(project)
                  break
                case '数据清除任务':
                  createQcJobModalInit(project)
                  showModalRef.value = true
                  modalTitle = '创建清除任务'
                  formSelect.value.createQcJob = true
                  break
                case '数据入库任务':
                  window.$message.info("敬请期待")
                  break
              }
            })]
          } else {
            children = [showConfirmation('创建', async () => {
              const project = (await find_by_project_id(queryParam.value.projectId))
              const tableName = queryParam.value.tableAbbr.toString().toLowerCase()

              createGxJob({
                name: `gx_${project.projectAbbr}_${tableName}`,
                sourceTableName: `sztk_${tableName}`,
                targetTableName: `gdsztk_${tableName}`,
                projectId: project.projectId
              }).then(() => {
                tableDataInit()
              })

            })]
          }
        } else {
          if (row.type === '数据采集任务' || row.type === '数据共享任务') {
            children = renderDataXJobActionButton(row, () => addSchedJobModalFormModelInit(row), tableDataInit)
          } else {
            children = renderWorkflowActionButton(row, tableDataInit)
          }
        }

        if (children.length == 3) {
          // '更多'按钮的子组件
          let moreBtnPopoverChildren: VNode[] = []

          moreBtnPopoverChildrenPush(row, moreBtnPopoverChildren)

          // 若只有一个则直接添加到children里
          if (moreBtnPopoverChildren.length == 1) {
            childrenPushMoreBtn(row, children)
          } else {
            if (!isEmpty(moreBtnPopoverChildren)) {
              children.push(showButtonPopover('更多', moreBtnPopoverChildren))
            }
          }

        } else {
          childrenPushMoreBtn(row, children)
        }

        container.children = children

        return container
      }
    }
  ]
}

const moreBtnPopoverChildrenPush = (row: Job, moreBtnChildren: VNode[]) => {
  if ((row.type === '数据采集任务' || row.type === '数据共享任务') && ![0, -1].includes(row.status)) {
    moreBtnChildren.push(showTextButton('日志', () => showJobLogDrawer(row)))
  }

  if ((row.type === '数据采集任务') && ![0, -1, 3].includes(row.status)) {
    moreBtnChildren.push(showTextButton('任务配置', () => showDataXJobSetupModal(row)))
  }

  if (!(row.type === '数据采集任务' || row.type === '数据共享任务') && ![0, -1].includes(row.status)) {
    moreBtnChildren.push(showTextButton('日志', () => showJobLogDrawer(row)))
  }

  if (row.type === '数据质检任务' && ![-1, 2, 3].includes(row.status)) {
    moreBtnChildren.push(showTextButton('更新规则', () => showUpdateZjJobModal(row)))
  }

  if (row.type === '数据采集任务' && row.status != -1) {
    moreBtnChildren.push(showTextButton('源表预览', () => tablePreview(row)))
  }
}

// children直接添加更多中的组件
const childrenPushMoreBtn = (row: Job, children: VNode[]) => {
  if ((row.type === '数据采集任务' || row.type === '数据共享任务') && ![0, -1].includes(row.status)) {
    children.push(showButton('日志', () => showJobLogDrawer(row)))
  }

  if ((row.type === '数据采集任务') && ![0, -1, 3].includes(row.status)) {
    children.push(showButton('任务配置', () => showDataXJobSetupModal(row)))
  }

  if (!(row.type === '数据采集任务' || row.type === '数据共享任务') && ![0, -1].includes(row.status)) {
    children.push(showButton('日志', () => showJobLogDrawer(row)))
  }

  if (row.type === '数据质检任务' && ![-1, 2, 3].includes(row.status)) {
    children.push(showButton('更新规则', () => showUpdateZjJobModal(row)))
  }

  if (row.type === '数据采集任务' && row.status != -1) {
    children.push(showButton('源表预览', () => tablePreview(row)))
  }
}

const columnsRef = ref(createColumns())

// endregion

const showModalRef = ref(false)

let modalTitle = '';
let confirmBtnText = '创建'

const formSelect = ref({
  addSchedJob: false,
  createCjJob: false,
  createZjJob: false,
  createBfJob: false,
  createRhJob: false,
  createRh2Job: false,
  createQcJob: false,
  quickCreate: false,
  validConfig: false,
})

const onModelAfterLeave = () => {
  formSelect.value = {
    addSchedJob: false,
    createCjJob: false,
    createZjJob: false,
    createBfJob: false,
    createRhJob: false,
    createRh2Job: false,
    createQcJob: false,
    quickCreate: false,
    validConfig: false,
  }
}

const onNegativeClick = () => {
  showModalRef.value = false
}

const isSaving = ref(false)

// region 任务创建
const onPositiveClick = async () => {
  isSaving.value = true
  if (formSelect.value.addSchedJob) {
    addSchedJobModalFormRef.value?.validate(async (errors) => {
      if (!errors) {
        createSchedJob(addSchedJobModalFormModel.value).then(() => {
          tableDataInit()
          showModalRef.value = false
        }).finally(() => {
          isSaving.value = false
          formSelect.value.addSchedJob = false
        })
      } else {
        isSaving.value = false
        console.error(errors)
      }
    })
  }

  if (formSelect.value.createCjJob) {
    targetTableColumnsRef.value = (await get_columns(cjJobModalFormModel.value.targetDataSourceId, cjJobModalFormModel.value.targetTableName))

    if (!isEmpty(targetTableColumnsRef.value)) {
      cjJobModalFormRef.value?.validate(async (errors) => {
        if (!errors) {
          createCjJob({
            name: cjJobModalFormModel.value.name,
            sourceTableName: cjJobModalFormModel.value.sourceTableName,
            targetTableName: cjJobModalFormModel.value.targetTableName,
            projectId: cjJobModalFormModel.value.projectId,
            sourceDataSourceId: '7',
            targetDataSourceId: '6'
          }, sourceTableColumnsRef.value, targetTableColumnsRef.value).finally(() => {
            isSaving.value = false
            showModalRef.value = false
            formSelect.value.createCjJob = false
            tableDataInit()
          })
        } else {
          console.error(errors)
          isSaving.value = false
        }
      })
    } else {
      window.$message.warning("目标表不存在")
      isSaving.value = false
    }
  }

  if (formSelect.value.createZjJob) {
    zjJobModalFormRef.value?.validate(async (errors) => {
      if (!errors) {
        await createZjJob({
          projectId: zjJobModalFormModel.value.projectId,
          personId: zjJobModalFormModel.value.personId,
          tableName: zjJobModalFormModel.value.tableName
        }, zjJobModalFormModel.value.jobType).then(() => {
          tableDataInit()
        }).finally(() => {
          isSaving.value = false
          showModalRef.value = false
          formSelect.value.createZjJob = false
        })
      } else {
        console.error(errors)
        isSaving.value = false
      }
    })
  }

  if (formSelect.value.createBfJob) {
    bfJobModalFormRef.value?.validate((errors) => {
      if (!errors) {
        createBfJob(bfJobModalFormModel.value).then(() => {
          tableDataInit()
        }).finally(() => {
          isSaving.value = false
          showModalRef.value = false
          formSelect.value.createBfJob = false
        })
      } else {
        console.error(errors)
        isSaving.value = false
      }
    })
  }

  if (formSelect.value.createRhJob) {
    rhJobModalFormRef.value?.validate((errors) => {
      if (!errors) {
        createRhJob({
          projectId: rhJobModalFormModel.value.projectId,
          personId: rhJobModalFormModel.value.personId,
          tableName: rhJobModalFormModel.value.tableName
        }, projectTree.isBasicData, false).then(() => {
          tableDataInit()
        }).finally(() => {
          isSaving.value = false
          showModalRef.value = false
          formSelect.value.createRhJob = false
        })
      } else {
        console.error(errors)
        isSaving.value = false
      }
    })
  }

  if (formSelect.value.createRh2Job) {
    rh2JobModalFormRef.value?.validate((errors) => {
      if (!errors) {
        createRhJob({
          projectId: rh2JobModalFormModel.value.projectId,
          personId: rh2JobModalFormModel.value.personId,
          tableName: rh2JobModalFormModel.value.tableName
        }, projectTree.isBasicData, true).then(() => {
          tableDataInit()
        }).finally(() => {
          isSaving.value = false
          showModalRef.value = false
          formSelect.value.createRh2Job = false
        })
      } else {
        console.error(errors)
        isSaving.value = false
      }
    })
  }

  if (formSelect.value.createQcJob) {
    qcJobModalFormRef.value?.validate((errors) => {
      if (!errors) {
        createQcJob(qcJobModalFormModel.value).then(() => {
          tableDataInit()
        }).finally(() => {
          isSaving.value = false
          showModalRef.value = false
          formSelect.value.createQcJob = false
        })
      } else {
        console.error(errors)
        isSaving.value = false
      }
    })
  }

  if (formSelect.value.quickCreate) {
    if (!isEmpty(quickCreateModalFormModel.value.jobSelect)) {
      quickCreateModalFormRef.value?.validate(async (errors) => {
        if (!errors) {
          await quickCreate().then(() => {
            tableDataInit()
          }).finally(() => {
            isSaving.value = false
            showModalRef.value = false
            formSelect.value.quickCreate = false
          })
        } else {
          console.error(errors)
        }
      })
    } else {
      window.$message.warning("未选择任务")
    }
  }

  if (formSelect.value.validConfig) {
    validConfigModalFormRef.value?.validate(async (errors) => {
      if (!errors) {
        if (!isValidConfigRef.value) {
          create_valid_config(validConfigModalFormModel.value).then(async res => {
            if (res.code == 200) {
              window.$message.success('配置成功')
              isValidConfigRef.value = await getDCTableIsValidConfig(projectRef.value.tableAbbr, queryParam.value.tableAbbr)
            } else {
              window.$message.error(res.message)
            }
          }).finally(() => {
            isSaving.value = false
            showModalRef.value = false
            formSelect.value.validConfig = false
          })
        }

      } else {
        console.error(errors)
      }
    })
  }
}
// endregion
const quickCreate = async () => {
  const project = (await find_by_project_id(queryParam.value.projectId))

  if (quickCreateModalFormModel.value.jobSelect.includes('cj')) {
    const targetTableColumns = (await get_columns('6', quickCreateModalFormModel.value.targetTableName))
    if (!isEmpty(targetTableColumns)) {
      await createCjJob({
        name: `cj_${project.projectAbbr}_${quickCreateModalFormModel.value.tableName}`,
        sourceTableName: quickCreateModalFormModel.value.sourceTableName,
        targetTableName: quickCreateModalFormModel.value.targetTableName,
        projectId: quickCreateModalFormModel.value.projectId,
        sourceDataSourceId: '7',
        targetDataSourceId: '6'
      }, sourceTableColumnsRef.value, targetTableColumns)
    } else {
      window.$message.warning('采集目标表不存在')
    }
  }

  if (quickCreateModalFormModel.value.jobSelect.includes('zj')) {
    await createZjJob({
      projectId: quickCreateModalFormModel.value.projectId,
      personId: quickCreateModalFormModel.value.personId,
      tableName: quickCreateModalFormModel.value.tableName
    }, quickCreateModalFormModel.value.zjJobType)
  }

  if (quickCreateModalFormModel.value.jobSelect.includes('bf')) {
    await createBfJob(quickCreateModalFormModel.value)
  }

  if (quickCreateModalFormModel.value.jobSelect.includes('rh') || quickCreateModalFormModel.value.jobSelect.includes('rh1')) {
    await createRhJob({
      projectId: quickCreateModalFormModel.value.projectId,
      personId: quickCreateModalFormModel.value.personId,
      tableName: quickCreateModalFormModel.value.tableName
    }, projectTree.isBasicData, false)
  }

  if (quickCreateModalFormModel.value.jobSelect.includes('rh2')) {
    await createRhJob({
      projectId: quickCreateModalFormModel.value.projectId,
      personId: quickCreateModalFormModel.value.personId,
      tableName: quickCreateModalFormModel.value.tableName
    }, projectTree.isBasicData, true)
  }

  if (quickCreateModalFormModel.value.jobSelect.includes('qc')) {
    await createQcJob(quickCreateModalFormModel.value)
  }

  if (quickCreateModalFormModel.value.jobSelect.includes('rk')) {
    await createRkJob({
      name: `rk_${project.projectAbbr}_${quickCreateModalFormModel.value.tableName}`,
      sourceDataSourceId: '6',
      sourceTableName: `df_${project?.tableAbbr || ''}_${quickCreateModalFormModel.value.tableName}_dwb`,
      targetDataSourceId: '8',
      targetTableName: `sztk_${quickCreateModalFormModel.value.tableName}`,
      projectId: quickCreateModalFormModel.value.projectId,
      personId: quickCreateModalFormModel.value.personId
    }, true, true)

  }

  if (quickCreateModalFormModel.value.jobSelect.includes('gx')) {
    await createGxJob({
      name: `gx_${project.projectAbbr}_${quickCreateModalFormModel.value.tableName}`,
      sourceTableName: `sztk_${quickCreateModalFormModel.value.tableName}`,
      targetTableName: `gdsztk_${quickCreateModalFormModel.value.tableName}`,
      projectId: project.projectId
    })
  }

}

// region 新增调度任务

const addSchedJobModalFormRef = ref<FormInst | null>(null);

const addSchedJobModalFormModel = ref({
  jobType: "大数据采集",
  jobContent: '',
  glueType: "DATAX",
  projectId: '',
  projectName: '',
  jobCron: '',
  jobDesc: '',
  jobGroup: 2,
  retry: '0',
  executorFailRetryCount: 0,
  jobTemplateId: '',
  subsystemName: "采集",
  sec: '*',
  min: 0,
  hour: '0,12',
  day: '?',
  month: '*',
  week: '*',
  year: '*'
})

const addSchedJobModalFormRules = {
  jobContent: {
    required: true
  },
  projectName: {
    required: true
  },
  retry: {
    required: true,
    trigger: ['change']
  },
  sec: {
    required: true,
    trigger: ['input'],
    message: ''
  },
  min: {
    type: 'number',
    required: true,
    trigger: ['change']
  },
  hour: {
    required: true,
    trigger: ['input'],
    message: ''
  },
  day: {
    required: true,
    trigger: ['input'],
    message: ''
  },
  month: {
    required: true,
    trigger: ['input'],
    message: ''
  },
  week: {
    required: true,
    trigger: ['input'],
    message: ''
  },
  year: {
    required: true,
    trigger: ['input'],
    message: ''
  }
}

let schedMinRange = {
  startMin: 0,
  endMIn: 59
}

const showCronUnConfigAlert = ref(false)

const addSchedJobModalFormModelInit = async (v: Job) => {
  addSchedJobModalFormModel.value.jobContent = v.jobName
  addSchedJobModalFormModel.value.jobDesc = v.jobName
  addSchedJobModalFormModel.value.jobTemplateId = v.id
  addSchedJobModalFormModel.value.projectName = (await get_project_by_pro_abbr(v.jobName.split("_")[1]))?.projectName || '未知项目'

  const cron = (await find_by_project_id(queryParam.value.projectId))?.cjCron || null
  if (cron != null) {
    showCronUnConfigAlert.value = false

    const minRange = cron.split(' ')[1]
    schedMinRange = {
      startMin: parseInt(minRange.split('-')[0]),
      endMIn: parseInt(minRange.split('-')[1]),
    }
    addSchedJobModalFormModel.value.min = schedMinRange.startMin
    addSchedJobModalFormModel.value.hour = cron.split(' ')[2]
  } else {
    showCronUnConfigAlert.value = true

    schedMinRange = {
      startMin: 0,
      endMIn: 59
    }
    addSchedJobModalFormModel.value.min = 0
    addSchedJobModalFormModel.value.hour = '0,12'
  }

  showModalRef.value = true
  modalTitle = '创建调度任务'
  confirmBtnText = '创建'
  formSelect.value.addSchedJob = true
}

// endregion

// region 创建采集任务

const cjJobModalFormRef = ref<FormInst | null>(null);
const cjJobModalFormModel = ref<CjFormModelType>({
  name: '',
  sourceDataSourceId: '7',
  sourceTableName: '',
  targetDataSourceId: '6',
  targetTableName: '',
  projectId: ''
})
const cjJobModalFormRules = {
  sourceTableName: {
    required: true,
    trigger: ['change'],
    message: '选择来源表'
  },
}

const sourceTableOptions = ref<Array<SelectOption | SelectGroupOption>>()

const sourceTableColumnsRef = ref([])
let targetTableColumnsRef = ref([])

const createCjJobModalInit = async (project: ProjectInfo, row: Job) => {
  sourceTableOptions.value = await getTablesOptions(cjJobModalFormModel.value.sourceDataSourceId)
  cjJobModalFormModel.value.name = row.jobName
  cjJobModalFormModel.value.targetTableName = `di_${project.tableAbbr}_${queryParam.value.tableAbbr.toLowerCase()}_temp_ods`
  cjJobModalFormModel.value.projectId = project.projectId

  showModalRef.value = true
  modalTitle = '创建采集任务'
  confirmBtnText = '创建'
  formSelect.value.createCjJob = true
}

const handleSourceTableSearch = async (query: string) => {
  sourceTableOptions.value = await getTablesOptions(cjJobModalFormModel.value.sourceDataSourceId, query)
}

const handleSourceTableUpdate = async () => {
  sourceTableColumnsRef.value = (await get_columns(cjJobModalFormModel.value.sourceDataSourceId, cjJobModalFormModel.value.sourceTableName))
}

const handleQuickCreateSourceTableSearch = async (query: string) => {
  sourceTableOptions.value = await getTablesOptions(quickCreateModalFormModel.value.sourceDataSourceId, query)
}

const handleQuickCreateSourceTableUpdate = async () => {
  sourceTableColumnsRef.value = (await get_columns(quickCreateModalFormModel.value.sourceDataSourceId, quickCreateModalFormModel.value.sourceTableName))
}

//endregion

//region 创建质检任务

const zjJobModalFormRef = ref<FormInst | null>(null);

const zjJobModalFormModel = ref({
  tableName: '',
  projectId: '',
  projectName: '',
  personId: '',
  jobType: '2'
})
const zjJobModalFormRules = {
  personId: {
    required: true,
    trigger: ['change'],
    message: '请选择责任人'
  }
}

const createZjJobModalInit = (project: ProjectInfo) => {
  zjJobModalFormModel.value.tableName = queryParam.value.tableAbbr.toString().toUpperCase()
  zjJobModalFormModel.value.projectId = queryParam.value.projectId
  zjJobModalFormModel.value.projectName = project.projectName
  zjJobModalFormModel.value.personId = datacenterProjectRef.value?.userId

  showModalRef.value = true
  modalTitle = '创建质检任务'
  confirmBtnText = '创建'
  formSelect.value.createZjJob = true
}

//endregion

//region 创建备份任务

const bfJobModalFormRef = ref<FormInst | null>(null);

const bfJobModalFormModel = ref({
  tableName: '',
  projectId: '',
  projectName: '',
  personId: ''
})
const bfJobModalFormRules = {
  personId: {
    required: true,
    trigger: ['change'],
    message: '请选择责任人'
  }
}

const createBfJobModalInit = (project: ProjectInfo) => {
  bfJobModalFormModel.value.tableName = queryParam.value.tableAbbr.toString().toUpperCase()
  bfJobModalFormModel.value.projectId = queryParam.value.projectId
  bfJobModalFormModel.value.projectName = project.projectName
  bfJobModalFormModel.value.personId = datacenterProjectRef.value?.userId

  showModalRef.value = true
  modalTitle = '创建备份任务'
  confirmBtnText = '创建'
  formSelect.value.createBfJob = true
}

//endregion

//region 创建单表融合任务
const rhJobModalFormRef = ref<FormInst | null>(null);

const rhJobModalFormModel = ref({
  tableName: '',
  projectId: '',
  projectName: '',
  personId: ''
})
const rhJobModalFormRules = {
  personId: {
    required: true,
    trigger: ['change'],
    message: '请选择责任人'
  }
}

const createRhJobModalInit = (project: ProjectInfo) => {
  rhJobModalFormModel.value.tableName = queryParam.value.tableAbbr.toString().toUpperCase()
  rhJobModalFormModel.value.projectId = queryParam.value.projectId
  rhJobModalFormModel.value.projectName = project.projectName
  rhJobModalFormModel.value.personId = datacenterProjectRef.value?.userId

  confirmBtnText = '创建'
}
//endregion

//region 创建多表融合任务
const rh2JobModalFormRef = ref<FormInst | null>(null);

const rh2JobModalFormModel = ref({
  tableName: '',
  projectId: '',
  projectName: '',
  personId: ''
})
const rh2JobModalFormRules = {
  personId: {
    required: true,
    trigger: ['change'],
    message: '请选择责任人'
  }
}

const createRh2JobModalInit = (project: ProjectInfo) => {
  rh2JobModalFormModel.value.tableName = queryParam.value.tableAbbr.toString().toUpperCase()
  rh2JobModalFormModel.value.projectId = queryParam.value.projectId
  rh2JobModalFormModel.value.projectName = project.projectName
  rh2JobModalFormModel.value.personId = datacenterProjectRef.value?.userId

  confirmBtnText = '创建'
}
//endregion

//region 创建清除任务
const qcJobModalFormRef = ref<FormInst | null>(null);

const qcJobModalFormModel = ref({
  tableName: '',
  projectId: '',
  projectName: '',
  personId: ''
})
const qcJobModalFormRules = {
  personId: {
    required: true,
    trigger: ['change'],
    message: '请选择责任人'
  }
}

const createQcJobModalInit = (project: ProjectInfo) => {
  qcJobModalFormModel.value.tableName = queryParam.value.tableAbbr.toString().toUpperCase()
  qcJobModalFormModel.value.projectId = queryParam.value.projectId
  qcJobModalFormModel.value.projectName = project.projectName
  qcJobModalFormModel.value.personId = datacenterProjectRef.value?.userId

  confirmBtnText = '创建'
}

//endregion

//region 快捷创建
const quickCreateModalFormRef = ref<FormInst | null>(null);

const quickCreateModalFormModel = ref({
  jobSelect: [],
  sourceDataSourceId: '7',
  sourceTableName: '',
  targetTableName: '',
  tableName: '',
  projectId: '',
  projectName: '',
  personId: '',
  zjJobType: '2'
})

const quickCreateModalFormRules = {
  personId: {
    required: true,
    trigger: ['change'],
    message: '请选择责任人'
  },
  sourceTableName: {
    required: true,
    trigger: ['change'],
    message: '选择来源表'
  },
}

const jobTypeTreeOptionsRef = ref<TreeSelectOption[]>([])

const jobTypeTreeOptionsInit = () => {
  jobTypeTreeOptionsRef.value = cloneDeep([
    {
      label: 'DataX任务',
      key: '0',
      children: [
        {
          label: '数据采集任务',
          key: 'cj',
        },
        {
          label: '数据共享任务',
          key: 'gx',
          disabled: !projectTree.isBasicData
        }
      ]
    },
    {
      label: '工作流任务',
      key: '1',
      children: [
        {
          label: '数据质检任务',
          key: 'zj',
        },
        {
          label: '数据备份任务',
          key: 'bf',
        },
        {
          label: '数据清除任务',
          key: 'qc',
        },
        {
          label: '数据融合任务',
          key: 'rh',
          disabled: !projectTree.isBasicData
        },
        {
          label: '单表融合任务',
          key: 'rh1',
          disabled: projectTree.isBasicData
        },
        {
          label: '多表融合任务',
          key: 'rh2',
          disabled: projectTree.isBasicData
        },
        {
          label: '数据入库任务',
          key: 'rk',
          disabled: !projectTree.isBasicData
        }
      ]
    }
  ])
}

const quickCreateModalInit = async () => {
  modalTitle = '快捷创建任务'
  formSelect.value.quickCreate = true
  const project = (await find_by_project_id(queryParam.value.projectId))
  quickCreateModalFormModel.value.jobSelect = []
  quickCreateModalFormModel.value.tableName = queryParam.value.tableAbbr.toString().toLowerCase()
  quickCreateModalFormModel.value.projectId = queryParam.value.projectId
  quickCreateModalFormModel.value.projectName = project.projectName
  quickCreateModalFormModel.value.personId = datacenterProjectRef.value?.userId

  handleJobTreeOptionsUpdate()

  confirmBtnText = '创建'

  showModalRef.value = true
}

const handleJobTreeOptionsUpdate = () => {

  //先获取已创建的任务名
  const disabledJobs = tableDataRef.value.filter(job => job.status != -1).map((
      v => (v.jobName.split('_')[0])
  ))

  jobTypeTreeOptionsInit()

  jobTypeTreeOptionsRef.value = updateTreeOptionDisabledByKey(jobTypeTreeOptionsRef.value, disabledJobs)

  if (!jobTypeTreeOptionsRef.value[0].children.some((child) => !child.disabled)) {
    jobTypeTreeOptionsRef.value[0].disabled = true
  }

  if (!jobTypeTreeOptionsRef.value[1].children.some((child) => !child.disabled)) {
    jobTypeTreeOptionsRef.value[1].disabled = true
  }
}

const updateTreeOptionDisabledByKey = (treeOptions: TreeSelectOption[], disableKeys: string[]) => {
  for (const option of treeOptions) {
    if (disableKeys.includes(option.key as string)) {
      // 找到了指定的节点，更新其 disabled 属性
      option.disabled = true;
      // 检查是否需要更新父节点的 disabled 属性
      // checkParentNodeDisabled(treeOptions, option.key as string);
    }
    if (option.children) {
      // 继续递归查找子节点
      updateTreeOptionDisabledByKey(option.children, disableKeys);
    }
  }
  return treeOptions
}

const handleJobTreeUpdateValue = async (v: string[]) => {
  if (v.includes('cj')) {
    const project = (await find_by_project_id(queryParam.value.projectId))
    sourceTableOptions.value = await getTablesOptions(cjJobModalFormModel.value.sourceDataSourceId)
    quickCreateModalFormModel.value.targetTableName = `di_${project.tableAbbr}_${quickCreateModalFormModel.value.tableName}_temp_ods`
  }
}
//endregion

//region 质检配置管理

// 组织机构下拉值
const mechanismOptions = ref<Array<SelectOption | SelectGroupOption>>()

const validConfigModalFormRef = ref<FormInst | null>(null);

const validConfigModalFormModel = ref({
  dbId: '6',
  dbName: "数据中台（TBDS）",
  mechanismId: '',
  mechanismName: '',
  pkeyName: '',
  cdBatchName: 'cd_batch',
  tableName: ''
})

const validConfigModalFormRules = {
  mechanismId: {
    required: true,
    trigger: ['change'],
    message: '请选择组织机构'
  },
  pkeyName: {
    required: true,
    trigger: ['input'],
    message: '请输入主键字段'
  },
  cdBatchName: {
    required: true,
    trigger: ['input'],
    message: '请输入批次号字段'
  }
}

const validConfigModalInit = async () => {

  const validTableName = `di_${projectRef.value.tableAbbr}_${queryParam.value.tableAbbr.toString().toLowerCase()}_temp_ods`

  if (isValidConfigRef.value) {
    // 若已配置
    get_valid_config_page(validTableName).then(res => {
      const data = res.data.records[0]
      validConfigModalFormModel.value.dbId = data.dbId
      validConfigModalFormModel.value.dbName = data.dbName
      validConfigModalFormModel.value.mechanismId = data.mechanismId
      validConfigModalFormModel.value.mechanismName = data.mechanismName
      validConfigModalFormModel.value.pkeyName = data.pkeyName
      validConfigModalFormModel.value.cdBatchName = data.cdBatchName
      validConfigModalFormModel.value.tableName = data.tableName
    })

    confirmBtnText = '确定'
  } else {
    validConfigModalFormModel.value.tableName = validTableName
    validConfigModalFormModel.value.mechanismId = ''
    validConfigModalFormModel.value.mechanismName = ''
    validConfigModalFormModel.value.pkeyName = (await get_table_sql({tableName: queryParam.value.tableAbbr.toString()}))[0].pColName.toLowerCase()
    validConfigModalFormModel.value.cdBatchName = 'cd_batch'

    confirmBtnText = '保存'
  }

  mechanismOptions.value = (await gte_usrc_org_tree()).data.sort(customSort).map(((v: {
    name: string;
    id: string;
  }) => ({
    label: `${v.name}`,
    value: v.id
  })))

  modalTitle = '质检配置管理'

  formSelect.value.validConfig = true
  showModalRef.value = true
}

const customSort = (a: any, b: any) => {
  // Check if both strings start with '广东省'
  const startsWithGuangDongA = a.name.startsWith('广东省');
  const startsWithGuangDongB = b.name.startsWith('广东省');

  if (startsWithGuangDongA && !startsWithGuangDongB) {
    return -1; // Move `a` before `b`
  } else if (!startsWithGuangDongA && startsWithGuangDongB) {
    return 1; // Move `b` before `a`
  } else {
    // Both start with '广东省' or don't start with it
    return a.name.localeCompare(b.name);
  }
};

const handlemechanismIdUpdate = () => {
  validConfigModalFormModel.value.mechanismName = mechanismOptions.value.filter(item => item.value == validConfigModalFormModel.value.mechanismId)[0].label as string
}

//endregion

// region 日志
const showDrawerRef = ref(false)
const drawerJobRef = ref<Job>(null)

const showJobLogDrawer = (v: Job) => {
  drawerJobRef.value = v
  showDrawerRef.value = true
}
//endregion

// region 质检规则更新
const showUpdateZjJobModalRef = ref(false)
const updateZjJobFormRef = ref({
  tableName: '',
  type: '1',
  jobId: ''
})

const showUpdateZjJobModal = (v: Job) => {
  updateZjJobFormRef.value.jobId = v.id
  updateZjJobFormRef.value.tableName = queryParam.value.tableAbbr.toString().toUpperCase()

  showUpdateZjJobModalRef.value = true
}

const isUpdateZjJob = ref(false)

const onUpdateZjJob = () => {
  isUpdateZjJob.value = true

  updateZjJob(updateZjJobFormRef.value, false)
      .then(() => {
        tableDataInit()
        showUpdateZjJobModalRef.value = false
      })
      .finally(() => isUpdateZjJob.value = false)
}
//endregion

//region 预览
const showPreviewModalRef = ref(false)

let previewModalTitle = '';

const previewColsRef = ref([])

const tableHeadCol = ref([])

const tableRows = ref([])

const previewTableDataRef = ref([])

const isPreviewTableLoading = ref(false)
const tablePreview = async (row: Job) => {
  previewColsRef.value = []
  previewTableDataRef.value = []

  isPreviewTableLoading.value = true

  const jobInfo = await get_dataXJob(row.id)
  const tableName = jobInfo.data.jobTemplate.readerTable

  previewModalTitle = tableName

  get_table_data(tableName, 10, true).then(res => {
    tableHeadCol.value = res[0]
    tableRows.value = res.slice(1)

    // 创建表头
    previewColsRef.value = res[0].map((col: string) => ({
      title: col,
      key: col,
      fixed: col === 'cd_time' ? 'right' : false,
      width: '200px',
      ellipsis: {
        tooltip: true
      }
    }));

    // 处理数据
    previewTableDataRef.value = transform(previewColsRef.value, res.slice(1).map((item: {
          [s: string]: unknown;
        } | ArrayLike<unknown>) =>
            Object.values(item).map(
                (value) => {
                  if (value === null) {
                    return 'null'
                  } else if (value instanceof Date) {
                    return formatDate(value)
                  } else {
                    return value.toString()
                  }
                }
            )
    ));
  }).finally(() => isPreviewTableLoading.value = false)

  showPreviewModalRef.value = true
}

interface ObjA {
  title: string;
  key: string
}

type ObjB = Array<string[]>;

const transform = (objA: ObjA[], objB: ObjB): Record<string, string>[] => {
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
// endregion

// region dataX任务配置

const showDataXJobSetupModalRef = ref(false)

const dataXJobSetupModalTitle = '任务配置';
const isDataXJobSetupSaving = ref(false)
const dataXJobSetupFormRef = ref<FormInst | null>(null);
const SchedJobSetupFormRef = ref<FormInst | null>(null);
const dataXJobSetupModelRef = ref({
  projectName: '',
  readerTable: '',
  incStartTime: null,
  lastExecTime: new Date(),
  jonInfo: {} as JobTemplateType,
  schedJob: {
    retry: '0',
    executorFailRetryCount: 0,
    sec: '*',
    min: 0,
    hour: '0,12',
    day: '?',
    month: '*',
    week: '*',
    year: '*'
  }
})

const dataXJobSetupModelRules = {
  readerTable: {
    required: true,
    trigger: ['change'],
    message: '请选择来源表'
  },
  incStartTime: {
    type: 'number',
    required: true,
    trigger: ['change'],
    message: '请输入增量开始时间'
  },
  retry: {
    required: true,
    trigger: ['change']
  },
  sec: {
    required: true,
    trigger: ['input'],
    message: ''
  },
  min: {
    type: 'number',
    required: true,
    trigger: ['change']
  },
  hour: {
    required: true,
    trigger: ['input'],
    message: ''
  },
  day: {
    required: true,
    trigger: ['input'],
    message: ''
  },
  month: {
    required: true,
    trigger: ['input'],
    message: ''
  },
  week: {
    required: true,
    trigger: ['input'],
    message: ''
  },
  year: {
    required: true,
    trigger: ['input'],
    message: ''
  }
}

const incStartTimeShorCuts = ref({
  '重置': new Date('1971-01-01 00:00:00').getTime(),
  '上次执行时间': () => dataXJobSetupModelRef.value.lastExecTime.getTime()
})

const showDataXJobSetupModal = async (row: Job) => {
  sourceTableOptions.value = await getTablesOptions(cjJobModalFormModel.value.sourceDataSourceId)

  dataXJobSetupModelRef.value.jonInfo = (await get_dataXJob(row.id)).data.jobTemplate as JobTemplateType

  if (!dataXJobSetupModelRef.value.jonInfo.replaceParam) {
    dataXJobSetupModelRef.value.jonInfo.replaceParam = "-DlastTime='%s' -DcurrentTime='%s'"
  }

  if (!dataXJobSetupModelRef.value.jonInfo.replaceParamType) {
    dataXJobSetupModelRef.value.jonInfo.replaceParamType = 'yyyy-MM-dd HH:mm:ss'
  }

  dataXJobSetupModelRef.value.projectName = projectRef.value.projectName
  dataXJobSetupModelRef.value.readerTable = dataXJobSetupModelRef.value.jonInfo.readerTable
  dataXJobSetupModelRef.value.incStartTime = new Date(dataXJobSetupModelRef.value.jonInfo.incStartTime).getTime()

  const schedJob = await getSchedJob(row.jobName)
  dataXJobSetupModelRef.value.lastExecTime = new Date(schedJob.incStartTime)

  const cronItems = convertCronExpression(schedJob.jobCron)

  dataXJobSetupModelRef.value.schedJob.retry = schedJob?.retry || '0'
  dataXJobSetupModelRef.value.schedJob.executorFailRetryCount = schedJob.executorFailRetryCount
  dataXJobSetupModelRef.value.schedJob.sec = cronItems.seconds
  dataXJobSetupModelRef.value.schedJob.min = parseInt(cronItems.minutes)
  dataXJobSetupModelRef.value.schedJob.hour = cronItems.hours
  dataXJobSetupModelRef.value.schedJob.day = cronItems.dayOfMonth
  dataXJobSetupModelRef.value.schedJob.month = cronItems.month
  dataXJobSetupModelRef.value.schedJob.week = cronItems.dayOfWeek
  dataXJobSetupModelRef.value.schedJob.year = cronItems.year

  showDataXJobSetupModalRef.value = true
}

const handleSourceTableSearchByDataXJobSetup = async (query: string) => {
  sourceTableOptions.value = await getTablesOptions(dataXJobSetupModelRef.value.jonInfo.readerId.toString(), query)
}
const handleSourceTableUpdateByDataXJobSetup = async () => {
  sourceTableColumnsRef.value = (await get_columns(dataXJobSetupModelRef.value.jonInfo.readerId.toString(), dataXJobSetupModelRef.value.jonInfo.readerTable))
}

const handleDataXJobSetupSave = async () => {
  isDataXJobSetupSaving.value = true

  dataXJobSetupFormRef.value?.validate(async errors => {
    if (!errors) {
      dataXJobSetupModelRef.value.jonInfo.incStartTime = formatDate(new Date(dataXJobSetupModelRef.value.incStartTime))
      if (dataXJobSetupModelRef.value.jonInfo.incrementType == 2) {
        dataXJobSetupModelRef.value.jonInfo.jobJson.job.content[0].reader.parameter.where = 'cd_time >= ${lastTime} and cd_time < ${currentTime}'
      }

      updateDataXJob(dataXJobSetupModelRef.value.jonInfo as JobTemplateType).then(async () => {

        // 更新采集任务后重新获取调度任务信息
        const schedJob = await getSchedJob(dataXJobSetupModelRef.value.jonInfo.jobDesc)

        schedJob.retry = dataXJobSetupModelRef.value.schedJob.retry
        schedJob.executorFailRetryCount = dataXJobSetupModelRef.value.schedJob.executorFailRetryCount
        schedJob.jobCron = `${dataXJobSetupModelRef.value.schedJob.sec} ${dataXJobSetupModelRef.value.schedJob.min} ${dataXJobSetupModelRef.value.schedJob.hour} ${dataXJobSetupModelRef.value.schedJob.day} ${dataXJobSetupModelRef.value.schedJob.month} ${dataXJobSetupModelRef.value.schedJob.week} ${dataXJobSetupModelRef.value.schedJob.year}`

        await update_sched_job(schedJob).then(res => {
          if (res.data == 'success') {
            window.$message.success('调度任务更新成功')
            tableDataInit()
            showDataXJobSetupModalRef.value = false
          } else {
            window.$message.error(res.msg)
            console.error(res)
          }
        })

      })
    } else {
      console.error(errors)
    }
  })

  isDataXJobSetupSaving.value = false
}
// endregion
</script>

<style scoped>

</style>
