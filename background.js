// background.js

// 当插件安装时执行的操作
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
  chrome.action.onClicked.addListener(tab => {
    // 创建悬浮窗口
    createFloatingWindow();
  });
  
  // 创建悬浮窗口的函数
  function createFloatingWindow() {
    chrome.windows.create({
      type: 'popup',
      url: 'popup.html',
      width: 400,
      height: 300,
      focused: true,
      left: 0,
      top: 0
    });
  }