document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('addGroupBtn').addEventListener('click', addGroup);
  document.getElementById('deleteSelectedBtn')
      .addEventListener('click', deleteSelected);
  document.getElementById('moveSelectedBtn')
      .addEventListener('click', moveSelected);
  renderGroups();
});

/** 添加分组 */
function addGroup() {
  const input = document.getElementById('newGroupName');
  const name = input.value.trim();
  if (!name) {
    alert('请输入分组名称');
    return;
  }

  chrome.storage.local.get({sites: {}}, (data) => {
    const sites = data.sites;
    if (!sites[name]) {
      sites[name] = [];
      chrome.storage.local.set({sites}, () => {
        input.value = '';
        renderGroups();
      });
    } else {
      alert('该分组已存在');
    }
  });
}

/** 渲染分组和网址 */
function renderGroups() {
  chrome.storage.local.get({sites: {}}, (data) => {
    const container = document.getElementById('groupsContainer');
    container.innerHTML = '';

    // 渲染所有分组
    Object.keys(data.sites).forEach(group => {
      const groupDiv = document.createElement('div');
      groupDiv.className = 'group';

      const title = document.createElement('h2');
      title.textContent = group;
      groupDiv.appendChild(title);

      const list = document.createElement('ul');
      data.sites[group].forEach((site, index) => {
        const li = document.createElement('li');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'site-checkbox';
        checkbox.dataset.group = group;
        checkbox.dataset.index = index;
        li.appendChild(checkbox);

        const a = document.createElement('a');
        a.href = site.url;
        a.textContent = site.name;
        a.target = '_blank';
        li.appendChild(a);

        list.appendChild(li);
      });

      // 添加网址输入框
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = '网站名称,网址';
      input.id = `addSiteInput-${group}`;
      groupDiv.appendChild(input);

      const addBtn = document.createElement('button');
      addBtn.textContent = '添加网址';
      addBtn.className = 'btn';
      addBtn.addEventListener('click', () => addSite(group));
      groupDiv.appendChild(addBtn);

      groupDiv.appendChild(list);
      container.appendChild(groupDiv);
    });

    // 更新下拉菜单
    const select = document.getElementById('moveGroupSelect');
    select.innerHTML =
        `<option value="">选择分组</option><option value="__new__">➕ 新建分组</option>`;
    Object.keys(data.sites).forEach(group => {
      const option = document.createElement('option');
      option.value = group;
      option.textContent = group;
      select.appendChild(option);
    });
  });
}

/** 添加网址 */
function addSite(group) {
  const input = document.getElementById(`addSiteInput-${group}`);
  const value = input.value.trim();
  if (!value) return;
  const [name, url] = value.split(',');
  if (!url) {
    alert('格式错误，请输入：网站名称,网址');
    return;
  }

  chrome.storage.local.get({sites: {}}, (data) => {
    data.sites[group].push({name: name.trim(), url: url.trim()});
    chrome.storage.local.set({sites: data.sites}, () => {
      input.value = '';
      renderGroups();
    });
  });
}

/** 删除选中网址 */
function deleteSelected() {
  chrome.storage.local.get({sites: {}}, (data) => {
    const checkboxes = document.querySelectorAll('.site-checkbox:checked');
    if (checkboxes.length === 0) {
      alert('请先选择要删除的网址');
      return;
    }

    checkboxes.forEach(cb => {
      const group = cb.dataset.group;
      const index = parseInt(cb.dataset.index, 10);
      if (data.sites[group]) {
        data.sites[group][index] = null;  // 标记删除
      }
    });

    // 清理 null
    for (let g in data.sites) {
      data.sites[g] = data.sites[g].filter(s => s !== null);
    }

    chrome.storage.local.set({sites: data.sites}, renderGroups);
  });
}

