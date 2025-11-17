<template>
  <el-dialog v-model="visible" title="拍照上传" width="1065px">
    <div class="box">
      <video id="videoCamera" ref="videoRef" class="canvas" :width="videoWidth" :height="videoHeight" autoplay></video>
      <canvas id="canvasCamera" ref="canvasRef" class="canvas" :width="videoWidth" :height="videoHeight"></canvas>
    </div>
    <template #footer>
      <div style="display: flex">
        <el-upload
          :action="baseUrl + 'file/upload'"
          :on-success="uploadSuccess"
          :show-file-list="false"
          accept=".jpg,.png,.jpge"
          style="margin-right: 10px"
        >
          <el-button :icon="Upload" size="small"> 上传图片 </el-button>
        </el-upload>

        <el-button :icon="Camera" size="small" @click="drawImage"> 拍照 </el-button>
        <el-button v-if="os" :icon="VideoCamera" size="small" @click="getCompetence"> 打开摄像头 </el-button>
        <el-button v-else :icon="SwitchButton" size="small" @click="stopNavigator"> 关闭摄像头 </el-button>
        <el-button :icon="Refresh" size="small" @click="resetCanvas"> 重置 </el-button>
        <el-button :icon="CircleClose" size="small" @click="onCancel"> 完成 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="Img">
import { nextTick, ref } from 'vue'
import { ElNotification } from 'element-plus'
import type { UploadProps } from 'element-plus'
import { Upload, Camera, VideoCamera, SwitchButton, Refresh, CircleClose } from '@element-plus/icons-vue'
import http from '@/utils/http'
import base from '@/utils/base'

const emit = defineEmits<{
  (e: 'imgChange', file: string): void
}>()

const visible = ref(false)
const loading = ref(false)
const os = ref(true) //控制摄像头开关
const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const videoWidth = ref(500)
const videoHeight = ref(400)
const imgSrc = ref('')

const baseUrl = base.get().url

let thisVideo: HTMLVideoElement | null = null
let thisContext: CanvasRenderingContext2D | null = null
let thisCanvas: HTMLCanvasElement | null = null
let stream: MediaStream | null = null

function onTake() {
  visible.value = true
  getCompetence()
}

function onCancel() {
  if (imgSrc.value) {
    uploadImg()
  }
  visible.value = false
  stopNavigator()
}

function uploadSuccess(response: any) {
  visible.value = false
  emit('imgChange', response.file)
}

function uploadImg() {
  if (!imgSrc.value) return
  const param = new FormData()
  param.append('file', base64toFile(imgSrc.value))
  http.post('file/upload', param).then((res: any) => {
    emit('imgChange', res.data.file)
  })
}

function base64toFile(dataurl: string, filename = 'file') {
  const arr = dataurl.split(',')
  const mimeMatch = arr[0].match(/:(.*?);/)
  if (!mimeMatch) throw new Error('Invalid base64 string')
  const mime = mimeMatch[1]
  const suffix = mime.split('/')[1]
  const bstr = atob(arr[1])
  const n = bstr.length
  const u8arr = new Uint8Array(n)
  for (let i = 0; i < n; i++) {
    u8arr[i] = bstr.charCodeAt(i)
  }
  return new File([u8arr], `${filename}.${suffix}`, {
    type: mime,
  })
}

function getCompetence() {
  nextTick(() => {
    os.value = false //切换成关闭摄像头

    thisCanvas = canvasRef.value || (document.getElementById('canvasCamera') as HTMLCanvasElement)
    if (!thisCanvas) return

    thisContext = thisCanvas.getContext('2d')
    if (!thisContext) return

    thisVideo = videoRef.value || (document.getElementById('videoCamera') as HTMLVideoElement)
    if (!thisVideo) return

    // 旧版本浏览器可能根本不支持mediaDevices，我们首先设置一个空对象
    if (navigator.mediaDevices === undefined) {
      ;(navigator as any).mediaDevices = {}
    }

    // 一些浏览器实现了部分mediaDevices，我们不能只分配一个对象
    // 使用getUserMedia，因为它会覆盖现有的属性。
    // 这里，如果缺少getUserMedia属性，就添加它。
    if (navigator.mediaDevices.getUserMedia === undefined) {
      ;(navigator.mediaDevices as any).getUserMedia = function (constraints: MediaStreamConstraints) {
        // 首先获取现存的getUserMedia(如果存在)
        const getUserMedia =
          (navigator as any).webkitGetUserMedia || (navigator as any).mozGetUserMedia || (navigator as any).getUserMedia

        // 有些浏览器不支持，会返回错误信息
        // 保持接口一致
        if (!getUserMedia) {
          return Promise.reject(new Error('getUserMedia is not implemented in this browser'))
        }

        // 否则，使用Promise将调用包装到旧的navigator.getUserMedia
        return new Promise((resolve, reject) => {
          getUserMedia.call(navigator, constraints, resolve, reject)
        })
      }
    }

    const constraints: MediaStreamConstraints = {
      audio: false,
      video: {
        width: videoWidth.value,
        height: videoHeight.value,
        // @ts-ignore - transform is not in standard types but some browsers support it
        transform: 'scaleX(-1)',
      },
    }

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((mediaStream) => {
        stream = mediaStream
        if (!thisVideo) return
        // 旧的浏览器可能没有srcObject
        if ('srcObject' in thisVideo) {
          thisVideo.srcObject = mediaStream
        } else {
          // 避免在新的浏览器中使用它，因为它正在被弃用。
          // MediaStream 不能直接用于 createObjectURL，应该使用 srcObject
          // 如果浏览器不支持 srcObject，则跳过
          console.warn('Browser does not support srcObject, please use a modern browser')
        }

        thisVideo.onloadedmetadata = function () {
          if (thisVideo) {
            thisVideo.play()
          }
        }
      })
      .catch(err => {
        ElNotification({
          title: '警告',
          message: '没有开启摄像头权限或浏览器版本不兼容.',
          type: 'warning',
        })
        console.error('getUserMedia error:', err)
      })
  })
}

function drawImage() {
  if (!thisContext || !thisVideo) return
  // 点击，canvas画图
  thisContext.drawImage(thisVideo, 0, 0, videoWidth.value, videoHeight.value)
  // 获取图片base64链接
  if (thisCanvas) {
    imgSrc.value = thisCanvas.toDataURL('image/png')
  }
}

function clearCanvas(id: string) {
  const c = document.getElementById(id) as HTMLCanvasElement
  if (!c) return
  const cxt = c.getContext('2d')
  if (!cxt) return
  cxt.clearRect(0, 0, c.width, c.height)
}

function resetCanvas() {
  imgSrc.value = ''
  clearCanvas('canvasCamera')
}

function stopNavigator() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
    stream = null
  }
  if (thisVideo && thisVideo.srcObject) {
    const tracks = (thisVideo.srcObject as MediaStream).getTracks()
    tracks.forEach(track => track.stop())
    thisVideo.srcObject = null
  }
  if (thisVideo && thisVideo.src) {
    window.URL.revokeObjectURL(thisVideo.src)
    thisVideo.src = ''
  }
  os.value = true //切换成打开摄像头
}

defineExpose({
  onTake,
})
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.avatar-uploader .el-upload {
  border: 1px dashed #ccc;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
  border: 1px dashed #ccc;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
