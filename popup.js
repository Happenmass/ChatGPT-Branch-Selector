// popup.js
const refreshButton = document.getElementById('refreshButton');

// 添加按钮点击事件监听器

document.getElementById('runContentScriptButton').addEventListener('click', () => {
  // 向 content_script.js 发送消息，请求重新执行
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'reexecuteContentScript' });
  });
});

chrome.runtime.onMessage.addListener(message => {
  if (message.status === 'contentsuccess') {
    logToBackground('content success');
    refreshhtml();
  } else {
    // logToBackground('content failed');
  }
});

// document.getElementById('scrollBtn').addEventListener('click', function() {
//   chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//     chrome.scripting.executeScript(
//       {
//         target: {tabId: tabs[0].id},
//         function: scrollDown
//       }
//     );
//   });

//   function scrollDown() {
//     // 根据实际情况，替换为正确的元素选择器，以选择具有滚动行为的特定元素。
//     var scrollDiv = document.querySelector('#__next > div.overflow-hidden.w-full.h-full.relative.flex.z-0 > div.relative.flex.h-full.max-w-full.flex-1.overflow-hidden > div > main > div.flex-1.overflow-hidden > div > div');
//     if (scrollDiv) {
//       logToBackground('scroll success');
//       scrollDiv.scrollTop += 100;
//     } else {
//       logToBackground('No element found for scrolling');
//     }
//   }
// });

// 使用 Promise 来发送消息给 content_script.js
// function sendMessageToContentScript(tabId, message) {
//   return new Promise((resolve, reject) => {
//     chrome.tabs.sendMessage(tabId, message, response => {
//       if (chrome.runtime.lastError) {
//         // 发送消息失败时，返回一个 rejected 状态的 Promise
//         reject(chrome.runtime.lastError);
//       } else {
//         // 返回执行结果给 resolved 状态的 Promise
//         resolve(response);
//       }
//     });
//   });
// }


// 获取之前记录的 divTree 数据
function refreshhtml(){
  chrome.storage.local.get('divTree', ({ divTree }) => {
    if (divTree) {
      const treeContainer = document.getElementById('tree-container');
      if (treeContainer) {
        // 获取 "tree-container" div 下的所有 div 元素
        const divElements = treeContainer.querySelectorAll('div');
        // 遍历并删除每一个 div 元素
        divElements.forEach(div => div.remove());
      }
      // 调用函数来渲染树形结构
      renderDivTree(treeContainer, divTree);
    } else {
      const treeContainer = document.getElementById('tree-container');
      const errorMessage = document.createElement('div');
      errorMessage.textContent = '未找到记录的 DIV 结构数据。';
      treeContainer.appendChild(errorMessage);
    }
  });
}
refreshhtml();
// 渲染树形结构的函数
function renderDivTree(container, node) {
  const divNode = document.createElement('div');
  divNode.classList.add('node');
  divNode.addEventListener('mousedown', event => {
    if (event.button === 2) {
      hideContextMenu();
      showContextMenu(event, divNode);
    }
    if (event.button === 0) {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.scripting.executeScript(
          {
            target: {tabId: tabs[0].id},
            function: scrollDown,
            args: [node.top]
          }
        );
      });

      function scrollDown(top) {
        // 根据实际情况，替换为正确的元素选择器，以选择具有滚动行为的特定元素。
        var scrollDiv = document.querySelector('#__next > div.overflow-hidden.w-full.h-full.relative.flex.z-0 > div.relative.flex.h-full.max-w-full.flex-1.overflow-hidden > div > main > div.flex-1.overflow-hidden > div > div');
        if (scrollDiv) {
          scrollDiv.scrollTop = top;
        } else {
          logToBackground('No element found for scrolling');
        }
      }

    }
      // 通过Chrome的tabs API获取当前活动标签页
  });

  // 将 tagInfo 内容作为 data-attribute 存储在节点上
  divNode.setAttribute('data-tag-info', `${node.textContent}`);

  // 将 type 属性作为 data-attribute 存储在节点上
  divNode.setAttribute('data-type', node.type);

  // container.appendChild(divNode);

  const ndoeset = document.createElement('div');
  ndoeset.classList.add('node-set');
  ndoeset.appendChild(divNode);
  container.appendChild(ndoeset);

  if (node.children.length > 0) {
    const line = document.createElement('div');
    line.classList.add('line');
    ndoeset.appendChild(line);


    let i = 0;
    if(node.children.length>1){
      const childrenContainerset = document.createElement('div');
      childrenContainerset.classList.add('children-container-set');

      node.children.forEach(childNode => {
        const childrenContainer = document.createElement('div');
        childrenContainer.classList.add('children-container');
        childrenContainerset.appendChild(childrenContainer);
        container.appendChild(childrenContainerset);
        renderDivTree(childrenContainer, childNode);
      }
      );
    }
    else if(node.children.length==1){
      const childrenContainer = document.createElement('div');
      childrenContainer.classList.add('children-container');
      container.appendChild(childrenContainer);
      renderDivTree(childrenContainer, node.children[0]);
    } 
  }
}

document.addEventListener('contextmenu', event => event.preventDefault());
// 鼠标右键点击事件监听


document.addEventListener('DOMContentLoaded', function () {
  const mainContainer = document.getElementById('tree-container');

  // 监听失去焦点事件
  window.addEventListener('blur', function (event) {
    // 阻止事件冒泡
    event.stopPropagation();

    // 这里可以选择执行其他操作，比如保持界面可见
    // 例如：mainContainer.style.display = 'block';
  });
});


// 显示上下文菜单
function showContextMenu(event, target) {
  const contextMenu = document.createElement('div');
  contextMenu.classList.add('context-menu');
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  contextMenu.style.top = `${event.clientY + scrollTop}px`;
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

  // 获取之前记录的 divTree 数据
  chrome.storage.local.get('divTree', ({ divTree }) => {
    if (divTree) {
      // 更新节点的 type 属性
      updateNodeType(divTree, node, color);

      // 将更新后的 divTree 数据保存到 Chrome 扩展的存储中
      chrome.storage.local.set({ divTree }, () => {
        logToBackground('type have been changed');
      });
    }
  });
}

// 递归更新节点的 type 属性
function updateNodeType(node, targetNode, type) {
  if (node.textContent === targetNode.getAttribute('data-tag-info')) {
    node.type = type;
    return true;
  }

  if (node.children.length) {
    for (const childNode of node.children) {
      if (updateNodeType(childNode, targetNode, type)) {
        return true;
      }
    }
  }

  return false;
}

function logToBackground(message) {
  chrome.runtime.sendMessage({ action: 'log', message: message });
}