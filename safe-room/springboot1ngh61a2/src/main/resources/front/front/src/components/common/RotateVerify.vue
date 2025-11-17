<template>
  <div class="rotateverify-contaniner">
    <div class="rotate-can-wrap">
      <canvas ref="rotateCanRef" class="rotate-can" width="200" height="200"></canvas>
      <div ref="statusBgRef" class="status-bg"></div>
    </div>
    <div class="control-wrap">
      <div class="control-tips">
        <span ref="cTipsTxtRef" class="c-tips-txt">{{ initText }}</span>
      </div>
      <div ref="slideDragWrapRef" class="slide-drag-wrap">
        <div ref="controlBorWrapRef" class="control-bor-wrap">
          <div ref="slideDragBtnRef" class="control-btn">
            <span class="control-btn-ico"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

// Props
interface Props {
  initText?: string
  slideImage?: string | string[]
  slideAreaNum?: number
}

const props = withDefaults(defineProps<Props>(), {
  initText: '滑动将图片转正',
  slideImage: '',
  slideAreaNum: 10
})

// Emits
const emit = defineEmits<{
  success: [state: boolean]
}>()

// Refs
const rotateCanRef = ref<HTMLCanvasElement>()
const statusBgRef = ref<HTMLDivElement>()
const cTipsTxtRef = ref<HTMLSpanElement>()
const slideDragWrapRef = ref<HTMLDivElement>()
const controlBorWrapRef = ref<HTMLDivElement>()
const slideDragBtnRef = ref<HTMLDivElement>()

// State
const verifyState = ref(false)
const dragTimerState = ref(false)
const disLf = ref(0)
const randRot = ref(0)
const sucLenMin = ref(0)
const sucLenMax = ref(0)
const aveRot = ref(0)
const xPos = ref(0)
const yPos = ref(0)
const slideImage = ref<HTMLImageElement>()

// Methods
function injectStyles() {
  const existingStyle = document.getElementById('rotateverify-styles')
  if (existingStyle) return

  try {
    const styleElement = document.createElement('style')
    styleElement.id = 'rotateverify-styles'
    styleElement.type = 'text/css'
    styleElement.textContent = getInlineCss()
    const head = document.head || document.getElementsByTagName('head')[0]
    if (head) {
      head.appendChild(styleElement)
    }
  } catch (error) {
    console.warn('Failed to inject RotateVerify styles:', error)
  }
}

