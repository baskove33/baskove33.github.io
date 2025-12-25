/**
 * АВТОМАТИЗАЦИЯ
 * Скрипт заходит на страницу со всеми кейсами, считывает оттуда проекты
 * и показывает их в блоке "Смотрите также".
 */

// !!! ВАЖНО: Убедись, что файл на GitHub называется именно так (регистр важен!)
// all_cases.html и All_Cases.html — это разные файлы.
const CASES_PAGE_URL = 'all_cases.html'; 

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('related-projects');
    
    // Если на странице нет контейнера (мы не внутри кейса), ничего не делаем
    if (!container) return;

    // Показываем статус загрузки (чтобы не было пустоты, пока грузится)
    // container.innerHTML = '<p class="text-white/50 text-xs animate-pulse">Загрузка проектов...</p>';

    fetch(CASES_PAGE_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Ошибка загрузки: Файл "${CASES_PAGE_URL}" не найден (код ${response.status}). Проверь имя файла.`);
            }
            return response.text();
        })
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Ищем карточки. Если у тебя в all_cases.html другой класс (не .project-tile), скрипт не найдет их.
            const tiles = doc.querySelectorAll('.project-tile');
            
            if (tiles.length === 0) {
                console.warn('Скрипт загрузил файл, но не нашел ни одного элемента с классом .project-tile');
                // container.innerHTML = '<p class="text-red-400 text-xs">Ошибка: В файле all_cases.html не найдены блоки с классом .project-tile</p>';
                return;
            }

            const projects = [];

            tiles.forEach(tile => {
                const link = tile.getAttribute('href');
                const img = tile.querySelector('img')?.src;
                
                // Проверяем, есть ли заголовок с нужным классом
                const titleEl = tile.querySelector('.text-xl'); 
                const categoryEl = tile.querySelector('.text-xs');

                if (link && titleEl) {
                    projects.push({ 
                        title: titleEl.innerText.trim(), 
                        category: categoryEl ? categoryEl.innerText.trim() : 'Design', 
                        link, 
                        img 
                    });
                }
            });

            renderRelatedProjects(projects, container);
        })
        .catch(err => {
            console.error(err);
            // Выводим ошибку прямо на экран, чтобы ты увидел
            container.innerHTML = `<p class="text-red-500 text-sm border border-red-500 p-2 inline-block rounded">${err.message}</p>`;
        });
});

function renderRelatedProjects(allProjects, container) {
    const currentPath = window.location.pathname;
    const currentFile = currentPath.substring(currentPath.lastIndexOf('/') + 1) || currentPath;

    // Фильтруем: убираем текущий проект
    const projectsToShow = allProjects.filter(p => !currentFile.includes(p.link));

    const limit = 5;
    const finalProjects = projectsToShow.slice(0, limit);

    container.innerHTML = ''; 

    if (finalProjects.length === 0) {
        // Если проектов нет (или фильтр убрал всё), пишем об этом
        container.innerHTML = '<p class="text-white/30 text-sm">Нет других проектов.</p>';
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
