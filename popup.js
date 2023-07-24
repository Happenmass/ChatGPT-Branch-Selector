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
  