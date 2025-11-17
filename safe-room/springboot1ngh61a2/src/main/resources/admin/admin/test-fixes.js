/**
 * 快速测试脚本 - 验证 jQuery 和 Element Plus 修复
 */

// 测试 1: jQuery 初始化检查
console.log('=== 测试 1: jQuery 初始化 ===');

// 模拟 jQuery 加载前的状态
delete window.jQuery;
delete window.$;

console.log('jQuery 初始状态:', typeof window.jQuery, typeof window.$);

// 模拟 jQuery 加载
window.jQuery = window.$ = function(selector) {
  if (typeof selector === 'string' && selector.includes('<style')) {
    return {
      length: 1,
      css: function() { return this; }
    };
  }
  return { length: 0 };
};
window.jQuery.fn = window.$.fn = {};

console.log('jQuery 加载后状态:', typeof window.jQuery, typeof window.$);

// 测试样式初始化
function initializeStyles() {
  if (typeof window.jQuery === 'function' && typeof window.$ === 'function') {
    try {
      const styleElement = document.createElement('style');
      styleElement.type = 'text/css';
      styleElement.textContent = 'body { background: #f0f0f0; }';

      const head = document.head || document.getElementsByTagName('head')[0];
      if (head) {
        head.appendChild(styleElement);
        console.log('✅ 样式初始化成功');
        return true;
      }
    } catch (error) {
      console.warn('❌ 样式初始化失败:', error);
      return false;
    }
  }
  console.log('❌ jQuery 不可用');
  return false;
}

initializeStyles();

// 测试 2: Element Plus 组件检查
console.log('\n=== 测试 2: Element Plus 组件注册 ===');

// 模拟 Vue 应用
const mockApp = {
  component: function(name, component) {
    this._components = this._components || new Map();
    this._components.set(name, component);
    console.log(`✅ 注册组件: ${name}`);
  },
  use: function(plugin) {
    if (plugin && typeof plugin.install === 'function') {
      plugin.install(this);
    }
  },
  _components: new Map()
};

// 模拟 Element Plus 组件
const ElMenu = { name: 'ElMenu' };
const ElMenuItem = { name: 'ElMenuItem' };
const ElSubMenu = { name: 'ElSubMenu' };
const ElMenuItemGroup = { name: 'ElMenuItemGroup' };

// 模拟 Element Plus 插件
const ElementPlus = {
  install(app) {
    app.component('ElMenu', ElMenu);
    app.component('ElMenuItem', ElMenuItem);
    app.component('ElSubMenu', ElSubMenu);
    app.component('ElMenuItemGroup', ElMenuItemGroup);
    app.component('ElMenu', ElMenu);
    app.component('ElSubmenu', ElSubMenu);
  }
};

// 安装 Element Plus
mockApp.use(ElementPlus);

// 手动注册组件（模拟 main.ts 中的代码）
mockApp.component('ElMenu', ElMenu);
mockApp.component('ElMenuItem', ElMenuItem);
mockApp.component('ElMenuItemGroup', ElMenuItemGroup);
mockApp.component('ElSubMenu', ElSubMenu);
mockApp.component('ElMenu', ElMenu);
mockApp.component('ElMenuItem', ElMenuItem);
mockApp.component('ElMenuItemGroup', ElMenuItemGroup);
mockApp.component('ElSubmenu', ElSubMenu);

// 检查组件注册
const requiredComponents = ['ElMenu', 'ElMenuItem', 'ElSubMenu', 'ElMenuItemGroup', 'el-menu', 'el-submenu'];

requiredComponents.forEach(compName => {
  if (mockApp._components.has(compName)) {
    console.log(`✅ ${compName} 组件已注册`);
  } else {
    console.log(`❌ ${compName} 组件未注册`);
  }
});

// 测试 3: 模板解析模拟
console.log('\n=== 测试 3: 模板解析模拟 ===');

function resolveComponent(template, app) {
  const componentRegex = /<(\w+)(?:\s[^>]*)?>/g;
  const components = new Set();
  let match;

  while ((match = componentRegex.exec(template)) !== null) {
    components.add(match[1]);
  }

  console.log('模板中的组件:', Array.from(components));

  const unresolved = [];
  components.forEach(compName => {
    if (!app._components.has(compName)) {
      unresolved.push(compName);
    }
  });

  if (unresolved.length > 0) {
    console.log('❌ 未解析的组件:', unresolved);
  } else {
    console.log('✅ 所有组件都已解析');
  }

  return unresolved.length === 0;
}

// 测试模板
const testTemplate = `
  <div>
    <el-menu default-active="1" mode="horizontal">
      <el-menu-item index="1">Home</el-menu-item>
      <el-submenu index="2">
        <template #title>Menu</template>
        <el-menu-item index="2-1">Item 1</el-menu-item>
        <el-menu-item index="2-2">Item 2</el-menu-item>
      </el-submenu>
    </el-menu>
  </div>
`;

resolveComponent(testTemplate, mockApp);

console.log('\n=== 测试完成 ===');
