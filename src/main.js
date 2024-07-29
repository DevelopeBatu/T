const resizer = document.querySelector('.resizer');
const sidebar = document.querySelector('.sidebar');
const content = document.querySelector('.content');
const folderContainer = document.querySelector('#folder-container');
const title = document.querySelector("#folder-title");

// Kenar çubuğu için sürükleme işlevi
resizer.addEventListener('mousedown', (e) => {
    e.preventDefault(); // Seçimi engellemek için

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

// Belirli bir tuşa basıldığında kenar çubuğunu gizle veya göster
document.addEventListener('keydown', (e) => {
    // Ctrl + M tuş kombinasyonu
    if (e.ctrlKey && e.key === 'm') {
        const isVisible = sidebar.style.display !== 'none';
        sidebar.style.display = isVisible ? 'none' : 'block';
        content.style.flex = isVisible ? '1' : '0'; // İçerik alanını genişletmek için
    }
});

let currentPath = '.';

async function loadDirectory(path) {
    try {
        // Klasör listesini al
        const dirs = await window.__TAURI__.invoke('list_dirs', { path });

        // Başlık güncelle
        const currentDir = await window.__TAURI__.invoke('get_current_dir');
        console.log('Current Directory:', currentDir);

        // Son dizini al ve büyük harfe çevir
        const pathSegments = currentDir.split('/');
        const lastSegment = pathSegments[pathSegments.length - 1].toUpperCase();

        // Element var mı kontrol et
        if (title) {
            title.textContent = lastSegment;
        } else {
            console.error('Element #folder-title bulunamadı');
        }

        folderContainer.innerHTML = ''; // Eski içerikleri temizle

        // Klasörlerin geri dönme işlevi
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
                // Klasör, alt dosyalar veya içeriği açmak için
                folderHeader.addEventListener('click', () => {
                    const isVisible = fileList.style.display === 'block';
                    fileList.style.display = isVisible ? 'none' : 'block';

                    if (!isVisible) {
                        // Klasör açıldığında içeriği yükle
                        currentPath = dir.path;
                        loadDirectory(dir.path);
                    }
                });
            } else {
                // Dosya, dosya listesini oluştur
                const li = document.createElement('li');
                li.textContent = `${dir.name} (${dir.size} bytes)`;
                fileList.appendChild(li);
            }

            folderContainer.appendChild(folderDiv);
        });
    } catch (err) {
        console.error('Dosyalar alınamadı:', err);
    }
}

// Başlangıçta ana dizini yükle
window.addEventListener('DOMContentLoaded', () => {
    loadDirectory(currentPath);
});
