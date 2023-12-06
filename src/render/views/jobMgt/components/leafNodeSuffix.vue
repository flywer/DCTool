<template>
  <div>
    <div ref="cjJob" class="node cj"/>
    <div ref="zj1Job" class="node zj1"/>
    <div ref="bfJob" class="node bf"/>
    <div ref="qcJob" class="node qc"/>
    <div ref="rh1Job" class="node rh1"/>
    <div ref="rh2Job" class="node rh2"/>
    <div ref="zj2Job" class="node zj2"/>
    <div ref="rh3Job" class="node rh3"/>
  </div>
</template>

<script setup lang="ts">
import {JobStatus} from "@common/types/jobMgt";
import {useProjectTreeStore} from "@render/stores/projectTree";
import {computed, onMounted, ref, watch} from 'vue'

const props = defineProps({
  nodeKey: String,
})

const cjJob = ref(null)
const zj1Job = ref(null)
const bfJob = ref(null)
const qcJob = ref(null)
const rh1Job = ref(null)
const rh2Job = ref(null)
const zj2Job = ref(null)
const rh3Job = ref(null)

onMounted(() => {
  init()
})
const projectTree = useProjectTreeStore()

const nodeSuffixUpdateTime = computed(() => projectTree.nodeSuffixUpdateTime)