function getInlineCss() {
  return `
    *{margin:0;padding:0;box-sizing:border-box;}
    .rotateverify-contaniner{margin:0 auto;}
    @-webkit-keyframes rotateverifyHorizontal{0%{-webkit-transform:translate(0px,0);-ms-transform:translate(0px,0);transform:translate(0px,0)}10%,30%,50%,70%,90%{-webkit-transform:translate(-1px,0);transform:translate(-1px,0)}20%,40%,60%,80%{-webkit-transform:translate(1px,0);transform:translate(1px,0)}100%{-webkit-transform:translate(0px,0);transform:translate(0px,0)}}
    @-moz-keyframes rotateverifyHorizontal{0%{-webkit-transform:translate(0px,0);-moz-transform:translate(0px,0);transform:translate(0px,0)}10%,30%,50%,70%,90%{-webkit-transform:translate(-1px,0);-moz-transform:translate(-1px,0);transform:translate(-1px,0)}20%,40%,60%,80%{-webkit-transform:translate(1px,0);-moz-transform:translate(1px,0);transform:translate(1px,0)}100%{-webkit-transform:translate(0px,0);-moz-transform:translate(0px,0);transform:translate(0px,0)}}
    @keyframes rotateverifyHorizontal{0%{-webkit-transform:translate(0px,0);-moz-transform:translate(0px,0);transform:translate(0px,0)}10%,30%,50%,70%,90%{-webkit-transform:translate(-1px,0);-moz-transform:translate(-1px,0);transform:translate(-1px,0)}20%,40%,60%,80%{-webkit-transform:translate(1px,0);-moz-transform:translate(1px,0);transform:translate(1px,0)}100%{-webkit-transform:translate(0px,0);-moz-transform:translate(0px,0);transform:translate(0px,0)}}
    .rotateverify-contaniner .control-horizontal{-webkit-animation:rotateverifyHorizontal .6s .2s ease both;-moz-animation:rotateverifyHorizontal .6s .2s ease both;animation:rotateverifyHorizontal .6s .2s ease both}
    .rotateverify-contaniner .rotate-can-wrap{position:relative;}
    .rotateverify-contaniner .status-bg{width:100%;height:100%;position:absolute;top:0;left:0;background-color:rgba(0,0,0,.3);background-repeat:no-repeat;background-position:center center;border-radius:100%;display:none;}
    .rotateverify-contaniner .status-bg.icon-dagou{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAH4AAABWCAYAAAAJ3CLTAAAAAXNSR0IArs4c6QAABFZJREFUeAHtncuO00AQRWdALFkiXsM0Az/FArGIhPg3EAvEazEL4AdY824eQsBXhNsTW1gmiduu6vct6cp20qmuuiftOMkoc3DAqM6B9Xq9gp5Dvzq5/VV1jbKhjQOAewSdQrvC3XeVflXkAIAeQ593ER/cflpR22230kH/MoA7tbs637Zl5XfvoKOL19DJjG4uEPwMt3IbuhC6a+PiudyaYT1+Dgign01A8H4+ZzVKCh3NvCX4rJBOF6MA3U3yeHomjsjGAQcdmnP1juH/Bd/OZUPUoxDg04DunjTXPabjkBwcUITu3voxSnCA0EugpFwjoSsbWkI6Qi+BknKNStDdFzZ8TVdmEyydIvQbwYpkYl0HCF3XzyKyEXoRmHSLJHRdP4vIRuhFYNItktB1/SwiG6EXgUm3SEA3kPRbNvc+nW/ZdNGEy9ZBt9hKgtDDIdLPDNIGspAkCF0fTbiMIG0gC0mC0MMh0s8M0gaykCQIXR9NuIwgbSALSYLQwyHSzwzSBrKQJAhdH024jCBtIAtJgtDDIdLPDNIGspAkCF0fTbiMIG0gC0mC0MMh0s8M0gaykCTiQ0e1d6CH0KdOj9xt+hbVlxE+GegrJAnne7yPYTHZJejJnordfZfrw6XTEbwxkIUkERe6ax3Vut9ImYp3GMCf0Rg9V+CJgSwkiSTQ786omPAH4OGbgSwkifjQu9X+dGbVhL85Sxr4Zmd6Nx6eBnoH/ue4Go/jpuHDHwNZSBIO+tHgBBJ3F5P/WVh9k/DhlYEsJIm00LsV/1LQQVPw4ZOBLCSJ9NA78A8kXeCx76Hqr/bRo4E03qenO70PX0zQzCH0BpJE1SsfxhjIQpLIY6WP4Bt09EPSFR5b5cpHXwaqZ6UPwXen/NtoUAq/qpUPP25WDb1/EqBJDfhVrPxmoBN+78DZR9htrPR/LW/2Wl75za10wm94pe+A/x2rQBJFvOajwTZP72Po/TEMcRd8VcMn9J72aFszfEIfwR4fwqBbkMbKvzbOneqY0D2drwk+oXtC74fVAJ/Qe5oztyXDV4L+EXny+JZtJjvx8BLhE7oY+yZBSfAJXQl6n6YE+ITe01Le5gyf0JVhj9PlCF8ROv+dxxj48Dgn+IQ+JBNhPwf4hB4B9LYpUsIn9G1EIt6mBP8D8nh/tk/oEQHvmyomfMx1Akn/GtZ9IscLuX1Qfe+LAb+D/g1bSRC6L1TfcaCh8ZXu1tM+cruVTui+MGKPCwGf0GNTXDifJnxCXwgh1cM6+NJTszvta+TghVzMJ4ISfKRZHLyQiwl8OBeQaVyULSFP6EMQKfYTwCf0FKC3zRkRvrsu4Gv6NgipbosAn9BTwZ2aNyB8Qp8yP/X9AeATemqovvMrwid0X9NzGacAn9BzgTm3DgF8Qp9rdm7jF8An9NwgLq1nBnxCX2pyro8D/GPoFbQr3M+yXsm1ftYlcABgD6H70AvoN+R+dfsZdE+QttmH/gVo1WKZD73PfwAAAABJRU5ErkJggg==);}
    .rotateverify-contaniner .status-bg.icon-guanbi1{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGoAAABqCAYAAABUIcSXAAAAAXNSR0IArs4c6QAABOhJREFUeAHt3F1O3DAUBeCZ7qJQUVXdQ6U+tUtBILq79okKUEGwAlaACO0DFV1C+0DPzXBnMpnYiR0nsZ1jyXUm/ok5H8wwBbJYVMrz8/MR6nfU3y9Vjo8qQ3gYOAHke4h6ivqIKrlL5seoy51L4eRr1B+opiJ9+zsTecI7AeS5h3phChznr2TM1gVwwoaka93j4GBrIh94JYAc36DeabCWVrBWX1k4kKe7roVYXjSbSQi6K5KanJSz8UieE10KsTa5Ox0hZFckcTlXKHkBcy3EciJaLBCwD5K4PMmlXjleT4e/w8ENFuFrliZiaQVJ8kJ9bxlm7RKoW+sIcyexzNmsewIglT4C9XW9qvsBsSyZBUCS1Tc+WLDLt+cYZix8zaqBISnf16RqyJtvz2V99OyjSth9CrFesBBiCKRC1qn5l1gH6CDWTjJuJwIivTVeGRchljGd9o5RkHQbxNIk3NpRkXRrxNIkurWTIOnWiKVJ2NtJkXRrxNIkttuokHRrxNIkVm2USLpFYiWARKyEkOaOFfXTneLU27k9DSaJpGhzwUoaaS5YWSDljpUVUq5YWSLlhpU1Ui5Ys0BKHWtWSKlizRIpNaxZI6WCRSSVQoswovyFGSJVkPQwNiwiqUxDGwsWkRpw6qemxiJSXcTyeCosIllQTF1jYxHJJNHh/FhYROqA0TZkaCwitQk49A+FRSQHhK5DQ2MRqWvyHuMCYn3AWneofUqByea/T/L4+LKagnBC/HfT3z5CmFugEqntMwshhcDCMl6lwCwitSFpP8KaAotICuDSjoxFJBec+tiRsIhUD97n8cBYRPJBMc0ZCItIpsD7nA+MRaQ+GG1zgSVvZvu+T5L5H9uuxX7PBBBuiNvWYJmy3ONf3sLO08I4DaGGRFpRrW4nRCxj6o4dAyERy9HBOnxgJGJZ0+/YORISsTp6NA4bGYlYjQotJydCih7L9y7NLXH7dQsSZt6get/NGHP/ofqWaO+RGw1UIKQHCH1CLXylMC9arB4fU5ipgZ7uCqxT/tAPbYifZ/FNcZU3NJKuTSxNIkA7FJJujViaRI92aCTdGrE0CY92LCTdGrE0CYd2bCTdGrE0iQ7tVEi6NWJpEpZ2aiTdGrE0iYY2FiTdGrE0iUobG5JujViaBNpYkXSLxEoAiVgJIc0aK/anO8Wpt7N6GkwVSdFmgZU60iywckHKGis3pCyxckXKCit3pCyw5oKUNNbckJLEmitSUlhzR0oCi0jKtGqRR3y/N0ikbSR9FBUWkZSluY0Ci0jNOPWzk2IRqc5hfzwJFpHsKKbeUbGIZGLodn4ULCJ1w2gbNSgWFt9D5e092xQ69gfE2t+6JBa+QO1TCkzmnSMrqSKPEG+KL9dLYsFD1D6lwGQirRPdHCCXEFjH5YpY7BTVtxSYSKSNzc4R8umLdaZQj55KRNphaT7RE+tJVpW/il82L289+4Dez8vl8qd1FDvLBJDTL8kLtShPuP1T+gjUrdu8xQPGE8kxtB5YpY9AfXO45gPGEskhsOpQT6yVD54/l6hXqG2lwAB+41BN3vMYOXb9BuMaYzcvTXggb3htWNInt79hCZQA8txHvUQ1lWt0bL/hlWvjpHxlnaCeoz69VDmWcxvVQBvlMuvMj5Hv2Uvef9BK5l9QmXmKnyT/AS/pCbJI4duRAAAAAElFTkSuQmCC);}
    .rotateverify-contaniner .control-wrap{position:relative;height:40px;clear:both;border-radius:42px;margin-top:45px;background-color:#f7f7f7;}
    .rotateverify-contaniner .control-wrap .control-tips{position:relative;width:100%;height:100%;}
    .rotateverify-contaniner .c-tips-txt{height:40px;line-height:40px;position:absolute;width:100%;text-align:center;top:0;left:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;}
    .rotateverify-contaniner .control-btn{position:absolute;left:0;top:0;width:40px;height:40px;border-radius:40px;border:1px solid #e0e0e0;background-color:#fff;}
    .rotateverify-contaniner .control-bor-wrap{position:absolute;left:0;top:0;width:40px;height:40px;border-radius:40px;border:1px solid transparent;}
    .rotateverify-contaniner .control-bor-active{border:1px solid #1a91ed;}
    .rotateverify-contaniner .control-bor-err{border:1px solid #e01116;}
    .rotateverify-contaniner .control-bor-suc{border:1px solid limegreen;}
    .rotateverify-contaniner .control-btn-active{background:#1a91ed;}
    .rotateverify-contaniner .control-btn-err{background:#e01116;}
    .rotateverify-contaniner .control-btn-suc{background-color:limegreen;}
    .rotateverify-contaniner .control-btn-ico{display:block;width:20px;height:20px;background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADQAAAAyCAYAAAATIfj2AAAAAXNSR0IArs4c6QAABAdJREFUaAXtWUloU0EYbhaNTQWhItiIBz2kaYkHodWDBxEUa9OFIBHxoOnB3oSCgoqCKdijC3rpQTBCcYsQaUsE0eJBRIXiQZEuehJzUxCa1mIWvxFHpsPMvCUzh8oLlDfzzbxvvn+Zmb9JQ4P38TzgecDzgOeBVeQBn0prKpUKLC0tXa7VagNkns/nu93Y2Hgxl8tVVO9ZjZniJesGVYsvLi6OwJizdA7a54BtRv+PgRR3+jTFS3T4LcSk+XEYle7p6TnJ4w77pngtDRLqrFarN/r6+nYKB+sAdfAqI4Ro3JHoW1epVB5hL2yQjCthU7xkUaVBgUBgGAfBB5E6iNpeKpWyojErzBQvWTegWnxubu5XPB5/jlRIY15IMDcWjUZL8/PzrwRjUsgUL1lQeWxTRYlEIoWIPKR97lmGx/dNTEy85HDLrgleZYSoIkTgY2trazOM2k0x5knStguRHJuZmSkxuGXTBK9yD7GKIpHIGfRfsxhtw9DI8vLyvUwmY5uPvqub11aEyOLT09PV9vb2pxB/HN0wFcQ8txWLxSC8PsVglk3dvLb2EKuqu7u7C/0C/kTv1rCfEthPT9h37LR18dqOEBWFCHzCyUZSay/FmKcPETwUi8Xu4yT7weCWTV28jnOeKOvs7CT30zOJymYc8zlcumsl41JYB68rg7D5q+Fw+BiM+ipShyjtQgF6RTSmwnTwivaBas0VY6jn9pTL5RcAhVW73+8/Ojk5+WDFSzY69fA63kOsntnZ2S+4n0qIyEEWZ9pdbW1tOcz7zmCWzXp4XaUcqwgRuIrUy7MYbcPQ9ShiM7Tv5OmWt26DiEik1hCMqooEw6gdItwO5oZXi0E41a5DuJALhr63I140xw2vUISIXIahwDwNY5KicRizgIs2Ixqzwtzy/nennOsI4eLchA1PjmThkY3o3HRzZNfL68ogUlXj4ryLVNsiSh0Y8xYXL6nOHX108Lq6h5qamoZhzIBILYz5htNpfz6fd3T3EC4dvI73kK6qmHeGLl5HKdff378VERiDGKEjEJkRN/866OS1bdDg4OAa1G05pNpG3rt/+1MdHR2XJGNSWDev7T3U0tJyDcYcFilD1IqhUOjA6OjogmhchenmFaYOLwD5fQSYrGp2/a2PCV7LlEsmk1FE4BZvJO1j7Lybr7BM8Soj1NvbG0Y99QapFqcGcM/HhUJBWPZw81Z0TfGSRYS3PF0dlQDZ5DJjPuPeSNO5Tp6meIkGZcohnU5IhP4MBoMp/PDl6IsQymWK19IgKoB/ooI+NT4+/o7H6+3r4FVGCAKzvEh4N4tDQHpI8PMlfVO86j2EAvMCfmPFmfCvbssSTCLSNmyK17YAb6LnAc8DngdWrQd+A6CJYdIFu4L0AAAAAElFTkSuQmCC) no-repeat center center;background-size:100% 100%;margin:10px;}
    .rotateverify-contaniner .control-btn-active .control-btn-ico{background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADQAAAAyCAYAAAATIfj2AAAAAXNSR0IArs4c6QAAAoRJREFUaAXtmb9OVFEQxjcQKGyspIPK2FvrA+gDAC8AL6C+gGIidvx5ABtqeABCDZSEFjtNLLTRwoLo+jvZJcBhvpnrLlPs5kzyhT3z5/vOzM1y757b6zVrE2gTaBNoE5iWCfT7/VnwAXwbonyeHbe/wgHunTfcF6KboLZPYWGQAGEKbyDb6yFcroxl62GxkwBhCq8jOQg5wr+JPQ0JREIWr5C7diP8ESj7TODhdXb3T9Sl8IY7QPgBOAfKDkISIwGyFF5D6q4L8Sfgp+oI/5u7VbEnizdWJgPxZaehS2LPOxFVSVm8lYy9RHzbaeorsQW70vdm8fqqRBGeA8dA2RGBmZCoSqAmhbeSsZeIL4LvQNl7u9L3QpbC66sOo4i/AH9FR8X/shNRlZTFW8nYS8TfioaK+wdYsit9L3UpvL4qUYRnwCFQdkpgPiSqEqhJ4a1k7CXij8AXoGzXrvS9kKXw+qrDKOLPQLkPKVvtRFQlQZbCW8nYS8RfqW7w/wKP7Urfm8Xrqw6jiO8DZXudSIwkCFN4DanbLoSXwB/R0dnt7O6rUXj/+84utrOFX3Gdi5ou7ixerc0UX4srU9zjfIdSeHUnRNhwyn+jLN6omeh+seMSiCDNpPAKuYEb0ZQ7ehav20wJIvwOKCtP46M+y6Xwug2x2el52qaZ6HfLhjsNEcziFXIDN6Lll+UJUHZEQN2LJDc1KbxS8CqA8PScKdDMClBWnrZHPfVJ4b26COZfNjs953I0k3LCmcVrXpGbToS9M+gL4hln2yPz3ty7+ZkNq9ceE/v2QTW0Zk6go9MZ1Fi8oTzCm6C2iX6DV78LLQ1mvGO9F97wCrWENoE2gTaBiZ/AP+8/LMb6T9MeAAAAAElFTkSuQmCC) no-repeat center center;background-size:100% 100%;}
    .rotateverify-contaniner .control-btn-err .control-btn-ico{background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGoAAABqCAYAAABUIcSXAAAAAXNSR0IArs4c6QAABOhJREFUeAHt3F1O3DAUBeCZ7qJQUVXdQ6U+tUtBILq79okKUEGwAlaACO0DFV1C+0DPzXBnMpnYiR0nsZ1jyXUm/ok5H8wwBbJYVMrz8/MR6nfU3y9Vjo8qQ3gYOAHke4h6ivqIKrlL5seoy51L4eRr1B+opiJ9+zsTecI7AeS5h3phChznr2TM1gVwwoaka93j4GBrIh94JYAc36DeabCWVrBWX1k4kKe7roVYXjSbSQi6K5KanJSz8UieE10KsTa5Ox0hZFckcTlXKHkBcy3EciJaLBCwD5K4PMmlXjleT4e/w8ENFuFrliZiaQVJ8kJ9bxlm7RKoW+sIcyexzNmsewIglT4C9XW9qvsBsSyZBUCS1Tc+WLDLt+cYZix8zaqBISnf16RqyJtvz2V99OyjSth9CrFesBBiCKRC1qn5l1gH6CDWTjJuJwIivTVeGRchljGd9o5RkHQbxNIk3NpRkXRrxNIkurWTIOnWiKVJ2NtJkXRrxNIkttuokHRrxNIkVm2USLpFYiWARKyEkOaOFfXTneLU27k9DSaJpGhzwUoaaS5YWSDljpUVUq5YWSLlhpU1Ui5Ys0BKHWtWSKlizRIpNaxZI6WCRSSVQoswovyFGSJVkPQwNiwiqUxDGwsWkRpw6qemxiJSXcTyeCosIllQTF1jYxHJJNHh/FhYROqA0TZkaCwitQk49A+FRSQHhK5DQ2MRqWvyHuMCYn3AWneofUqByea/T/L4+LKagnBC/HfT3z5CmFugEqntMwshhcDCMl6lwCwitSFpP8KaAotICuDSjoxFJBec+tiRsIhUD97n8cBYRPJBMc0ZCItIpsD7nA+MRaQ+GG1zgSVvZvu+T5L5H9uuxX7PBBBuiNvWYJmy3ONf3sLO08I4DaGGRFpRrW4nRCxj6o4dAyERy9HBOnxgJGJZ0+/YORISsTp6NA4bGYlYjQotJydCih7L9y7NLXH7dQsSZt6get/NGHP/ofqWaO+RGw1UIKQHCH1CLXylMC9arB4fU5ipgZ7uCqxT/tAPbYifZ/FNcZU3NJKuTSxNIkA7FJJujViaRI92aCTdGrE0CY92LCTdGrE0CYd2bCTdGrE0iQ7tVEi6NWJpEpZ2aiTdGrE0iYY2FiTdGrE0iUobG5JujViaBNpYkXSLxEoAiVgJIc0aK/anO8Wpt7N6GkwVSdFmgZU60iywckHKGis3pCyxckXKCit3pCyw5oKUNNbckJLEmitSUlhzR0oCi0jKtGqRR3y/N0ikbSR9FBUWkZSluY0Ci0jNOPWzk2IRqc5hfzwJFpHsKKbeUbGIZGLodn4ULCJ1w2gbNSgWFt9D5e092xQ69gfE2t+6JBa+QO1TCkzmnSMrqSKPEG+KL9dLYsFD1D6lwGQirRPdHCCXEFjH5YpY7BTVtxSYSKSNzc4R8umLdaZQj55KRNphaT7RE+tJVpW/il82L289+4Dez8vl8qd1FDvLBJDTL8kLtShPuP1T+gjUrdu8xQPGE8kxtB5YpY9AfXO45gPGEskhsOpQT6yVD54/l6hXqG2lwAB+41BN3vMYOXb9BuMaYzcvTXggb3htWNInt79hCZQA8txHvUQ1lWt0bL/hlWvjpHxlnaCeoz69VDmWcxvVQBvlMuvMj5Hv2Uvef9BK5l9QmXmKnyT/AS/pCbJI4duRAAAAAElFTkSuQmCC) no-repeat center center;background-size:100% 100%;}
    .rotateverify-contaniner .control-btn-suc .control-btn-ico{background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAH4AAABWCAYAAAAJ3CLTAAAAAXNSR0IArs4c6QAABFZJREFUeAHtncuO00AQRWdALFkiXsM0Az/FArGIhPg3EAvEazEL4AdY824eQsBXhNsTW1gmiduu6vct6cp20qmuuiftOMkoc3DAqM6B9Xq9gp5Dvzq5/VV1jbKhjQOAewSdQrvC3XeVflXkAIAeQ593ER/cflpR22230kH/MoA7tbs637Zl5XfvoKOL19DJjG4uEPwMt3IbuhC6a+PiudyaYT1+Dgign01A8H4+ZzVKCh3NvCX4rJBOF6MA3U3yeHomjsjGAQcdmnP1juH/Bd/OZUPUoxDg04DunjTXPabjkBwcUITu3voxSnCA0EugpFwjoSsbWkI6Qi+BknKNStDdFzZ8TVdmEyydIvQbwYpkYl0HCF3XzyKyEXoRmHSLJHRdP4vIRuhFYNItktB1/SwiG6EXgUm3SEA3kPRbNvc+nW/ZdNGEy9ZBt9hKgtDDIdLPDNIGspAkCF0fTbiMIG0gC0mC0MMh0s8M0gaykCQIXR9NuIwgbSALSYLQwyHSzwzSBrKQJAhdH024jCBtIAtJgtDDIdLPDNIGspAkCF0fTbiMIG0gC0mC0MMh0s8M0gaykCTiQ0e1d6CH0KdOj9xt+hbVlxE+GegrJAnne7yPYTHZJejJnordfZfrw6XTEbwxkIUkERe6ax3Vut9ImYp3GMCf0Rg9V+CJgSwkiSTQ786omPAH4OGbgSwkifjQu9X+dGbVhL85Sxr4Zmd6Nx6eBnoH/ue4Go/jpuHDHwNZSBIO+tHgBBJ3F5P/WVh9k/DhlYEsJIm00LsV/1LQQVPw4ZOBLCSJ9NA78A8kXeCx76Hqr/bRo4E03qenO70PX0zQzCH0BpJE1SsfxhjIQpLIY6WP4Bt09EPSFR5b5cpHXwaqZ6UPwXen/NtoUAq/qpUPP25WDb1/EqBJDfhVrPxmoBN+78DZR9htrPR/LW/2Wl75za10wm94pe+A/x2rQBJFvOajwTZP72Po/TEMcRd8VcMn9J72aFszfEIfwR4fwqBbkMbKvzbOneqY0D2drwk+oXtC74fVAJ/Qe5oztyXDV4L+EXny+JZtJjvx8BLhE7oY+yZBSfAJXQl6n6YE+ITe01Le5gyf0JVhj9PlCF8ROv+dxxj48Dgn+IQ+JBNhPwf4hB4B9LYpUsIn9G1EIt6mBP8D8nh/tk/oEQHvmyomfMx1Akn/GtZ9IscLuX1Qfe+LAb+D/g1bSRC6L1TfcaCh8ZXu1tM+cruVTui+MGKPCwGf0GNTXDifJnxCXwgh1cM6+NJTszvta+TghVzMJ4ISfKRZHLyQiwl8OBeQaVyULSFP6EMQKfYTwCf0FKC3zRkRvrsu4Gv6NgipbosAn9BTwZ2aNyB8Qp8yP/X9AeATemqovvMrwid0X9NzGacAn9BzgTm3DgF8Qp9rdm7jF8An9NwgLq1nBnxCX2pyro8D/GPoFbQr3M+yXsm1ftYlcABgD6H70AvoN+R+dfsZdE+QttmH/gVo1WKZD73PfwAAAABJRU5ErkJggg==) no-repeat center center;background-size:100% 100%;}
  `
}

