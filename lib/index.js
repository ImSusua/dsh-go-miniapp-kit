// 小程序工坊：微信小程序开发助手（dsh-go 原生插件）。
// 生成项目骨架 / 页面四件套 / 上线自查清单，并把开发规范注入对话。
export const name = 'dsh-go-miniapp-kit'

const ACCENT = '#07C160'

// ── 知识内容 ────────────────────────────────────────────────────────────────

const SPEC_PROMPT = [
  '【微信小程序开发规范】按下面的约定实现，代码要能直接导入开发者工具运行。',
  '1. 结构：根目录放 project.config.json、sitemap.json；源码放 miniprogram/（不用云开发时可直接放根目录），页面放 pages/<名>/<名>，组件放 components/，工具放 utils/。',
  '2. 页面四件套：.wxml 结构、.wxss 样式（统一 rpx）、.js 用 Page()、.json 写标题和 usingComponents。新增页面必须同步写进 app.json 的 pages，第一项是首页。',
  '3. app.json：style 用 v2，lazyCodeLoading 设为 requiredComponents；新项目优先 renderer=skyline + componentFramework=glass-easel；页面多时用 subpackages 分包，主包只留 tabBar 页和公共资源。',
  '4. 请求：统一封装 utils/request.js（Promise、10s 超时、统一错误 toast、带 token），不要在页面里裸写 wx.request。',
  '5. 数据：setData 只更新变化字段（如 list[0].title），列表分页加载，避免一次传大对象。',
  '6. 交互：列表页要有 loading、空态、下拉刷新、触底加载、没有更多；表单要有校验、提交中禁用、失败提示。',
  '7. 样式：页面底色 #f7f7f7，卡片白底、圆角 16rpx、内边距 24rpx，主色 #07C160，底部适配 env(safe-area-inset-bottom)。',
  '8. 合规：位置、相册、手机号、剪贴板等隐私接口，先在后台配置《用户隐私保护指引》并处理 wx.onNeedPrivacyAuthorization；请求域名必须 HTTPS 且在后台白名单。',
  '9. 交付：先给目录树和页面清单，再按文件逐个给完整代码，不要用省略号；最后给自测清单。',
].join('\n')

const SNIPPETS = [
  {
    label: 'wx.request 封装',
    language: 'javascript',
    code: `// utils/request.js
const BASE = 'https://api.example.com'

module.exports = function request(path, { method = 'GET', data } = {}) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE + path,
      method,
      data,
      timeout: 10000,
      header: {
        'content-type': 'application/json',
        Authorization: 'Bearer ' + (wx.getStorageSync('token') || ''),
      },
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(res.data)
        else reject(new Error('HTTP ' + res.statusCode))
      },
      fail: reject,
    })
  })
}`,
  },
  {
    label: '登录换 session',
    language: 'javascript',
    code: `// wx.login 拿到的 code 只能换一次、5 分钟过期；
// code2session 必须由后端调用，AppSecret 不能写进小程序。
Page({
  onLogin() {
    wx.login({
      success: async ({ code }) => {
        const res = await wx.request({
          url: 'https://api.example.com/login',
          method: 'POST',
          data: { code },
        })
        wx.setStorageSync('token', res.data.token)
        wx.showToast({ title: '登录成功' })
      },
      fail: () => wx.showToast({ title: '微信登录失败', icon: 'none' }),
    })
  },
})`,
  },
  {
    label: '云开发初始化',
    language: 'javascript',
    code: `// app.js
App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上基础库')
      return
    }
    wx.cloud.init({
      env: 'your-env-id', // 云开发控制台的环境 ID
      traceUser: true,
    })
  },
})

// 调用云函数
wx.cloud.callFunction({ name: 'login' }).then(({ result }) => {
  console.log('openid', result.openid)
})`,
  },
  {
    label: '云函数模板',
    language: 'javascript',
    code: `// cloudfunctions/login/index.js
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { OPENID, UNIONID } = cloud.getWXContext()
  return { openid: OPENID, unionid: UNIONID }
}

// package.json 依赖：{ "dependencies": { "wx-server-sdk": "latest" } }`,
  },
  {
    label: '路由与缓存',
    language: 'javascript',
    code: `// 跳转并传参（参数要 encodeURIComponent）
wx.navigateTo({ url: '/pages/detail/detail?id=' + id })

Page({
  onLoad({ id }) {
    this.setData({ id })
  },
})

// 缓存：单条不超过 1MB，同一个用户同一个小程序上限 10MB
wx.setStorageSync('token', token)
const token = wx.getStorageSync('token')`,
  },
  {
    label: '隐私授权',
    language: 'javascript',
    code: `// 调用相册、位置、手机号等隐私接口前先检查
wx.getPrivacySetting({
  success(res) {
    if (!res.needAuthorization) return
    // 弹自定义隐私弹窗，按钮用 open-type="agreePrivacyAuthorization"
    // 用户同意后再调用具体接口
  },
})

// 也可以直接触发隐私弹窗流程
wx.requirePrivacyAuthorize({
  success: () => wx.chooseMedia({ count: 1 }),
})`,
  },
]

