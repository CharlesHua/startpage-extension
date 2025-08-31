chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create(
      {id: 'saveToStartpage', title: '保存到起始页', contexts: ['page']});
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'saveToStartpage') {
    const site = {name: tab.title, url: tab.url, group: '未分组'};
    chrome.storage.local.get({sites: {}}, data => {
      const sites = data.sites;
      if (!sites[site.group]) {
        sites[site.group] = [];
      }
      sites[site.group].push(site);
      chrome.storage.local.set({sites});
    });
  }
});