function getRandomNumber(a: number, b: number): number {
  return Math.round(Math.random() * (b - a) + a)
}

function getRandomImg(imgArr: string[]): string {
  return imgArr[getRandomNumber(0, imgArr.length - 1)]
}

function isArray(o: any): o is any[] {
  return Array.isArray(o)
}

function initDom() {
  if (!rotateCanRef.value || !slideDragWrapRef.value || !slideDragBtnRef.value || !controlBorWrapRef.value) return

  const canvas = rotateCanRef.value
  xPos.value = canvas.width / 2
  yPos.value = canvas.height / 2
  aveRot.value = Math.round((360 / (slideDragWrapRef.value.offsetWidth - slideDragBtnRef.value.offsetWidth)) * 100) / 100
}

function initCanvasImg() {
  randRot.value = getRandomNumber(30, 270)
  sucLenMin.value = (360 - props.slideAreaNum - randRot.value) * ((slideDragWrapRef.value?.offsetWidth || 0) - (slideDragBtnRef.value?.offsetWidth || 0)) / 360
  sucLenMax.value = (360 + props.slideAreaNum - randRot.value) * ((slideDragWrapRef.value?.offsetWidth || 0) - (slideDragBtnRef.value?.offsetWidth || 0)) / 360
  disLf.value = 0
  initImgSrc()
}