const CHECK = [
  {
    label: '配置',
    items: [
      { title: 'app.json 页面注册', subtitle: '所有 pages / subpackages 路径都存在，首页排第一' },
      { title: 'AppID', subtitle: 'project.config.json 里换成自己的，别用 touristappid 上线' },
      { title: '服务器域名', subtitle: '后台配置 request 合法域名，HTTPS，不能是 IP 或带端口' },
      { title: 'sitemap.json', subtitle: '默认全允许；不想被微信索引就改成 disallow' },
      { title: '基础库版本', subtitle: '后台设置最低基础库，新 API 要做低版本降级' },
      { title: '隐私保护指引', subtitle: '后台配置并通过审核，否则隐私接口直接禁用' },
    ],
  },
  {
    label: '性能',
    items: [
      { title: '包体积', subtitle: '主包和单个分包 ≤ 2MB，全部分包合计 ≤ 30MB' },
      { title: '分包', subtitle: '非首屏页面放 subpackages，tabBar 页留在主包' },
      { title: '按需注入', subtitle: 'app.json 加 lazyCodeLoading: requiredComponents' },
      { title: '图片', subtitle: '走 CDN，用 webp 和合适尺寸，不要把大图打进包里' },
      { title: 'setData', subtitle: '单次别超 1MB，只传变化字段，长列表分页' },
      { title: '启动耗时', subtitle: '首屏少请求、能并行就并行，必要时加骨架屏' },
    ],
  },
  {
    label: '体验',
    items: [
      { title: '导航栏标题', subtitle: '每个页面 json 都设 navigationBarTitleText' },
      { title: '安全区', subtitle: '底部按钮和 tabBar 页留 env(safe-area-inset-bottom)' },
      { title: '空态与错误态', subtitle: '列表、详情都要有加载失败和空数据提示' },
      { title: '防重复点击', subtitle: '提交按钮加 loading + disabled，回调里先判断' },
      { title: '深色模式', subtitle: '需要时配 darkmode + theme.json，颜色别写死在 wxml' },
    ],
  },
  {
    label: '合规',
    items: [
      { title: '类目资质', subtitle: '后台选对服务类目，医疗、金融等要额外资质' },
      { title: '手机号验证', subtitle: '快速验证组件按次收费，别做静默扣费' },
      { title: '诱导分享', subtitle: '不能强制分享后才能使用核心功能' },
      { title: '虚拟支付', subtitle: 'iOS 端虚拟支付受限，不要做绕过方案' },
      { title: '头像昵称', subtitle: '用 button open-type="chooseAvatar" + input type="nickname"' },
    ],
  },
]

const TEMPLATES = {
  basic: { label: '空白项目', cloud: false, skyline: false },
  cloud: { label: '云开发', cloud: true, skyline: false },
  skyline: { label: 'Skyline', cloud: false, skyline: true },
}

const isTemplate = (key) => typeof key === 'string' && Object.prototype.hasOwnProperty.call(TEMPLATES, key)

// ── 项目骨架 ────────────────────────────────────────────────────────────────

const PLAIN_APP_JS = `App({
  globalData: {
    userInfo: null,
  },
  onLaunch() {
    // 冷启动只做轻量工作，耗时任务放到具体页面
  },
})`

const CLOUD_APP_JS = `App({
  globalData: {
    userInfo: null,
  },
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
      return
    }
    wx.cloud.init({
      env: 'your-env-id', // 换成自己的云开发环境 ID
      traceUser: true,
    })
  },
})`

const APP_WXSS = `page {
  background: #f7f7f7;
  color: #1f2329;
  font-size: 28rpx;
  font-family: -apple-system, 'PingFang SC', 'Helvetica Neue', sans-serif;
}

.card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
}`

