// popup.js

// 获取之前记录的 divTree 数据
chrome.storage.local.get('divTree', ({ divTree }) => {
    if (divTree) {
      const treeContainer = document.getElementById('tree-container');
  
      // 调用函数来渲染树形结构
      renderDivTree(treeContainer, divTree);
    } else {
      const treeContainer = document.getElementById('tree-container');
      const errorMessage = document.createElement('div');
      errorMessage.textContent = '未找到记录的 DIV 结构数据。';
      treeContainer.appendChild(errorMessage);
    }
  });
  
// 渲染树形结构的函数
function renderDivTree(container, node) {
  const divNode = document.createElement('div');
  divNode.classList.add('node');

  // 将 tagInfo 内容作为 data-attribute 存储在节点上
  divNode.setAttribute('data-tag-info', `${node.textContent}`);

  // 将 type 属性作为 data-attribute 存储在节点上
  divNode.setAttribute('data-type', node.type);

  container.appendChild(divNode);

  if (node.children.length > 0) {
    const line = document.createElement('div');
    line.classList.add('line');
    container.appendChild(line);

    const childrenContainer = document.createElement('div');
    childrenContainer.classList.add('children-container');
    container.appendChild(childrenContainer);

    node.children.forEach(childNode => {
      renderDivTree(childrenContainer, childNode);
    });
  }
}
document.addEventListener('contextmenu', event => event.preventDefault());

// 鼠标右键点击事件监听
document.addEventListener('DOMContentLoaded', () => {
  const nodes = document.querySelectorAll('.node');
  logToBackground('nodescount'+nodes.length);
  nodes.forEach(node => {
    node.addEventListener('mousedown', event => {
      if (event.button === 2) {
        showContextMenu(event, node);
      }
    });
  });
});

// 显示上下文菜单
function showContextMenu(event, target) {
  const contextMenu = document.createElement('div');
  contextMenu.classList.add('context-menu');
  contextMenu.style.top = `${event.clientY}px`;
  contextMenu.style.left = `${event.clientX}px`;

  const colors = ['star', 'bad', 'abandon']; // 这里可以添加更多颜色选项

  colors.forEach(color => {
    const menuItem = document.createElement('div');
    menuItem.classList.add('menu-item');
    menuItem.textContent = color;
    menuItem.addEventListener('click', () => {
      setNodeColor(target, color);
      hideContextMenu();
    });
    contextMenu.appendChild(menuItem);
  });

  document.body.appendChild(contextMenu);

  // 点击其他地方隐藏上下文菜单
  document.addEventListener('click', hideContextMenu);

}

function logToBackground(message) {
  chrome.runtime.sendMessage({ action: 'log', message: message });
}


// 隐藏上下文菜单
function hideContextMenu() {
  const contextMenu = document.querySelector('.context-menu');
  if (contextMenu) {
    contextMenu.remove();
  }
}

// 设置节点颜色
function setNodeColor(node, color) {
  node.setAttribute('data-type', color);
}
  