// contentScript.js
logToBackground('Content script started.');
// 添加消息监听，接收来自 popup.html 的请求
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'reexecuteContentScript') {
    logDivTree().then(() => {
      logToBackground('send contentsuccess');
      sendMessageToPopup({ status: 'contentsuccess' });
    });
    //执行一次popup.js脚本
    
    // 使用 return true 来告知 Chrome 扩展将 sendResponse 回调推迟到异步执行
    return true;
  }
});



chrome.storage.local.remove('divTree', () => {
  logToBackground('divTree 已从存储中删除');
});
// 发送消息给 popup.js
function sendMessageToPopup(message) {
  chrome.runtime.sendMessage(message);
}

function getDivTreeFromStorage() {
  return new Promise(resolve => {
    chrome.storage.local.get('divTree', ({ divTree }) => {
      resolve(divTree);
    });
  });
}

// 调用函数开始寻找目标 DIV
logDivTree();
// 调用目标函数开始添加listener
addListener();


async function recordDivTree(element) {
  const divTree = {
    tagName: element.tagName,
    className: element.className,
    type: 'null',
    top: element.offsetTop,
    textContent: 'header',
    targetDiv: null,
    children: [],
  };
  // 获取一级子元素
  const childDivs = Array.from(element.children).filter(child => child.tagName === 'DIV');

  try {
    // 使用 await 等待获取 divTree 值的 Promise 完成
    const divTreeExist = await getDivTreeFromStorage();
    // logToBackground(divTreeExist);
    let i = 0;
    if (divTreeExist && Object.keys(divTreeExist).length !== 0) {
      logToBackground('divTree_exist');
      await recorverChildren(childDivs,divTreeExist, i);
      logToBackground(divTreeExist);
      return divTreeExist;
    } else {
      logToBackground('divTree_not_exist');
      await recordChildren(childDivs, divTree, i);
      return divTree;
    }
  } catch (error) {
    console.error('获取 divTree 失败：', error);
    // 处理错误情况
  }
}

function recorverChildren(childDivs, divTree, i) {
  // logToBackground('num'+i);
  // logToBackground('childDivs.length'+childDivs.length);
  const childDiv = childDivs[i];

  let last_content = null;

  if(childDivs[i-1]){
    last_content = findHiddenDivContent(childDivs[i-1]) === null ? findFirstPTagContent(childDivs[i-1]) : findHiddenDivContent(childDivs[i-1]);
  }
  else{
    last_content = null;
  }
  const temp_divTree = {
    tagName: childDiv.tagName,
    className: childDiv.className,
    type: findHiddenDivContent(childDiv) === null ? 'answer' : 'ask',
    top: childDiv.offsetTop,
    targetDiv: childDiv,
    textContent: findHiddenDivContent(childDiv) === null ? findFirstPTagContent(childDiv) : findHiddenDivContent(childDiv),
    children: [],
  };
  if(divTree.children.length === 0 && last_content === divTree.textContent){
    // logToBackground('divTree.textContent')
    divTree.children.push(temp_divTree);
    // 递归处理子节点\
    if(i < childDivs.length-2) {
      recorverChildren(childDivs, temp_divTree, i+1);
    }
    }
  else{
    // logToBackground('divTree.children.length != 0')
    var samechild = false;
    divTree.children.forEach(childdom => {
      if(childdom.textContent === temp_divTree.textContent){
        if ( i < childDivs.length-2){
          recorverChildren(childDivs, childdom, i+1);
        }
        samechild = true;
      }
    });
    if(!samechild){
      if(last_content === divTree.textContent){
        divTree.children.push(temp_divTree);
        // 递归处理子节点\
        if(i < childDivs.length-2) {
          recorverChildren(childDivs, temp_divTree, i+1);
          return  temp_divTree;
        }
      }
    }
    // divTree.children.forEach(childdom => {
    //   if(flag){
    //     divTree.children.push(temp_divTree);
    //       // 递归处理子节点\
    //       if(i < childDivs.length-2) {
    //         recorverChildren(childDivs, temp_divTree, i+1);
    //       }
    //       else{
    //         return temp_divTree;
    //       }
    //   }
    //   else{
    //     if(i < childDivs.length-2) {
    //       if(last_content === divTree.textContent)
    //       {
    //         recorverChildren(childDivs, childdom, i+1);
    //       }
    //     }
    //     else{
    //       return childdom;
    //     }
    //   }
    // });
  }
}


function recordChildren(childDivs, divTree, i) {
  // logToBackground('num'+i);
  const childDiv = childDivs[i];

  const temp_divTree = {
    tagName: childDiv.tagName,
    className: childDiv.className,
    type: findHiddenDivContent(childDiv) === null ? 'answer' : 'ask',
    top: childDiv.offsetTop,
    targetDiv: childDiv,
    textContent: findHiddenDivContent(childDiv) === null ? findFirstPTagContent(childDiv) : findHiddenDivContent(childDiv),
    children: [],
  };
  if(divTree.children.length === 0){
    // logToBackground('divTree.textContent')
    divTree.children.push(temp_divTree);
    // 递归处理子节点\
    if(i < childDivs.length-2) {
      recordChildren(childDivs, temp_divTree, i+1);
    }
    }
}

async function logDivTree() {
  // 通过CSS选择器获取class为“flex flex-col h-full text-sm dark:bg-gray-800”的DIV
  const targetDiv = document.querySelector('.flex.flex-col.text-sm.dark\\:bg-gray-800');

  if (targetDiv) {
    // 调用记录函数并获取树形结构
    logToBackground('找到目标 DIV, 开始记录 DIV 结构...');
    const divTree = await recordDivTree(targetDiv);
    // logToBackground(divTree);
    // 将树形结构保存到 Chrome 扩展的存储中
    chrome.storage.local.set({ divTree }, () => {
      logToBackground('DIV 结构已记录：');
    });
    return true;
  } else {
    logToBackground('目标 DIV 未找到，继续寻找...');
    setTimeout(logDivTree, 1000); // 每隔 1 秒重复执行，可以根据实际情况调整间隔时间
    return false;
  }
}

async function addListener() {
  // 通过CSS选择器获取class为“flex flex-col h-full text-sm dark:bg-gray-800”的DIV
  var buttons = document.querySelectorAll(".dark\\:text-white.disabled\\:text-gray-300.dark\\:disabled\\:text-gray-400");

  if (buttons.length > 0) {
    // 调用记录函数并获取树形结构
    buttons.forEach(function(button) {
      button.addEventListener('click', function() {
          // 这里写你的事件处理函数
      setTimeout(() => {
        logDivTree().then(() => {
          sendMessageToPopup({ status: 'contentsuccess' });
        });
      }, 1000);

      });
    });
    return true;
  } else {
    logToBackground('目标 button 未找到，继续寻找...');
    setTimeout(addListener, 1000); // 每隔 1 秒重复执行，可以根据实际情况调整间隔时间
    return false;
  }
}

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