function initImgSrc() {
  if (!slideImage.value) {
    slideImage.value = document.createElement('img')
  }

  let slideImageSrc: string
  if (isArray(props.slideImage)) {
    slideImageSrc = getRandomImg(props.slideImage as string[])
  } else {
    slideImageSrc = props.slideImage as string
  }

  slideImage.value.setAttribute('data-src', slideImageSrc)
  slideImage.value.src = slideImageSrc

  slideImage.value.onload = () => {
    slideImage.value!.style.width = xPos.value * 2 + 'px'
    slideImage.value!.style.height = yPos.value * 2 + 'px'
    drawImgCan()
  }
}

function drawImgCan(val?: number) {
  if (!rotateCanRef.value || !slideImage.value) return

  const canvas = rotateCanRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.beginPath()
  ctx.arc(xPos.value, yPos.value, xPos.value, 0, 360 * Math.PI / 180, false)
  ctx.closePath()
  ctx.clip()

  ctx.save()
  ctx.clearRect(0, 0, xPos.value * 2, yPos.value * 2)
  ctx.translate(xPos.value, yPos.value)
  ctx.rotate(randRot.value * Math.PI / 180 + disLf.value * aveRot.value * Math.PI / 180)
  ctx.translate(-xPos.value, -yPos.value)
  ctx.drawImage(slideImage.value, 0, 0, xPos.value * 2, yPos.value * 2)
  ctx.restore()
}