/** 移动选中网址 */
function moveSelected() {
  const select = document.getElementById('moveGroupSelect');
  let choice = select.value;

  if (!choice) {
    alert('请选择目标分组');
    return;
  }

  chrome.storage.local.get({sites: {}}, (data) => {
    if (choice === '__new__') {
      choice = prompt('请输入新分组名称');
      if (!choice) return;
      if (!data.sites[choice]) {
        data.sites[choice] = [];
      }
    }

    const checkboxes = document.querySelectorAll('.site-checkbox:checked');
    if (checkboxes.length === 0) {
      alert('请先选择要移动的网址');
      return;
    }

    let movedSites = [];
    checkboxes.forEach(cb => {
      const group = cb.dataset.group;
      const index = parseInt(cb.dataset.index, 10);
      if (data.sites[group] && data.sites[group][index]) {
        movedSites.push(data.sites[group][index]);
        data.sites[group][index] = null;  // 删除
      }
    });

    // 清理 null
    for (let g in data.sites) {
      data.sites[g] = data.sites[g].filter(s => s !== null);
    }

    // 移动到目标分组
    data.sites[choice].push(...movedSites);

    chrome.storage.local.set({sites: data.sites}, renderGroups);
  });
}


function renderGroups() {
  chrome.storage.local.get({sites: {}}, (data) => {
    const container = document.getElementById('groupsContainer');
    container.innerHTML = '';

    Object.keys(data.sites).forEach(group => {
      const groupDiv = document.createElement('div');
      groupDiv.className = 'group';

      // 标题和删除按钮
      const titleDiv = document.createElement('div');
      titleDiv.style.display = 'flex';
      titleDiv.style.alignItems = 'center';
      titleDiv.style.justifyContent = 'space-between';

      const title = document.createElement('h2');
      title.textContent = group;
      titleDiv.appendChild(title);

      const delGroupBtn = document.createElement('button');
      delGroupBtn.textContent = '删除分组';
      delGroupBtn.className = 'btn danger';
      delGroupBtn.addEventListener('click', () => deleteGroup(group));
      titleDiv.appendChild(delGroupBtn);

      groupDiv.appendChild(titleDiv);

      // 网址列表
      const list = document.createElement('ul');
      data.sites[group].forEach((site, index) => {
        const li = document.createElement('li');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'site-checkbox';
        checkbox.dataset.group = group;
        checkbox.dataset.index = index;
        li.appendChild(checkbox);

        const a = document.createElement('a');
        a.href = site.url;
        a.textContent = site.name;
        a.target = '_blank';
        li.appendChild(a);

        list.appendChild(li);
      });

      // 添加网址输入框
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = '网站名称,网址';
      input.id = `addSiteInput-${group}`;
      groupDiv.appendChild(input);

      const addBtn = document.createElement('button');
      addBtn.textContent = '添加网址';
      addBtn.className = 'btn';
      addBtn.addEventListener('click', () => addSite(group));
      groupDiv.appendChild(addBtn);

      groupDiv.appendChild(list);
      container.appendChild(groupDiv);
    });

    // 更新下拉菜单
    const select = document.getElementById('moveGroupSelect');
    select.innerHTML =
        `<option value="">选择分组</option><option value="__new__">➕ 新建分组</option>`;
    Object.keys(data.sites).forEach(group => {
      const option = document.createElement('option');
      option.value = group;
      option.textContent = group;
      select.appendChild(option);
    });
  });
}

/** 删除分组 */
function deleteGroup(group) {
  chrome.storage.local.get({sites: {}}, (data) => {
    if (!data.sites[group]) return;

    if (data.sites[group].length === 0) {
      // 空分组直接删除
      delete data.sites[group];
    } else {
      // 非空分组，把网站移动到未分组
      if (!data.sites['未分组']) data.sites['未分组'] = [];
      data.sites['未分组'].push(...data.sites[group]);
      delete data.sites[group];
    }

    chrome.storage.local.set({sites: data.sites}, renderGroups);
  });
}
