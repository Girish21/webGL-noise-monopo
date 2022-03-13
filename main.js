import './style.css'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import largeSphereFragmentShader from './shaders/large-sphere/fragment.frag?raw'
import largeSphereVertexShader from './shaders/large-sphere/vertex.vert?raw'
import smallSphereFragmentShader from './shaders/small-sphere/fragment.frag?raw'
import smallSphereVertexShader from './shaders/small-sphere/vertex.vert?raw'
import { DotScreenShader } from './DotScreenShader'

const size = {
  width: window.innerWidth,
  height: window.innerHeight,
}

const mouse = {
  x: 0,
  y: 0,
}

const canvas = document.getElementById('webGL')

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera()
const controls = new OrbitControls(camera, canvas)
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
const clock = new THREE.Clock()
const composer = new EffectComposer(renderer)
const effect1 = new ShaderPass(DotScreenShader)

controls.enableDamping = true

camera.fov = 75
camera.aspect = size.width / size.height
camera.far = 100
camera.near = 0.1
camera.position.set(0, 0, 1.3)

composer.addPass(new RenderPass(scene, camera))

effect1.uniforms['scale'].value = 1
composer.addPass(effect1)

scene.add(camera)

const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
  format: THREE.RGBAFormat,
  generateMipmaps: true,
  minFilter: THREE.LinearMipMapLinearFilter,
  encoding: THREE.sRGBEncoding,
})
const cubeCamera = new THREE.CubeCamera(0.1, 10, cubeRenderTarget)

const largeSphereGeometry = new THREE.SphereBufferGeometry(1.5, 32, 32)
const largeSphereMaterial = new THREE.ShaderMaterial({
  vertexShader: largeSphereVertexShader,
  fragmentShader: largeSphereFragmentShader,
  uniforms: {
    uTime: { value: 0 },
  },
  side: THREE.DoubleSide,
})
const largeSphereMesh = new THREE.Mesh(largeSphereGeometry, largeSphereMaterial)
scene.add(largeSphereMesh)

const smallSphereGeometry = new THREE.SphereBufferGeometry(0.5, 32, 32)
const smallSphereMaterial = new THREE.ShaderMaterial({
  vertexShader: smallSphereVertexShader,
  fragmentShader: smallSphereFragmentShader,
  uniforms: {
    uTime: { value: 0 },
    tCube: { value: null },
    mRefractionRatio: { value: 1.02 },
    mFresnelBias: { value: 0.1 },
    mFresnelScale: { value: 2.0 },
    mFresnelPower: { value: 0.8 },
  },
})
const smallSphereMesh = new THREE.Mesh(smallSphereGeometry, smallSphereMaterial)
scene.add(smallSphereMesh)

function resizeHandler() {
  size.height = window.innerHeight
  size.width = window.innerWidth

  camera.aspect = size.width / size.height
  camera.updateProjectionMatrix()

  composer.setSize(size.width, size.height)
  composer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}
resizeHandler()

window.addEventListener('resize', resizeHandler)

function tick() {
  const elapsedTime = clock.getElapsedTime()

  smallSphereMesh.visible = false
  cubeCamera.update(renderer, scene)
  smallSphereMesh.visible = true

  largeSphereMaterial.uniforms.uTime.value = elapsedTime
  smallSphereMaterial.uniforms.uTime.value = elapsedTime
  smallSphereMaterial.uniforms.tCube.value = cubeRenderTarget.texture

  controls.update()

  composer.render()

  window.requestAnimationFrame(tick)
}
tick()

const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches
const event = isTouch ? 'touchmove' : 'mousemove'
let timeoutId
window.addEventListener(event, e => {
  if (isTouch && e.touches?.[0]) {
    const touchEvent = e.touches[0]
    mouse.x = (touchEvent.clientX / size.width) * 2 - 1
    mouse.y = (-touchEvent.clientY / size.height) * 2 + 1
  } else {
    mouse.x = (e.clientX / size.width) * 2 - 1
    mouse.y = (-e.clientY / size.height) * 2 + 1
  }

  clearTimeout(timeoutId)
  timeoutId = setTimeout(() => {
    mouse.x = 0
    mouse.y = 0
  }, 1000)
})
