/**
 * СКРИПТ АВТОМАТИЧЕСКОЙ ПОДГРУЗКИ КЕЙСОВ
 * * Работает так:
 * 1. Идет на указанную страницу со всеми работами.
 * 2. Забирает оттуда все кейсы.
 * 3. Вставляет их в текущую страницу в блок <div id="related-projects">
 */

// !!! ВНИМАНИЕ: СЮДА ВПИШИ ТОЧНОЕ НАЗВАНИЕ ФАЙЛА С ТВОИМИ КЕЙСАМИ !!!
// Например: 'all-cases.html' или 'portfolio.html' или 'works.html'
const ALL_CASES_PAGE = 'all-cases.html'; 

document.addEventListener('DOMContentLoaded', () => {
    // Ищем контейнер "Смотрите также" на текущей странице
    const relatedContainer = document.getElementById('related-projects');
    
    // Если такого контейнера нет (значит мы не внутри кейса), скрипт останавливается
    if (!relatedContainer) return; 

    // 1. Загружаем код страницы со всеми кейсами
    fetch(ALL_CASES_PAGE)
        .then(response => {
            if (!response.ok) throw new Error(`Не могу найти файл: ${ALL_CASES_PAGE}`);
            return response.text();
        })
        .then(html => {
            // 2. Парсим (читаем) полученный HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // 3. Собираем все карточки (.project-tile) со страницы всех кейсов
            const tiles = doc.querySelectorAll('.project-tile');
            const projects = [];

            tiles.forEach(tile => {
                // Вытаскиваем данные из верстки
                const link = tile.getAttribute('href');
                const img = tile.querySelector('img')?.src;
                const title = tile.querySelector('.text-xl')?.innerText.trim(); // Твой класс заголовка
                const category = tile.querySelector('.text-xs')?.innerText.trim(); // Твой класс категории

                if (link && title) {
                    projects.push({ link, img, title, category });
                }
            });

            // 4. Запускаем рендер (отрисовку)
            renderRelatedProjects(projects, relatedContainer);
        })
        .catch(err => {
            console.error('Ошибка подгрузки проектов:', err);
        });
});

function renderRelatedProjects(allProjects, container) {
    // Определяем имя текущего файла, чтобы не показывать ссылку на самого себя
    const currentPath = window.location.pathname;
    const currentFile = currentPath.substring(currentPath.lastIndexOf('/') + 1);

    // Убираем из списка текущий проект
    const otherProjects = allProjects.filter(p => !p.link.includes(currentFile));

    // Берем первые 5 штук
    const projectsToShow = otherProjects.slice(0, 5);

    container.innerHTML = ''; // Чистим контейнер перед вставкой

    projectsToShow.forEach(project => {
        // Верстка карточки для футера
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

    // Делаем плавное появление, если используешь анимации
    setTimeout(() => {
        container.querySelectorAll('.related-project-card').forEach(el => el.classList.add('opacity-100'));
    }, 100);
}