function initMouse() {
  if (!slideDragBtnRef.value || !slideDragWrapRef.value || !controlBorWrapRef.value || !statusBgRef.value) return

  let ifThisMousedown = false
  let positionDiv: { left: number; top: number } | null = null
  let distenceX = 0
  let disPageX = 0

  const handleMouseDown = (e: MouseEvent) => {
    if (verifyState.value || dragTimerState.value) return

    ifThisMousedown = true
    positionDiv = { left: e.clientX, top: e.clientY }
    distenceX = e.clientX - slideDragBtnRef.value!.getBoundingClientRect().left
    disPageX = e.clientX

    slideDragBtnRef.value!.classList.add('control-btn-active')
    controlBorWrapRef.value!.classList.add('control-bor-active')

    document.addEventListener('mousemove', handleMouseMove)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!ifThisMousedown || !slideDragWrapRef.value || !slideDragBtnRef.value || !controlBorWrapRef.value) return

    let x = e.clientX - disPageX
    if (x < 0) x = 0
    else if (x >= slideDragWrapRef.value.offsetWidth - slideDragBtnRef.value.offsetWidth) {
      x = slideDragWrapRef.value.offsetWidth - slideDragBtnRef.value.offsetWidth
    }

    slideDragBtnRef.value.style.left = x + 'px'
    controlBorWrapRef.value.style.width = (x + slideDragBtnRef.value.offsetWidth) + 'px'
    disLf.value = x
    drawImgCan()
  }

  const handleMouseUp = () => {
    if (!ifThisMousedown) return

    ifThisMousedown = false
    if (verifyState.value) return

    document.removeEventListener('mousemove', handleMouseMove)
    slideDragBtnRef.value!.classList.remove('control-btn-active')
    controlBorWrapRef.value!.classList.remove('control-bor-active')

    if (sucLenMin.value <= disLf.value && disLf.value <= sucLenMax.value) {
      // Success
      slideDragBtnRef.value!.classList.add('control-btn-suc')
      controlBorWrapRef.value!.classList.add('control-bor-suc')
      statusBgRef.value!.style.display = 'block'
      statusBgRef.value!.classList.add('icon-dagou')
      verifyState.value = true
      if (cTipsTxtRef.value) cTipsTxtRef.value.textContent = ''
      emit('success', verifyState.value)
    } else {
      // Error
      slideDragBtnRef.value!.classList.add('control-btn-err')
      controlBorWrapRef.value!.classList.add('control-bor-err')
      slideDragWrapRef.value!.classList.add('control-horizontal')
      dragTimerState.value = true
      verifyState.value = false
      statusBgRef.value!.style.display = 'block'
      statusBgRef.value!.classList.add('icon-guanbi1')

      setTimeout(() => {
        dragTimerState.value = false
        slideDragWrapRef.value!.classList.remove('control-horizontal')
        slideDragBtnRef.value!.classList.remove('control-btn-err')
        statusBgRef.value!.classList.remove('icon-guanbi1')
        statusBgRef.value!.style.display = 'none'
        refreshSlide()
      }, 700)

      setTimeout(() => {
        controlBorWrapRef.value!.classList.remove('control-bor-err')
        controlBorWrapRef.value!.style.width = slideDragBtnRef.value!.offsetWidth + 'px'
      }, 700)
    }
  }

  slideDragBtnRef.value.addEventListener('mousedown', handleMouseDown)
  document.addEventListener('mouseup', handleMouseUp)
}

