const resizer = document.querySelector('.resizer');
const sidebar = document.querySelector('.sidebar');
const content = document.querySelector('.content-file');
const folderContainer = document.querySelector('#folder-container');
const title = document.querySelector("#folder-title");


resizer.addEventListener('mousedown', (e) => {
    e.preventDefault(); 
    const startX = e.clientX;
    const startWidth = sidebar.offsetWidth;

    const mouseMoveHandler = (e) => {
        const newWidth = startWidth + (e.clientX - startX);
        sidebar.style.width = `${newWidth}px`;
    };

    const mouseUpHandler = () => {
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
    };

    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
});

let currentPath = '.';

async function loadContent(path,content) {
  try {
      content.value = '';
      const cont = await window.__TAURI__.invoke('read_file', { path });
      content.value = cont;
      return content;
  } catch (error) {
      console.error('Dosya içeriği alınamadı:', error);
      return 'Hata: İçerik alınamadı';
  }
}



async function loadDirectory(path) {
    try {
        const dirs = await window.__TAURI__.invoke('list_dirs', { path });

        const currentDir = await window.__TAURI__.invoke('get_current_dir');
        console.log('Current Directory:', currentDir);

        const pathSegments = currentDir.split('/');
        const lastSegment = pathSegments[pathSegments.length - 1].toUpperCase();

        if (title) {
            title.textContent = lastSegment;
        } else {
            console.error('Element #folder-title bulunamadı');
        }

        folderContainer.innerHTML = '';

        if (path !== '.') {
            const backDiv = document.createElement('div');
            backDiv.className = 'folder';
            backDiv.innerHTML = '<div class="folder-header">..</div>';
            backDiv.addEventListener('click', () => {
                const parentPath = path.substring(0, path.lastIndexOf('/'));
                loadDirectory(parentPath || '.');
            });
            folderContainer.appendChild(backDiv);
        }

        dirs.forEach(dir => {
            const folderDiv = document.createElement('div');
            folderDiv.className = 'folder';

            const folderHeader = document.createElement('div');
            folderHeader.className = 'folder-header';
            folderHeader.textContent = `${dir.is_dir === 1 ? '>' : ''} ${dir.name}`;
            folderDiv.appendChild(folderHeader);

            const fileList = document.createElement('ul');
            fileList.className = 'file-list';
            folderDiv.appendChild(fileList);


            if (dir.is_dir === 1) {
                folderHeader.addEventListener('click', () => {
                    const isVisible = fileList.style.display === 'block';
                    fileList.style.display = isVisible ? 'none' : 'block';

                    if (!isVisible) {
                        currentPath = dir.path;
                        loadDirectory(dir.path);
                    }
                });
            } else {
                const li = document.createElement('li');
                li.textContent = `${dir.name} (${dir.size} bytes)`;
                fileList.appendChild(li);
            }

            folderContainer.appendChild(folderDiv);
            folderDiv.addEventListener("click", () => {
              if(dir.is_dir === 0) {
                 const con = loadContent(dir.path,content);
              }
            });
        });
    } catch (err) {
        console.error('Dosyalar alınamadı:', err);
    }
}

async function loadShortcuts() {
    try {
        const shortcuts = await window.__TAURI__.invoke('get_shortcuts');
        console.log('Shortcuts:', shortcuts);

        if (shortcuts && shortcuts.toggle_sidebar) {
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.key === shortcuts.toggle_sidebar) {
                    const isVisible = sidebar.style.display !== 'none';
                    sidebar.style.display = isVisible ? 'none' : 'block';
                    content.style.flex = isVisible ? '1' : '0';
                }
            });
        } else {
            console.error('Shortcuts yapılandırması geçerli değil');
        }
    } catch (err) {
        console.error('Kısayollar yüklenemedi:', err);
    }
}


window.addEventListener('DOMContentLoaded', () => {
    loadDirectory(currentPath);
    loadShortcuts();
});