watch(nodeSuffixUpdateTime, () => {
  init()
})
const init = () => {
  const suffix = useProjectTreeStore().nodeSuffix.get(props.nodeKey)
  if (suffix != null) {
    cjJob.value.className = 'node cj'
    zj1Job.value.className = 'node zj1'
    bfJob.value.className = 'node bf'
    qcJob.value.className = 'node qc'
    rh1Job.value.className = 'node rh1'
    rh2Job.value.className = 'node rh2'
    zj2Job.value.className = 'node zj2'
    rh3Job.value.className = 'node rh3'

    switch (suffix.cjJob) {
      case JobStatus.noCreate:
        cjJob.value.className += ' noCreate'
        break
      case JobStatus.noConfig:
        cjJob.value.className += ' noConfig'
        break
      case JobStatus.deactivate:
        cjJob.value.className += ' deactivate'
        break
      case JobStatus.enable:
        cjJob.value.className += ' enable'
        break
      case JobStatus.running:
        cjJob.value.className += ' running'
        break
      case JobStatus.exception:
        cjJob.value.className += ' exception'
        break
      case JobStatus.noFeedback:
        cjJob.value.className += ' noFeedback'
        break
    }

    switch (suffix.zj1Job) {
      case JobStatus.noCreate:
        zj1Job.value.className += ' noCreate'
        break
      case JobStatus.noConfig:
        zj1Job.value.className += ' noConfig'
        break
      case JobStatus.deactivate:
        zj1Job.value.className += ' deactivate'
        break
      case JobStatus.enable:
        zj1Job.value.className += ' enable'
        break
      case JobStatus.running:
        zj1Job.value.className += ' running'
        break
      case JobStatus.exception:
        zj1Job.value.className += ' exception'
        break
      case JobStatus.noFeedback:
        zj1Job.value.className += ' noFeedback'
        break
    }

    switch (suffix.bfJob) {
      case JobStatus.noCreate:
        bfJob.value.className += ' noCreate'
        break
      case JobStatus.noConfig:
        bfJob.value.className += ' noConfig'
        break
      case JobStatus.deactivate:
        bfJob.value.className += ' deactivate'
        break
      case JobStatus.enable:
        bfJob.value.className += ' enable'
        break
      case JobStatus.running:
        bfJob.value.className += ' running'
        break
      case JobStatus.exception:
        bfJob.value.className += ' exception'
        break
      case JobStatus.noFeedback:
        bfJob.value.className += ' noFeedback'
        break
    }

    switch (suffix.qcJob) {
      case JobStatus.noCreate:
        qcJob.value.className += ' noCreate'
        break
      case JobStatus.noConfig:
        qcJob.value.className += ' noConfig'
        break
      case JobStatus.deactivate:
        qcJob.value.className += ' deactivate'
        break
      case JobStatus.enable:
        qcJob.value.className += ' enable'
        break
      case JobStatus.running:
        qcJob.value.className += ' running'
        break
      case JobStatus.exception:
        qcJob.value.className += ' exception'
        break
      case JobStatus.noFeedback:
        qcJob.value.className += ' noFeedback'
        break
    }

    switch (suffix.rh1Job) {
      case JobStatus.noCreate:
        rh1Job.value.className += ' noCreate'
        break
      case JobStatus.noConfig:
        rh1Job.value.className += ' noConfig'
        break
      case JobStatus.deactivate:
        rh1Job.value.className += ' deactivate'
        break
      case JobStatus.enable:
        rh1Job.value.className += ' enable'
        break
      case JobStatus.running:
        rh1Job.value.className += ' running'
        break
      case JobStatus.exception:
        rh1Job.value.className += ' exception'
        break
      case JobStatus.noFeedback:
        rh1Job.value.className += ' noFeedback'
        break
    }

    switch (suffix.rh2Job) {
      case JobStatus.noCreate:
        rh2Job.value.className += ' noCreate'
        break
      case JobStatus.noConfig:
        rh2Job.value.className += ' noConfig'
        break
      case JobStatus.deactivate:
        rh2Job.value.className += ' deactivate'
        break
      case JobStatus.enable:
        rh2Job.value.className += ' enable'
        break
      case JobStatus.running:
        rh2Job.value.className += ' running'
        break
      case JobStatus.exception:
        rh2Job.value.className += ' exception'
        break
      case JobStatus.noFeedback:
        rh2Job.value.className += ' noFeedback'
        break
    }

    switch (suffix.zj2Job) {
      case JobStatus.noCreate:
        zj2Job.value.className += ' noCreate'
        break
      case JobStatus.noConfig:
        zj2Job.value.className += ' noConfig'
        break
      case JobStatus.deactivate:
        zj2Job.value.className += ' deactivate'
        break
      case JobStatus.enable:
        zj2Job.value.className += ' enable'
        break
      case JobStatus.running:
        zj2Job.value.className += ' running'
        break
      case JobStatus.exception:
        zj2Job.value.className += ' exception'
        break
      case JobStatus.noFeedback:
        zj2Job.value.className += ' noFeedback'
        break
    }

    switch (suffix.rh3Job) {
      case JobStatus.noCreate:
        rh3Job.value.className += ' noCreate'
        break
      case JobStatus.noConfig:
        rh3Job.value.className += ' noConfig'
        break
      case JobStatus.deactivate:
        rh3Job.value.className += ' deactivate'
        break
      case JobStatus.enable:
        rh3Job.value.className += ' enable'
        break
      case JobStatus.running:
        rh3Job.value.className += ' running'
        break
      case JobStatus.exception:
        rh3Job.value.className += ' exception'
        break
      case JobStatus.noFeedback:
        rh3Job.value.className += ' noFeedback'
        break
    }
  }
}


</script>

<style scoped>
.node {
  position: absolute;
  right: 6px;
  top: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
}

.cj {
  clip-path: polygon(51% 50%, 51% 0%, 100% 0%);
}

.zj1 {
  clip-path: polygon(100% 0%, 50% 50%, 100% 50%);
}

.bf {
  clip-path: polygon(50% 50%, 100% 50%, 100% 100%);
}

.qc {
  clip-path: polygon(51% 51%, 50% 100%, 100% 100%);
}

.rh1 {
  clip-path: polygon(49% 49%, 50% 100%, 0% 100%);
}

.rh2 {
  clip-path: polygon(50% 50%, 0% 50%, 0% 100%);
}

.zj2 {
  clip-path: polygon(50% 50%, 0% 50%, 0% 0%);
}

.rh3 {
  clip-path: polygon(49% 49%, 0% 0%, 50% 0%);
}

.noCreate {
  background-color: #656565;
}

.noConfig {
  background-color: #ffc062;
}

.deactivate {
  background-color: #bebebe;
}

.enable {
  background-color: #428eee;
}

.running {
  background-color: #27ec3f;
}

.exception {
  background-color: #ec1524;
}

.noFeedback {
  background-color: #98bfe5;
}


</style>