function initTouch() {
  if (!slideDragBtnRef.value || !slideDragWrapRef.value || !controlBorWrapRef.value || !statusBgRef.value) return

  let touchX = 0

  const handleTouchStart = (e: TouchEvent) => {
    slideDragBtnRef.value!.style.pointerEvents = 'none'
    setTimeout(() => {
      if (slideDragBtnRef.value) slideDragBtnRef.value.style.pointerEvents = 'all'
    }, 400)

    if (dragTimerState.value || verifyState.value) return

    if (getElementLeft(slideDragBtnRef.value) === 0) {
      touchX = e.touches[0].pageX
      slideDragBtnRef.value!.classList.add('control-btn-active')
      controlBorWrapRef.value!.classList.add('control-bor-active')
    }
  }

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault()
    if (dragTimerState.value) return

    let x = e.touches[0].pageX - touchX
    if (x < 0) x = 0
    else if (x >= slideDragWrapRef.value!.offsetWidth - slideDragBtnRef.value!.offsetWidth) {
      x = slideDragWrapRef.value!.offsetWidth - slideDragBtnRef.value!.offsetWidth
    }

    slideDragBtnRef.value!.style.left = x + 'px'
    controlBorWrapRef.value!.style.width = (x + slideDragBtnRef.value!.offsetWidth) + 'px'
    disLf.value = x
    drawImgCan()
  }

  const handleTouchEnd = () => {
    slideDragBtnRef.value!.classList.remove('control-btn-active')
    controlBorWrapRef.value!.classList.remove('control-bor-active')

    if (sucLenMin.value <= disLf.value && disLf.value <= sucLenMax.value) {
      verifyState.value = true
      slideDragBtnRef.value!.classList.add('control-btn-suc')
      controlBorWrapRef.value!.classList.add('control-bor-suc')
      statusBgRef.value!.style.display = 'block'
      statusBgRef.value!.classList.add('icon-dagou')
      if (cTipsTxtRef.value) cTipsTxtRef.value.textContent = ''
      emit('success', verifyState.value)
    } else {
      if (!dragTimerState.value) {
        dragTimerState.value = true
        verifyState.value = false
        statusBgRef.value!.style.display = 'block'
        statusBgRef.value!.classList.add('icon-guanbi1')
        slideDragBtnRef.value!.classList.add('control-btn-err')
        controlBorWrapRef.value!.classList.add('control-bor-err')
        slideDragWrapRef.value!.classList.add('control-horizontal')

        setTimeout(() => {
          slideDragWrapRef.value!.classList.remove('control-horizontal')
          slideDragBtnRef.value!.classList.remove('control-btn-err')
          statusBgRef.value!.classList.remove('icon-guanbi1')
          statusBgRef.value!.style.display = 'none'
          dragTimerState.value = false
          refreshSlide()
        }, 700)

        setTimeout(() => {
          controlBorWrapRef.value!.classList.remove('control-bor-err')
          controlBorWrapRef.value!.style.width = slideDragBtnRef.value!.offsetWidth + 'px'
        }, 700)
      }
    }
  }

  slideDragBtnRef.value.addEventListener('touchstart', handleTouchStart)
  slideDragBtnRef.value.addEventListener('touchmove', handleTouchMove)
  slideDragBtnRef.value.addEventListener('touchend', handleTouchEnd)
}

