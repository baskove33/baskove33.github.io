/**
 * ЕДИНЫЙ ЦЕНТР УПРАВЛЕНИЯ (Dynamic Loader)
 * 1. Загружает проекты в "Смотрите также" со страницы all_cases.html.
 * 2. Управляет кнопкой "Назад" в шапке (текст, действие и фикс зависания).
 */

const CONFIG = {
    // Укажи здесь точное имя файла, где лежит список всех работ
    sourceFile: 'all_cases.html', 
    
    // Настройки кнопки в шапке
    backButtonText: '← Назад',
    
    // ВАЖНО: true = кнопка работает как "История браузера".
    useBrowserBack: true,         
    backButtonLink: 'index.html' // Резервная ссылка
};

document.addEventListener('DOMContentLoaded', () => {
    setupHeaderNavigation(); // Настраиваем кнопку в шапке
    initRelatedProjects();   // Подгружаем проекты
});

// === ФИКС ЗАВИСАНИЯ ПРЕЛОАДЕРА (BFCache Fix) ===
// Эта магия убирает черный экран, если ты вернулся на страницу кнопкой "Назад"
window.addEventListener('pageshow', (event) => {
    // event.persisted означает, что страница загружена из кэша (истории)
    // Но мы на всякий случай убираем прелоадер всегда при показе страницы
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        setTimeout(() => {
            preloader.style.zIndex = '-1';
            preloader.style.pointerEvents = 'none';
        }, 300);
    }
});

// === ЛОГИКА КНОПКИ В ШАПКЕ ===
function setupHeaderNavigation() {
    const navLink = document.querySelector('header nav a');
    
    if (navLink) {
        if (CONFIG.useBrowserBack) {
            // Клонируем кнопку, чтобы УДАЛИТЬ все старые слушатели (в том числе прелоадер)
            // Это гарантирует, что при нажатии "Назад" текущая страница не начнет затемняться
            const newLink = navLink.cloneNode(true);
            navLink.parentNode.replaceChild(newLink, navLink);
            
            newLink.textContent = CONFIG.backButtonText;
            newLink.href = '#'; 
            
            newLink.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation(); // Останавливаем любые другие скрипты
                
                if (window.history.length > 1) {
                    window.history.back();
                } else {
                    // Если истории нет, идем на главную
                    window.location.href = CONFIG.backButtonLink;
                }
            });
        } else {
            navLink.textContent = CONFIG.backButtonText;
            navLink.href = CONFIG.backButtonLink;
        }
    }
}

// === ЛОГИКА ПОДГРУЗКИ ПРОЕКТОВ ===
function initRelatedProjects() {
    const container = document.getElementById('related-projects');
    if (!container) return; 

    fetch(CONFIG.sourceFile)
        .then(response => {
            if (!response.ok) throw new Error(`Файл ${CONFIG.sourceFile} не найден`);
            return response.text();
        })
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const tiles = doc.querySelectorAll('.project-tile');
            const projects = [];

            tiles.forEach(tile => {
                const link = tile.getAttribute('href');
                const img = tile.querySelector('img')?.src;
                const title = tile.querySelector('.text-xl')?.innerText.trim();
                const category = tile.querySelector('.text-xs')?.innerText.trim();

                if (link && title) {
                    projects.push({ title, category, link, img });
                }
            });

            renderProjects(projects, container);
        })
        .catch(err => {
            console.error('DynamicLoader Error:', err);
            container.innerHTML = `<div class="col-span-full text-red-500 text-xs border border-red-500/30 p-4 rounded">
                Ошибка: Не удалось загрузить проекты. Проверь имя файла <b>${CONFIG.sourceFile}</b> и запусти через сервер.
            </div>`;
        });
}

function renderProjects(allProjects, container) {
    const currentPath = window.location.pathname;
    const currentFile = currentPath.substring(currentPath.lastIndexOf('/') + 1) || currentPath;

    const projectsToShow = allProjects.filter(p => !currentFile.includes(p.link));
    const finalProjects = projectsToShow.slice(0, 5);

    container.innerHTML = ''; 

    if (finalProjects.length === 0) {
        container.innerHTML = '<div class="col-span-full text-white/30 text-sm">Нет других проектов.</div>';
        return;
    }

    finalProjects.forEach(project => {
        const html = `
            <a href="${project.link}" class="nav-link related-project-card block bg-[#111] overflow-hidden shadow-lg transition hover:bg-[#1a1a1a] group h-full border border-white/5 hover:border-white/20">
                <div class="overflow-hidden h-[150px] w-full relative">
                    <img src="${project.img}" alt="${project.title}" class="w-full h-full object-cover transition duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100">
                </div>
                <div class="p-4 text-left">
                    <span class="text-lg font-medium tracking-custom-tight text-white block mb-1 group-hover:text-white transition">${project.title}</span>
                    <p class="text-xs text-white/50 uppercase tracking-widest text-[10px]">${project.category}</p>
                </div>
            </a>
        `;
        container.insertAdjacentHTML('beforeend', html);
    });

    setTimeout(() => {
        container.querySelectorAll('.related-project-card').forEach(el => el.classList.add('opacity-100'));
    }, 100);
}