const SITEMAP = JSON.stringify(
  {
    desc: '关于本文件的更多信息，请参考文档 https://developers.weixin.qq.com/miniprogram/dev/framework/sitemap.html',
    rules: [{ action: 'allow', page: '*' }],
  },
  null,
  2,
)

function slug(input, fallback) {
  const text = String(input ?? '').trim().toLowerCase()
  const cleaned = text.replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-').replace(/^[-_]+|[-_]+$/g, '')
  return cleaned || fallback
}

function projectFiles(state) {
  const name = slug(state.name, 'my-app')
  const title = String(state.title ?? '').trim() || '我的小程序'
  const cloud = !!state.cloud
  const skyline = !!state.skyline

  const config = {
    appid: 'touristappid',
    projectname: name,
    compileType: 'miniprogram',
    setting: {
      es6: true,
      postcss: true,
      minified: true,
      urlCheck: true,
      compileHotReLoad: true,
    },
    condition: {},
  }
  if (skyline) config.setting.skylineRenderEnable = true
  if (cloud) {
    config.miniprogramRoot = 'miniprogram/'
    config.cloudfunctionRoot = 'cloudfunctions/'
  }

  const app = {
    pages: ['pages/index/index'],
    window: {
      navigationBarTitleText: title,
      navigationBarBackgroundColor: '#ffffff',
      navigationBarTextStyle: 'black',
      backgroundColor: '#f7f7f7',
    },
    style: 'v2',
    sitemapLocation: 'sitemap.json',
    lazyCodeLoading: 'requiredComponents',
  }
  if (skyline) {
    app.renderer = 'skyline'
    app.componentFramework = 'glass-easel'
    app.rendererOptions = { skyline: { defaultDisplayBlock: true } }
  }

  return {
    name,
    title,
    config: JSON.stringify(config, null, 2),
    app: JSON.stringify(app, null, 2),
    js: cloud ? CLOUD_APP_JS : PLAIN_APP_JS,
    wxss: APP_WXSS,
    sitemap: SITEMAP,
  }
}

// ── 页面四件套 ──────────────────────────────────────────────────────────────

function normalizePath(input) {
  let path = String(input ?? '').trim().replace(/^\/+/, '').replace(/\.(wxml|wxss|js|json)$/i, '')
  path = path.replace(/[^A-Za-z0-9/_-]/g, '')
  const parts = path.split('/').filter(Boolean).map((part) => part.replace(/^-+|-+$/g, '') || 'page')
  if (parts.length === 0) return 'pages/index/index'
  if (parts.length === 1) return `pages/${parts[0]}/${parts[0]}`
  return parts.join('/')
}

const LIST_WXML = `<view class="page">
  <view
    class="item"
    wx:for="{{list}}"
    wx:key="id"
    hover-class="item-hover"
    bindtap="onItem"
    data-id="{{item.id}}"
  >
    <view class="item-title">{{item.title}}</view>
    <view class="item-desc">{{item.desc}}</view>
  </view>

  <view class="state" wx:if="{{loading && !list.length}}">加载中…</view>
  <view class="state" wx:elif="{{!list.length}}">还没有内容</view>
  <view class="state" wx:elif="{{finished}}">没有更多了</view>
</view>`

const LIST_WXSS = `page {
  background: #f7f7f7;
}

.page {
  padding: 24rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
}

.item {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}

.item-hover {
  opacity: 0.7;
}

.item-title {
  font-size: 32rpx;
  font-weight: 600;
}

.item-desc {
  margin-top: 8rpx;
  color: #8a9099;
  font-size: 26rpx;
}

.state {
  padding: 80rpx 0;
  text-align: center;
  color: #8a9099;
  font-size: 26rpx;
}`

const FORM_WXML = `<view class="page">
  <view class="card">
    <view class="field">
      <text class="label">姓名</text>
      <input
        class="input"
        placeholder="请输入姓名"
        value="{{form.name}}"
        data-key="name"
        bindinput="onInput"
        maxlength="20"
      />
    </view>

    <view class="field">
      <text class="label">手机号</text>
      <input
        class="input"
        type="number"
        placeholder="请输入手机号"
        value="{{form.phone}}"
        data-key="phone"
        bindinput="onInput"
        maxlength="11"
      />
    </view>

    <view class="field">
      <text class="label">备注</text>
      <textarea
        class="textarea"
        placeholder="补充说明"
        value="{{form.remark}}"
        data-key="remark"
        bindinput="onInput"
        maxlength="200"
      />
    </view>
  </view>

  <button class="submit" type="primary" loading="{{submitting}}" disabled="{{submitting}}" bindtap="onSubmit">
    提交
  </button>
</view>`