function getElementLeft(element: HTMLElement): number {
  return parseInt(element.style.left || '0', 10)
}

function refreshSlide() {
  initCanvasImg()
}

function resetSlide() {
  if (!slideDragBtnRef.value || !controlBorWrapRef.value || !slideDragWrapRef.value || !statusBgRef.value || !cTipsTxtRef.value) return

  slideDragBtnRef.value.style.left = '0px'
  controlBorWrapRef.value.style.width = slideDragBtnRef.value.offsetWidth + 'px'
  controlBorWrapRef.value.classList.remove('control-bor-suc')
  dragTimerState.value = false
  verifyState.value = false
  slideDragBtnRef.value.classList.remove('control-btn-suc')
  slideDragWrapRef.value.classList.remove('control-horizontal')
  statusBgRef.value.style.display = 'none'
  statusBgRef.value.classList.remove('icon-dagou')
  cTipsTxtRef.value.textContent = props.initText
  refreshSlide()
}

// Expose methods
defineExpose({
  resetSlide,
  refreshSlide
})

// Lifecycle
onMounted(() => {
  injectStyles()
  initDom()
  initCanvasImg()
  initMouse()
  initTouch()
})

// Watch for prop changes
watch(() => props.slideImage, () => {
  initCanvasImg()
}, { deep: true })
</script>

<style scoped>
.rotateverify-contaniner {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}
</style>
