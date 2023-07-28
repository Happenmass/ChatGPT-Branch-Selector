const OPENAI_ORIGIN = 'https://chat.openai.com';

chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (!tab.url) return;
  const url = new URL(tab.url);
  // Enables the side panel on google.com
  if (url.origin === OPENAI_ORIGIN) {
    await chrome.sidePanel.setOptions({
      tabId,
      path: 'popup.html',
      enabled: true
    });
  } else {
    // Disables the side panel on all other sites
    await chrome.sidePanel.setOptions({
      tabId,
      enabled: false
    });
  }
});

// Allows users to open the side panel by clicking on the action toolbar icon
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));


chrome.runtime.onInstalled.addListener(() => {
console.log('插件已安装');

// 设置默认的插件存储数据
chrome.storage.local.set({
    defaultSetting: true,
});

// 执行其他一次性操作，只在插件安装时执行一次
console.log('插件已启动');
});

// 监听来自内容脚本的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'showNotification') {
      // 在后台脚本中显示通知
      showNotification(message.title, message.message);
  }
  else if (message.action === 'log') {
      console.log('Message from content script:', message.message);
  }
  else if (message.action === 'performScroll') {
    console.log('performScroll');
    // 向当前活动标签页发送滚动指令，并传递滚动距离
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: scrollFunction
      });
    });
  }
});

// 显示通知的函数
function showNotification(title, message) {
chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon.png',
    title: title,
    message: message,
});
}

function scrollToBottom() {
  console.log('scrollToBottom');
  window.scrollTo(0, document.body.scrollHeight);
}