const FORM_WXSS = `page {
  background: #f7f7f7;
}

.page {
  padding: 24rpx;
  padding-bottom: calc(48rpx + env(safe-area-inset-bottom));
}

.card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 8rpx 24rpx;
}

.field {
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f1f2;
}

.field:last-child {
  border-bottom: 0;
}

.label {
  display: block;
  margin-bottom: 12rpx;
  color: #1f2329;
  font-size: 28rpx;
}

.input,
.textarea {
  width: 100%;
  font-size: 32rpx;
}

.textarea {
  height: 160rpx;
}

.submit {
  margin-top: 40rpx;
  background: #07c160;
  border-radius: 16rpx;
}`

const BLANK_WXML = `<view class="page">
  <view class="card">
    <text>页面已就绪，开始写内容吧。</text>
  </view>
</view>`

const BLANK_WXSS = `page {
  background: #f7f7f7;
}

.page {
  padding: 24rpx;
}

.card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
}`

function pageFiles(state) {
  const path = normalizePath(state.path)
  const base = path.split('/').pop()
  const title = String(state.title ?? '').trim() || base
  const kind = ['list', 'form', 'blank'].includes(state.kind) ? state.kind : 'list'
  const up = '../'.repeat(Math.max(1, path.split('/').length - 1))

  if (kind === 'form') {
    const js = `const request = require('${up}utils/request')

Page({
  data: {
    form: { name: '', phone: '', remark: '' },
    submitting: false,
  },

  onInput(e) {
    const key = e.currentTarget.dataset.key
    this.setData({ ['form.' + key]: e.detail.value })
  },

  validate() {
    const { name, phone } = this.data.form
    if (!name.trim()) return '请填写姓名'
    if (!/^1\\d{10}$/.test(phone)) return '手机号格式不对'
    return ''
  },

  async onSubmit() {
    if (this.data.submitting) return
    const error = this.validate()
    if (error) return wx.showToast({ title: error, icon: 'none' })

    this.setData({ submitting: true })
    try {
      await request('/apply', { method: 'POST', data: this.data.form })
      wx.showToast({ title: '提交成功' })
      setTimeout(() => wx.navigateBack(), 800)
    } catch (e) {
      wx.showToast({ title: '提交失败，请重试', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  },
})`
    return {
      path,
      title,
      kind,
      wxml: FORM_WXML,
      wxss: FORM_WXSS,
      js,
      json: JSON.stringify({ navigationBarTitleText: title, usingComponents: {} }, null, 2),
    }
  }

  if (kind === 'blank') {
    const js = `Page({
  data: {},

  onLoad() {
    // 从 options 里取路由参数
  },
})`
    return {
      path,
      title,
      kind,
      wxml: BLANK_WXML,
      wxss: BLANK_WXSS,
      js,
      json: JSON.stringify({ navigationBarTitleText: title, usingComponents: {} }, null, 2),
    }
  }

  const js = `const request = require('${up}utils/request')

Page({
  data: {
    list: [],
    page: 1,
    loading: false,
    finished: false,
  },

  onLoad() {
    this.load(true)
  },

  onPullDownRefresh() {
    this.load(true).finally(() => wx.stopPullDownRefresh())
  },

  onReachBottom() {
    if (!this.data.finished) this.load(false)
  },

  async load(reset) {
    if (this.data.loading) return
    this.setData({ loading: true })
    const page = reset ? 1 : this.data.page
    try {
      const res = await request('/items?page=' + page + '&size=10')
      const list = reset ? res.list : this.data.list.concat(res.list)
      this.setData({
        list,
        page: page + 1,
        finished: list.length >= res.total,
      })
    } catch (e) {
      wx.showToast({ title: '加载失败，请重试', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  onItem(e) {
    wx.navigateTo({ url: '/pages/detail/detail?id=' + e.currentTarget.dataset.id })
  },
})`

  return {
    path,
    title,
    kind,
    wxml: LIST_WXML,
    wxss: LIST_WXSS,
    js,
    json: JSON.stringify(
      {
        navigationBarTitleText: title,
        enablePullDownRefresh: true,
        onReachBottomDistance: 80,
        usingComponents: {},
      },
      null,
      2,
    ),
  }
}

