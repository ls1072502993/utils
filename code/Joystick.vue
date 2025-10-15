<template>
  <div class="direction_box">
    <div
      class="center"
      @touchend="touchend"
      @touchstart="touchstart"
      @touchmove="touchmove"
      :style="{ transform: `translate(${deltaX}px,${deltaY}px)` }"
    >
      {{ joystickDirection }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const touchoff = ref(false)
const startPosition = ref({})
const endPosition = ref({})
const deltaX = ref(0)
const deltaY = ref(0)
const joystickDirection = ref('none')
// 手指按下
function touchstart(e) {
  let touch = e.changedTouches[0]
  touchoff.value = true
  startPosition.value = {
    x: touch.pageX,
    y: touch.pageY,
  }
}
// 手指抬起
function touchend(e) {
  touchoff.value = false
  joystickDirection.value = 'none'
  deltaX.value = 0
  deltaY.value = 0
}
// 手指移动
function touchmove(e) {
  let touch = e.changedTouches[0]
  endPosition.value = {
    x: touch.pageX,
    y: touch.pageY,
  }
  deltaX.value = endPosition.value.x - startPosition.value.x //移动到最后的坐标x - 开始时的坐标x
  deltaY.value = endPosition.value.y - startPosition.value.y //移
  const operationRadius = Math.sqrt(deltaX.value * deltaX.value + deltaY.value * deltaY.value)
  const max = 100
  const R = Math.min(max, operationRadius)
  const angle = Math.atan2(deltaY.value, deltaX.value)
  const { x, y } = {
    x: R * Math.cos(angle),
    y: R * Math.sin(angle),
  }
  deltaX.value = x
  deltaY.value = y
  if (Math.abs(deltaY.value / deltaX.value) < 1) {
    if (deltaX.value > 0) {
      if (joystickDirection.value != 'right') {
        joystickDirection.value = 'right'
        console.log(joystickDirection.value)
      }
    } else {
      if (joystickDirection.value != 'left') {
        joystickDirection.value = 'left'
        console.log(joystickDirection.value)
      }
    }
  } else {
    if (deltaY.value > 0) {
      if (joystickDirection.value != 'bottom') {
        joystickDirection.value = 'bottom'
        console.log(joystickDirection.value)
      }
    } else {
      if (joystickDirection.value != 'top') {
        joystickDirection.value = 'top'
        console.log(joystickDirection.value)
      }
    }
  }
}
</script>

<style lang="less">
.direction_box {
  width: 300px;
  height: 300px;
  background: orange;
  position: relative;
  border-radius: 50%;

  .center {
    position: absolute;
    inset: 0;
    margin: auto;
    display: block;
    width: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-weight: bold;
    font-size: 30px;
    height: 100px;
    z-index: 2;
    background: red;
    border-radius: 50%;
  }
}
</style>
