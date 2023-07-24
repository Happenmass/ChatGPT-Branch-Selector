// contentScript.js
logToBackground('Content script started.');

function recordDivTree(element) {
  const divTree = {
    tagName: element.tagName,
    className: element.className,
    type: 'null',
    textContent: 'header',
    children: [],
  };
  // 获取一级子元素
  const childDivs = Array.from(element.children).filter(child => child.tagName === 'DIV');

  // 记录一级子元素的信息，并递归处理下一级子元素
  let i = 0;
  recordChildren(childDivs, divTree.children, i);
  
  return divTree;
}

function recordChildren(childDivs, divTree, i) {
  const childDiv = childDivs[i];

  const temp_divTree = {
    tagName: childDiv.tagName,
    className: childDiv.className,
    type: findHiddenDivContent(childDiv) === null ? 'answer' : 'ask',
    textContent: findHiddenDivContent(childDiv) === null ? findFirstPTagContent(childDiv) : findHiddenDivContent(childDiv),
    children: [],
  };
    divTree.push(temp_divTree);

    // 递归处理子节点\
    if(i < childDivs.length-1) {
      recordChildren(childDivs, temp_divTree.children, i+1);
    }
    else{
      return temp_divTree;
    }
}

function logDivTree() {
  // 通过CSS选择器获取class为“flex flex-col h-full text-sm dark:bg-gray-800”的DIV
  const targetDiv = document.querySelector('.flex.flex-col.h-full.text-sm.dark\\:bg-gray-800');

  if (targetDiv) {
    // 调用记录函数并获取树形结构
    logToBackground('找到目标 DIV，开始记录 DIV 结构...');
    const divTree = recordDivTree(targetDiv);

    // 将树形结构保存到 Chrome 扩展的存储中
    chrome.storage.local.set({ divTree }, () => {
      logToBackground('DIV 结构已记录：');
    });
  } else {
    logToBackground('目标 DIV 未找到，继续寻找...');
    setTimeout(logDivTree, 1000); // 每隔 1 秒重复执行，可以根据实际情况调整间隔时间
  }
}

// 调用函数开始寻找目标 DIV
logDivTree();

function logToBackground(message) {
  chrome.runtime.sendMessage({ action: 'log', message: message });
}

function findHiddenDivContent(element) {
  // 获取一级子元素
  const childDivs = Array.from(element.children).filter(child => child.tagName === 'DIV');

  for (const childDiv of childDivs) {
    // 检查当前子元素是否包含 class 为 'empty:hidden'
    if (childDiv.classList.contains('empty:hidden')) {
      return childDiv.textContent; // 如果有，返回 class 中的 textContent
    }

    // 递归处理当前子元素的子元素
    const result = findHiddenDivContent(childDiv);
    if (result !== null) {
      return result; // 如果找到了目标 DIV，就直接返回结果
    }
  }

  return null; // 如果整个 DIV 中都没有找到目标 DIV，则返回 null
}


function findFirstPTagContent(element) {
  // 遍历当前元素的子节点
  for (let i = 0; i < element.childNodes.length; i++) {
    const node = element.childNodes[i];

    // 如果当前节点是 <p> 标签，则返回其内容
    if (node.tagName === 'P') {
      return node.textContent;
    }

    // 如果当前节点是元素节点（Node.ELEMENT_NODE），则递归处理其子节点
    if (node.nodeType === Node.ELEMENT_NODE) {
      const result = findFirstPTagContent(node);
      if (result) {
        return result; // 找到目标 <p> 标签后立即返回
      }
    }
  }

  // 没有找到目标 <p> 标签，返回 null
  return null;
}