// ── 面板状态 ────────────────────────────────────────────────────────────────

const PANEL_STATE = new Map()

function stateFor(scope) {
  const key = scope?.sessionId ? String(scope.sessionId) : 'local'
  let state = PANEL_STATE.get(key)
  if (!state) {
    state = { project: null, page: null }
    PANEL_STATE.set(key, state)
  }
  if (!state.project) {
    const s = { name: 'my-app', title: '我的小程序', tpl: 'basic', cloud: false, skyline: false }
    state.project = { ...s, files: projectFiles(s) }
  }
  if (!state.page) {
    const s = { path: 'pages/list/list', title: '列表', kind: 'list' }
    state.page = { ...s, files: pageFiles(s) }
  }
  return state
}

function projectFeed(s) {
  return {
    f: { name: s.name, title: s.title, tpl: s.tpl, cloud: s.cloud, skyline: s.skyline },
    files: { config: s.files.config, app: s.files.app, js: s.files.js, wxss: s.files.wxss, sitemap: s.files.sitemap },
  }
}

function pageFeed(s) {
  return {
    f: { path: s.path, title: s.title, kind: s.kind },
    files: { wxml: s.files.wxml, wxss: s.files.wxss, js: s.files.js, json: s.files.json },
  }
}

function collect(values, keys) {
  const found = {}
  const walk = (node) => {
    if (!node || typeof node !== 'object') return
    for (const [key, value] of Object.entries(node)) {
      if (keys.includes(key) && (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')) {
        found[key] = value
      } else if (value && typeof value === 'object') {
        walk(value)
      }
    }
  }
  walk(values)
  return found
}

function fieldOf(event) {
  const value = event?.value
  if (value && typeof value === 'object') {
    if ('value' in value) return value.value
    const keys = Object.keys(value)
    if (keys.length === 1) return value[keys[0]]
    return undefined
  }
  return value
}

function applyProject(state, values) {
  const found = collect(values, ['name', 'title', 'tpl', 'cloud', 'skyline'])
  if (typeof found.name === 'string') state.name = slug(found.name, 'my-app')
  if (typeof found.title === 'string') state.title = found.title.slice(0, 20)
  if (isTemplate(found.tpl)) {
    state.tpl = found.tpl
    state.cloud = TEMPLATES[found.tpl].cloud
    state.skyline = TEMPLATES[found.tpl].skyline
  }
  if (typeof found.cloud === 'boolean') state.cloud = found.cloud
  if (typeof found.skyline === 'boolean') state.skyline = found.skyline
}

function applyPage(state, values) {
  const found = collect(values, ['path', 'title', 'kind'])
  if (typeof found.path === 'string') state.path = normalizePath(found.path)
  if (typeof found.title === 'string') state.title = found.title.slice(0, 20)
  if (typeof found.kind === 'string' && ['list', 'form', 'blank'].includes(found.kind)) state.kind = found.kind
}

// ── 视图 ────────────────────────────────────────────────────────────────────

function kitView() {
  return {
    v: 2,
    type: 'stack',
    accent: ACCENT,
    title: '小程序工坊',
    children: [
      {
        type: 'callout',
        tone: 'info',
        text: '微信小程序 = WXML 结构 + WXSS 样式 + JS 逻辑 + JSON 配置。这里生成的骨架和配置可以直接导入开发者工具。',
      },
      {
        type: 'actions',
        items: [
          { label: '新建项目', action: 'open-project', icon: 'add', style: 'primary' },
          { label: '页面四件套', action: 'open-page', icon: 'file' },
          { label: '上线自查', action: 'open-audit', icon: 'check' },
        ],
      },
      { type: 'text', text: '从模板开始', style: { size: 'subtitle', weight: 'semibold' } },
      {
        type: 'list',
        items: [
          { title: '空白项目', subtitle: '最小可运行骨架，5 个根文件', icon: 'folder', action: { id: 'use', args: { tpl: 'basic' } } },
          { title: '云开发项目', subtitle: 'miniprogram/ + cloudfunctions/', icon: 'cloud', action: { id: 'use', args: { tpl: 'cloud' } } },
          { title: 'Skyline 项目', subtitle: 'glass-easel 渲染 + 按需注入', icon: 'sparkle', action: { id: 'use', args: { tpl: 'skyline' } } },
          { title: '列表页', subtitle: '下拉刷新 · 触底加载 · 空态', icon: 'list', action: { id: 'open-page' } },
          { title: '表单页', subtitle: '校验 · 防重复提交 · 失败提示', icon: 'edit', action: { id: 'open-page' } },
          { title: '开发规范', subtitle: '9 条约定，注入对话让 AI 照着写', icon: 'book', action: { id: 'spec' } },
        ],
      },
      { type: 'divider' },
      { type: 'text', text: '代码速查', style: { size: 'subtitle', weight: 'semibold' } },
      {
        type: 'accordion',
        items: SNIPPETS.map((snippet) => ({
          label: snippet.label,
          children: [{ type: 'codeBlock', language: snippet.language, code: snippet.code }],
        })),
      },
      {
        type: 'callout',
        tone: 'good',
        text: '小提示：新项目先跑通「空白项目」，再加页面；页面多了就用分包，主包只留 tabBar。',
      },
      { type: 'actions', items: [{ label: '规范注入', action: 'spec', icon: 'sparkle' }] },
    ],
  }
}

function projectView(scope) {
  const files = stateFor(scope).project.files
  return {
    v: 2,
    type: 'stack',
    accent: ACCENT,
    title: '新建项目',
    children: [
      {
        type: 'callout',
        tone: 'info',
        text: '填好点「生成骨架」，按 project.config.json 的 miniprogramRoot 建文件（云开发模板是 miniprogram/），再用开发者工具导入项目根目录。AppID 记得换成自己的。',
      },
      {
        type: 'form',
        label: '项目设置',
        submit: { id: 'build' },
        submitLabel: '生成骨架',
        children: [
          { type: 'textField', label: '项目名（英文/数字）', bind: 'data.f.name', placeholder: 'my-app', maxLength: 40, onChange: 'change-name' },
          { type: 'textField', label: '导航栏标题', bind: 'data.f.title', placeholder: '我的小程序', maxLength: 20, onChange: 'change-title' },
          {
            type: 'select',
            label: '模板',
            bind: 'data.f.tpl',
            options: [
              { label: '空白项目', value: 'basic' },
              { label: '云开发', value: 'cloud' },
              { label: 'Skyline', value: 'skyline' },
            ],
            onChange: 'change-tpl',
          },
          { type: 'toggle', label: '使用 Skyline 渲染', bind: 'data.f.skyline', onChange: 'change-skyline' },
          { type: 'toggle', label: '启用云开发', bind: 'data.f.cloud', onChange: 'change-cloud' },
        ],
      },
      {
        type: 'tabs',
        items: [
          { label: 'project.config.json', children: [{ type: 'codeBlock', language: 'json', code: files.config }] },
          { label: 'app.json', children: [{ type: 'codeBlock', language: 'json', code: files.app }] },
          { label: 'app.js', children: [{ type: 'codeBlock', language: 'javascript', code: files.js }] },
          { label: 'app.wxss', children: [{ type: 'codeBlock', language: 'css', code: files.wxss }] },
          { label: 'sitemap.json', children: [{ type: 'codeBlock', language: 'json', code: files.sitemap }] },
        ],
      },
      {
        type: 'actions',
        items: [
          { label: '复制全部', action: 'copy-all', icon: 'copy' },
          { label: '写进输入框', action: 'to-chat', icon: 'send', style: 'primary' },
        ],
      },
      {
        type: 'steps',
        items: [
          { label: '建目录', detail: '按 miniprogramRoot 放 app.json 等同级文件', status: 'todo' },
          { label: '导入工具', detail: '选择项目根目录，填自己的 AppID', status: 'todo' },
          { label: '真机预览', detail: '确认基础库版本和域名白名单', status: 'todo' },
        ],
      },
    ],
  }
}

function pageView(scope) {
  const files = stateFor(scope).page.files
  return {
    v: 2,
    type: 'stack',
    accent: ACCENT,
    title: '页面四件套',
    children: [
      {
        type: 'callout',
        tone: 'info',
        text: '生成 .wxml / .wxss / .js / .json 四个文件；记得把页面路径加进 app.json 的 pages。',
      },
      {
        type: 'form',
        label: '页面设置',
        submit: { id: 'build' },
        submitLabel: '生成四件套',
        children: [
          { type: 'textField', label: '页面路径', bind: 'data.f.path', placeholder: 'pages/list/list', maxLength: 80, onChange: 'change-path' },
          { type: 'textField', label: '页面标题', bind: 'data.f.title', placeholder: '列表', maxLength: 20, onChange: 'change-title' },
          {
            type: 'select',
            label: '页面类型',
            bind: 'data.f.kind',
            options: [
              { label: '列表页', value: 'list' },
              { label: '表单页', value: 'form' },
              { label: '空白页', value: 'blank' },
            ],
            onChange: 'change-kind',
          },
        ],
      },
      {
        type: 'tabs',
        items: [
          { label: 'WXML', children: [{ type: 'codeBlock', language: 'xml', code: files.wxml }] },
          { label: 'WXSS', children: [{ type: 'codeBlock', language: 'css', code: files.wxss }] },
          { label: 'JS', children: [{ type: 'codeBlock', language: 'javascript', code: files.js }] },
          { label: 'JSON', children: [{ type: 'codeBlock', language: 'json', code: files.json }] },
        ],
      },
      {
        type: 'actions',
        items: [
          { label: '复制四个文件', action: 'copy-all', icon: 'copy' },
          { label: '写进输入框', action: 'to-chat', icon: 'send', style: 'primary' },
        ],
      },
    ],
  }
}

function auditView() {
  return {
    v: 2,
    type: 'stack',
    accent: ACCENT,
    title: '上线自查',
    children: [
      {
        type: 'callout',
        tone: 'warn',
        text: '提交审核前逐项过一遍。配置类问题在开发者工具里就能发现，合规类问题只能回后台改。',
      },
      {
        type: 'tabs',
        items: CHECK.map((group) => ({
          label: group.label,
          children: [{ type: 'list', items: group.items }],
        })),
      },
      { type: 'actions', items: [{ label: '复制清单', action: 'copy', icon: 'copy' }] },
      {
        type: 'callout',
        tone: 'good',
        text: '开发者工具「代码质量」里可以跑评分，重点看包体积、未使用文件和大图。',
      },
    ],
  }
}

// ── 插件 ────────────────────────────────────────────────────────────────────

export function apply(ctx) {
  ctx.inject(['dshGo'], (ctx) => {
    // 首页
    ctx.dshGo.panel('home', {
      view: kitView,
      actions: {
        'open-project': () => ({ open: 'panel:project-setup' }),
        'open-page': () => ({ open: 'panel:page-files' }),
        'open-audit': () => ({ open: 'panel:prelaunch' }),
        spec: () => ({ insert: SPEC_PROMPT.slice(0, 2000), toast: '开发规范已放入输入框' }),
        use: (scope, event) => {
          const tpl = String(event?.value?.tpl ?? 'basic')
          const preset = isTemplate(tpl) ? TEMPLATES[tpl] : TEMPLATES.basic
          const state = stateFor(scope).project
          state.tpl = isTemplate(tpl) ? tpl : 'basic'
          state.cloud = preset.cloud
          state.skyline = preset.skyline
          state.files = projectFiles(state)
          return { open: 'panel:project-setup', toast: `已套用「${preset.label}」` }
        },
      },
    })

    // 新建项目
    ctx.dshGo.panel('project-setup', {
      view: projectView,
      data: (scope, emit) => {
        emit(projectFeed(stateFor(scope).project))
        return () => {}
      },
      actions: {
        build: (scope, event) => {
          const state = stateFor(scope).project
          applyProject(state, event?.value)
          state.files = projectFiles(state)
          return { patch: projectFeed(state), refresh: true, toast: '骨架已生成' }
        },
        'copy-all': (scope) => {
          const state = stateFor(scope).project
          const body = [
            `/* project.config.json */\n${state.files.config}`,
            `/* app.json */\n${state.files.app}`,
            `/* app.js */\n${state.files.js}`,
            `/* app.wxss */\n${state.files.wxss}`,
            `/* sitemap.json */\n${state.files.sitemap}`,
          ].join('\n\n')
          if (body.length > 8000) return { toast: '内容太长，请分文件复制' }
          return { copy: body, toast: '已复制 5 个文件' }
        },
        'to-chat': (scope) => {
          const state = stateFor(scope).project
          const text = [
            `在微信小程序项目「${state.title}」中生成可运行骨架（项目名 ${state.name}${state.cloud ? '，含云开发' : ''}${state.skyline ? '，使用 Skyline' : ''}）。`,
            '请按文件逐个给出完整代码，不要省略：',
            'project.config.json、sitemap.json、app.js、app.json、app.wxss、pages/index/index.wxml、pages/index/index.wxss、pages/index/index.js、pages/index/index.json。',
            '要求：app.json 的 pages 注册全部页面，lazyCodeLoading 用 requiredComponents，样式统一 rpx，首页给出可见的示例内容。',
          ].join('\n')
          return { insert: text.slice(0, 2000), toast: '已写入输入框' }
        },
        'change-name': (scope, event) => {
          const state = stateFor(scope).project
          const value = fieldOf(event)
          if (typeof value === 'string') state.name = slug(value, 'my-app')
        },
        'change-title': (scope, event) => {
          const state = stateFor(scope).project
          const value = fieldOf(event)
          if (typeof value === 'string') state.title = value.slice(0, 20)
        },
        'change-tpl': (scope, event) => {
          const state = stateFor(scope).project
          const value = fieldOf(event)
          if (!isTemplate(value)) return
          state.tpl = value
          state.cloud = TEMPLATES[value].cloud
          state.skyline = TEMPLATES[value].skyline
          return { patch: { f: { cloud: state.cloud, skyline: state.skyline } } }
        },
        'change-skyline': (scope, event) => {
          const state = stateFor(scope).project
          const value = fieldOf(event)
          if (typeof value === 'boolean') state.skyline = value
        },
        'change-cloud': (scope, event) => {
          const state = stateFor(scope).project
          const value = fieldOf(event)
          if (typeof value === 'boolean') state.cloud = value
        },
      },
    })

    // 页面四件套
    ctx.dshGo.panel('page-files', {
      view: pageView,
      data: (scope, emit) => {
        emit(pageFeed(stateFor(scope).page))
        return () => {}
      },
      actions: {
        build: (scope, event) => {
          const state = stateFor(scope).page
          applyPage(state, event?.value)
          state.files = pageFiles(state)
          return { patch: pageFeed(state), refresh: true, toast: '四件套已生成' }
        },
        'copy-all': (scope) => {
          const state = stateFor(scope).page
          const { path, files } = state
          const body = [
            `/* ${path}.wxml */\n${files.wxml}`,
            `/* ${path}.wxss */\n${files.wxss}`,
            `/* ${path}.js */\n${files.js}`,
            `/* ${path}.json */\n${files.json}`,
          ].join('\n\n')
          if (body.length > 8000) return { toast: '内容太长，请分文件复制' }
          return { copy: body, toast: '已复制 4 个文件' }
        },
        'to-chat': (scope) => {
          const state = stateFor(scope).page
          const kindName = state.kind === 'form' ? '表单' : state.kind === 'blank' ? '空白' : '列表'
          const text = [
            `在微信小程序里生成「${state.title}」${kindName}页，路径 ${state.path}。`,
            '给出 .wxml、.wxss、.js、.json 四个文件的完整代码，不要省略；',
            'js 用 Page()，列表页包含下拉刷新、触底加载、空态；表单页包含校验和防重复提交；',
            '请求统一用 utils/request.js 封装，样式用 rpx，并提醒我把路径加进 app.json 的 pages。',
          ].join('\n')
          return { insert: text.slice(0, 2000), toast: '已写入输入框' }
        },
        'change-path': (scope, event) => {
          const state = stateFor(scope).page
          const value = fieldOf(event)
          if (typeof value === 'string') state.path = normalizePath(value)
        },
        'change-title': (scope, event) => {
          const state = stateFor(scope).page
          const value = fieldOf(event)
          if (typeof value === 'string') state.title = value.slice(0, 20)
        },
        'change-kind': (scope, event) => {
          const state = stateFor(scope).page
          const value = fieldOf(event)
          if (typeof value === 'string' && ['list', 'form', 'blank'].includes(value)) state.kind = value
        },
      },
    })

    // 上线自查
    ctx.dshGo.panel('prelaunch', {
      view: auditView,
      actions: {
        copy: () => {
          const text = CHECK.map(
            (group) => `## ${group.label}\n` + group.items.map((item) => `- [ ] ${item.title}：${item.subtitle}`).join('\n'),
          ).join('\n\n')
          return { copy: text.slice(0, 8000), toast: '自查清单已复制' }
        },
      },
    })

    // 输入框胶囊：需求 → 小程序开发任务书
    ctx.dshGo.on('spec', (scope) => {
      const draft = String(scope?.draft ?? '').trim()
      if (!draft) return { toast: '先在输入框写一句需求' }
      const text = `按微信小程序规范实现：${draft}\n\n${SPEC_PROMPT}`
      return { insert: text.slice(0, 2000), toast: '已改写成开发任务书' }
    })
  })
}
