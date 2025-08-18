class MathTutorApp {
    constructor() {
        this.data = null;
        this.currentSection = 'home';
        this.currentCategory = null;
        this.currentSubcategory = null;
        this.currentTaskIndex = 0;
        this.userProgress = this.loadProgress();
        this.userStats = this.loadStats();
        this.motivationalQuotes = [
            { text: "Математика - это язык, на котором написана книга природы.", author: "Галилео Галилей" },
            { text: "Математика - царица наук, а арифметика - царица математики.", author: "Карл Фридрих Гаусс" },
            { text: "Математику нельзя изучать, наблюдая, как это делает кто-то другой.", author: "Неизвестен" },
            { text: "В математике нет символов для неясных мыслей.", author: "Анри Пуанкаре" },
            { text: "Математика - это искусство называть разные вещи одним именем.", author: "Анри Пуанкаре" },
            { text: "Чистая математика - это такой предмет, где мы не знаем, о чем говорим, и не знаем, истинно ли то, что мы говорим.", author: "Бертран Рассел" },
            { text: "Математика требует малого: только чтобы ее выучили.", author: "Эмиль Борель" },
            { text: "Кто хочет решить вопросы естественных наук без математики, тот ставит неразрешимую задачу.", author: "Михаил Ломоносов" },
            { text: "Математика - это гимнастика ума.", author: "Александр Суворов" },
            { text: "Предмет математики настолько серьезен, что нельзя упускать случая делать его немного занимательным.", author: "Блез Паскаль" }
        ];
        this.achievementsList = [
            { id: 'first_steps', name: 'Первые шаги', icon: '🚀', description: 'Решить первую задачу', condition: () => this.userStats.totalSolved > 0 },
            { id: 'streak_3', name: 'Постоянство', icon: '🔥', description: '3 дня подряд', condition: () => this.userStats.currentStreak >= 3 },
            { id: 'streak_7', name: 'Неделя знаний', icon: '📚', description: '7 дней подряд', condition: () => this.userStats.currentStreak >= 7 },
            { id: 'tasks_10', name: 'Десяток', icon: '💪', description: 'Решить 10 задач', condition: () => this.userStats.totalSolved >= 10 },
            { id: 'tasks_50', name: 'Полусотня', icon: '⭐', description: 'Решить 50 задач', condition: () => this.userStats.totalSolved >= 50 },
            { id: 'tasks_100', name: 'Сотня', icon: '🏆', description: 'Решить 100 задач', condition: () => this.userStats.totalSolved >= 100 },
            { id: 'perfect_category', name: 'Совершенство', icon: '💎', description: 'Завершить категорию на 100%', condition: () => this.hasPerfectCategory() },
            { id: 'math_wizard', name: 'Мастер математики', icon: '🧙‍♂️', description: 'Решить задачи из всех категорий', condition: () => this.hasTriedAllCategories() }
        ];
        this.init();
    }

    async init() {
        this.showLoadingOverlay();
        try {
            await this.loadData();
            this.setupEventListeners();
            this.showSection(this.currentSection);
            this.updateUI();
            this.startDailyQuoteRotation();
            this.updateAchievements();
            this.calculateRecommendations();
            this.showNotification('Данные успешно загружены!', 'success');
        } catch (error) {
            console.error('Ошибка инициализации:', error);
            this.showError('Ошибка загрузки данных. Пожалуйста, обновите страницу.');
            this.setupBasicEventListeners();
        } finally {
            this.hideLoadingOverlay();
        }
    }

    async loadData() {
        try {
            const response = await fetch('./data/tasks.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.data = await response.json();
            this.updateGlobalStats();
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            throw error;
        }
    }

    setupBasicEventListeners() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.showSection(section);
            });
        });

        document.querySelector('.mobile-menu-toggle')?.addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.handleEscapeKey();
            }
        });

        window.addEventListener('scroll', () => {
            this.handleScroll();
        });
    }

    setupEventListeners() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.showSection(section);
            });
        });

        document.querySelectorAll('[data-action="start-learning"]').forEach(btn => {
            btn.addEventListener('click', () => this.showSection('categories'));
        });

        document.querySelectorAll('[data-action="view-categories"]').forEach(btn => {
            btn.addEventListener('click', () => this.showSection('categories'));
        });

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterCategories(e.target.getAttribute('data-filter'));
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        document.getElementById('back-to-categories')?.addEventListener('click', () => {
            this.showCategoriesView();
        });

        document.getElementById('back-to-subcategories')?.addEventListener('click', () => {
            this.showCategoryDetail(this.currentCategory);
        });

        document.getElementById('back-to-tasks')?.addEventListener('click', () => {
            this.showSubcategoryDetail(this.currentCategory, this.currentSubcategory);
        });

        document.getElementById('check-answer')?.addEventListener('click', () => {
            this.checkAnswer();
        });

        document.getElementById('show-solution')?.addEventListener('click', () => {
            this.showSolution();
        });

        document.getElementById('self-check')?.addEventListener('click', () => {
            this.showSelfCheckMode();
        });

        document.getElementById('mark-understood')?.addEventListener('click', () => {
            this.markTaskAsUnderstood();
        });

        document.getElementById('mark-need-practice')?.addEventListener('click', () => {
            this.markTaskAsNeedsPractice();
        });

        document.getElementById('mark-difficult')?.addEventListener('click', () => {
            this.markTaskAsDifficult();
        });

        document.getElementById('prev-task')?.addEventListener('click', () => {
            this.navigateTask(-1);
        });

        document.getElementById('next-task')?.addEventListener('click', () => {
            this.navigateTask(1);
        });

        document.getElementById('contact-form')?.addEventListener('submit', (e) => {
            this.handleContactForm(e);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.handleEscapeKey();
            }
        });

        window.addEventListener('scroll', () => {
            this.handleScroll();
        });

        document.querySelector('.mobile-menu-toggle')?.addEventListener('click', () => {
            this.toggleMobileMenu();
        });
    }

    showSection(sectionName) {
        if ((sectionName === 'categories' || sectionName === 'progress') && !this.data) {
            this.showNotification('Данные еще загружаются. Пожалуйста, подождите...', 'warning');
            return;
        }

        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`)?.classList.add('active');

        document.querySelectorAll('.main-content > section').forEach(section => {
            section.style.display = 'none';
        });
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.style.display = 'block';
        }

        this.currentSection = sectionName;

        if (sectionName === 'categories') {
            this.showCategoriesView();
        } else if (sectionName === 'progress') {
            this.updateProgressView();
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    showCategoriesView() {
        document.getElementById('categories-container').style.display = 'grid';
        document.getElementById('category-detail').style.display = 'none';
        document.getElementById('subcategory-detail').style.display = 'none';
        document.getElementById('task-detail').style.display = 'none';
        this.renderCategories();
    }

    renderCategories(filter = 'all') {
        const container = document.getElementById('categories-container');
        if (!container || !this.data) return;

        let filteredCategories = this.data.categories;

        if (filter !== 'all') {
            filteredCategories = this.data.categories.filter(category => {
                const categoryName = category.categoryName.toLowerCase();
                switch (filter) {
                    case 'algebra':
                        return categoryName.includes('алгебра');
                    case 'geometry':
                        return categoryName.includes('геометрия');
                    case 'exam':
                        return categoryName.includes('огэ') || categoryName.includes('егэ') || categoryName.includes('экзамен');
                    default:
                        return true;
                }
            });
        }

        container.innerHTML = filteredCategories.map(category => {
            const progress = this.getCategoryProgress(category.categoryId);
            const totalTasks = this.getTotalTasksInCategory(category);
            
            return `
                <div class="category-card" data-category-id="${category.categoryId}">
                    <div class="category-icon">${this.getCategoryIcon(category.categoryName)}</div>
                    <h3 class="category-title">${category.categoryName}</h3>
                    <p class="category-description">${category.description || 'Изучение основных понятий и методов решения задач'}</p>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <div class="category-stats">
                        <span class="tasks-count">${totalTasks} задач</span>
                        <span class="difficulty-badge ${this.getCategoryDifficulty(category)}">${this.getDifficultyText(this.getCategoryDifficulty(category))}</span>
                    </div>
                </div>
            `;
        }).join('');

        container.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                const categoryId = card.getAttribute('data-category-id');
                const category = this.data.categories.find(c => c.categoryId === categoryId);
                this.showCategoryDetail(category);
            });
        });
    }

    showCategoryDetail(category) {
        this.currentCategory = category;
        document.getElementById('categories-container').style.display = 'none';
        document.getElementById('category-detail').style.display = 'block';
        document.getElementById('subcategory-detail').style.display = 'none';
        document.getElementById('task-detail').style.display = 'none';

        document.getElementById('category-title').textContent = category.categoryName;
        document.getElementById('category-description').textContent = category.description || 'Подробное изучение темы с практическими заданиями';

        const subcategoriesContainer = document.getElementById('subcategories-container');
        subcategoriesContainer.innerHTML = category.subcategories.map(subcategory => {
            const progress = this.getSubcategoryProgress(category.categoryId, subcategory.subcategoryId);
            const solvedTasks = this.getSolvedTasksCount(category.categoryId, subcategory.subcategoryId);
            const totalTasks = subcategory.tasks.filter(task => task.isActual).length;

            return `
                <div class="subcategory-card" data-subcategory-id="${subcategory.subcategoryId}">
                    <h4>${subcategory.subcategoryName}</h4>
                    <p>${subcategory.description || 'Практические задания для закрепления материала'}</p>
                    <div class="subcategory-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <span class="progress-text">${solvedTasks}/${totalTasks} задач решено</span>
                    </div>
                </div>
            `;
        }).join('');

        subcategoriesContainer.querySelectorAll('.subcategory-card').forEach(card => {
            card.addEventListener('click', () => {
                const subcategoryId = card.getAttribute('data-subcategory-id');
                const subcategory = category.subcategories.find(s => s.subcategoryId === subcategoryId);
                this.showSubcategoryDetail(category, subcategory);
            });
        });
    }

    showSubcategoryDetail(category, subcategory) {
        this.currentSubcategory = subcategory;
        document.getElementById('category-detail').style.display = 'none';
        document.getElementById('subcategory-detail').style.display = 'block';
        document.getElementById('task-detail').style.display = 'none';

        document.getElementById('subcategory-title').textContent = subcategory.subcategoryName;
        document.getElementById('subcategory-description').textContent = subcategory.description || 'Решение практических задач по теме';

        const solvedTasks = this.getSolvedTasksCount(category.categoryId, subcategory.subcategoryId);
        const totalTasks = subcategory.tasks.filter(task => task.isActual).length;
        const progress = totalTasks > 0 ? (solvedTasks / totalTasks) * 100 : 0;

        document.getElementById('subcategory-progress-fill').style.width = `${progress}%`;
        document.getElementById('subcategory-progress-text').textContent = `${solvedTasks}/${totalTasks} задач решено`;

        const tasksContainer = document.getElementById('tasks-container');
        tasksContainer.innerHTML = subcategory.tasks
            .filter(task => task.isActual)
            .map((task, index) => {
                const isSolved = this.isTaskSolved(category.categoryId, subcategory.subcategoryId, task.id);
                const preview = this.stripHTML(task.problemText).substring(0, 150) + '...';

                return `
                    <div class="task-card ${isSolved ? 'solved' : ''}" data-task-index="${index}">
                        <div class="task-number">Задача ${index + 1}</div>
                        <div class="task-preview">${preview}</div>
                    </div>
                `;
            }).join('');

        tasksContainer.querySelectorAll('.task-card').forEach(card => {
            card.addEventListener('click', () => {
                const taskIndex = parseInt(card.getAttribute('data-task-index'));
                this.showTaskDetail(category, subcategory, taskIndex);
            });
        });
    }

    showTaskDetail(category, subcategory, taskIndex) {
        this.currentTaskIndex = taskIndex;
        document.getElementById('subcategory-detail').style.display = 'none';
        document.getElementById('task-detail').style.display = 'block';

        const tasks = subcategory.tasks.filter(task => task.isActual);
        const task = tasks[taskIndex];

        document.getElementById('task-number').textContent = `Задача ${taskIndex + 1} из ${tasks.length}`;
        document.getElementById('task-difficulty').textContent = this.getTaskDifficulty(task);
        document.getElementById('problem-text').innerHTML = task.problemText;

        document.getElementById('user-answer').value = '';
        document.getElementById('answer-feedback').style.display = 'none';
        document.getElementById('task-solution').style.display = 'none';

        const prevBtn = document.getElementById('prev-task');
        const nextBtn = document.getElementById('next-task');
        
        prevBtn.disabled = taskIndex === 0;
        nextBtn.disabled = taskIndex === tasks.length - 1;

        this.updateTaskNavigation(category, subcategory, tasks);
    }

    checkAnswer() {
        const userAnswer = document.getElementById('user-answer').value.trim();
        const task = this.getCurrentTask();
        
        if (!userAnswer) {
            this.showAnswerFeedback('Пожалуйста, введите ваш ответ', 'warning');
            return;
        }

        const isCorrect = this.validateAnswer(userAnswer, task.correctAnswer);
        
        if (isCorrect) {
            this.showAnswerFeedback('Правильно! Отличная работа!', 'correct');
            this.markTaskAsSolved(task);
            this.updateUserStats();
            this.playSuccessAnimation();
        } else {
            this.showAnswerFeedback('Ответ неверный. Попробуйте еще раз или посмотрите решение.', 'incorrect');
            this.playShakeAnimation();
        }
    }

    validateAnswer(userAnswer, correctAnswer) {
        if (!correctAnswer) return false;
        
        const normalizeAnswer = (answer) => {
            return answer.toString().toLowerCase()
                .replace(/\s+/g, '')
                .replace(/[.,]/g, '.')
                .replace(/[()]/g, '');
        };

        const normalizedUser = normalizeAnswer(userAnswer);
        const normalizedCorrect = normalizeAnswer(correctAnswer);

        if (normalizedUser === normalizedCorrect) return true;

        if (!isNaN(normalizedUser) && !isNaN(normalizedCorrect)) {
            const userNum = parseFloat(normalizedUser);
            const correctNum = parseFloat(normalizedCorrect);
            return Math.abs(userNum - correctNum) < 0.001;
        }

        const synonyms = {
            'да': ['yes', 'истина', 'верно', 'правда', 'true'],
            'нет': ['no', 'ложь', 'неверно', 'false'],
            'бесконечность': ['∞', 'infinity', 'inf']
        };

        for (const [key, values] of Object.entries(synonyms)) {
            if ((key === normalizedCorrect && values.includes(normalizedUser)) ||
                (values.includes(normalizedCorrect) && key === normalizedUser)) {
                return true;
            }
        }

        return false;
    }

    showSolution() {
        const task = this.getCurrentTask();
        document.getElementById('solution-text').innerHTML = task.solutionText;
        document.getElementById('task-solution').style.display = 'block';
        
        document.getElementById('task-solution').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }

    showSelfCheckMode() {
        const task = this.getCurrentTask();
        this.showAnswerFeedback(
            'Режим самопроверки активирован. Решите задачу самостоятельно, затем сравните с решением.',
            'info'
        );
        this.showSolution();
    }

    markTaskAsUnderstood() {
        const task = this.getCurrentTask();
        this.markTaskAsSolved(task, 'understood');
        this.updateUserStats();
        this.showAnswerFeedback('Отлично! Задача отмечена как понятая.', 'correct');
        
        setTimeout(() => {
            this.navigateTask(1);
        }, 1500);
    }

    markTaskAsNeedsPractice() {
        const task = this.getCurrentTask();
        this.markTaskProgress(task, 'needs_practice');
        this.showAnswerFeedback('Задача отмечена для дополнительной практики.', 'warning');
    }

    markTaskAsDifficult() {
        const task = this.getCurrentTask();
        this.markTaskProgress(task, 'difficult');
        this.showAnswerFeedback('Задача отмечена как сложная. Рекомендуем изучить дополнительные материалы.', 'info');
    }

    navigateTask(direction) {
        const newIndex = this.currentTaskIndex + direction;
        const tasks = this.currentSubcategory.tasks.filter(task => task.isActual);
        
        if (newIndex >= 0 && newIndex < tasks.length) {
            this.showTaskDetail(this.currentCategory, this.currentSubcategory, newIndex);
        }
    }

    updateTaskNavigation(category, subcategory, tasks) {
        const prevBtn = document.getElementById('prev-task');
        const nextBtn = document.getElementById('next-task');
        
        if (prevBtn) {
            prevBtn.style.display = this.currentTaskIndex > 0 ? 'block' : 'none';
        }
        
        if (nextBtn) {
            nextBtn.style.display = this.currentTaskIndex < tasks.length - 1 ? 'block' : 'none';
        }
    }

    getCurrentTask() {
        if (!this.currentCategory || !this.currentSubcategory) return null;
        const tasks = this.currentSubcategory.tasks.filter(task => task.isActual);
        return tasks[this.currentTaskIndex];
    }

    showAnswerFeedback(message, type) {
        const feedback = document.getElementById('answer-feedback');
        const content = document.getElementById('feedback-content');
        
        feedback.className = `answer-feedback feedback-${type}`;
        content.textContent = message;
        feedback.style.display = 'block';
        
        feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    markTaskAsSolved(task, method = 'answered') {
        const key = `${this.currentCategory.categoryId}_${this.currentSubcategory.subcategoryId}_${task.id}`;
        
        if (!this.userProgress.solvedTasks) {
            this.userProgress.solvedTasks = {};
        }
        
        this.userProgress.solvedTasks[key] = {
            timestamp: Date.now(),
            method: method,
            attempts: this.userProgress.solvedTasks[key]?.attempts + 1 || 1
        };
        
        this.saveProgress();
        this.updateDailyStreak();
    }

    markTaskProgress(task, status) {
        const key = `${this.currentCategory.categoryId}_${this.currentSubcategory.subcategoryId}_${task.id}`;
        
        if (!this.userProgress.taskProgress) {
            this.userProgress.taskProgress = {};
        }
        
        this.userProgress.taskProgress[key] = {
            status: status,
            timestamp: Date.now()
        };
        
        this.saveProgress();
    }

    isTaskSolved(categoryId, subcategoryId, taskId) {
        const key = `${categoryId}_${subcategoryId}_${taskId}`;
        return this.userProgress.solvedTasks?.[key] ? true : false;
    }

    getSolvedTasksCount(categoryId, subcategoryId) {
        const subcategory = this.findSubcategory(categoryId, subcategoryId);
        if (!subcategory) return 0;
        
        return subcategory.tasks.filter(task => 
            task.isActual && this.isTaskSolved(categoryId, subcategoryId, task.id)
        ).length;
    }

    getSubcategoryProgress(categoryId, subcategoryId) {
        const subcategory = this.findSubcategory(categoryId, subcategoryId);
        if (!subcategory) return 0;
        
        const totalTasks = subcategory.tasks.filter(task => task.isActual).length;
        const solvedTasks = this.getSolvedTasksCount(categoryId, subcategoryId);
        
        return totalTasks > 0 ? (solvedTasks / totalTasks) * 100 : 0;
    }

    getCategoryProgress(categoryId) {
        const category = this.data.categories.find(c => c.categoryId === categoryId);
        if (!category) return 0;
        
        let totalTasks = 0;
        let solvedTasks = 0;
        
        category.subcategories.forEach(subcategory => {
            const subTotal = subcategory.tasks.filter(task => task.isActual).length;
            const subSolved = this.getSolvedTasksCount(categoryId, subcategory.subcategoryId);
            
            totalTasks += subTotal;
            solvedTasks += subSolved;
        });
        
        return totalTasks > 0 ? (solvedTasks / totalTasks) * 100 : 0;
    }

    getTotalTasksInCategory(category) {
        let total = 0;
        category.subcategories.forEach(subcategory => {
            total += subcategory.tasks.filter(task => task.isActual).length;
        });
        return total;
    }

    findSubcategory(categoryId, subcategoryId) {
        const category = this.data.categories.find(c => c.categoryId === categoryId);
        if (!category) return null;
        
        return category.subcategories.find(s => s.subcategoryId === subcategoryId);
    }

    updateGlobalStats() {
        if (!this.data) return;
        
        let totalTasks = 0;
        let totalCategories = this.data.categories.length;
        
        this.data.categories.forEach(category => {
            totalTasks += this.getTotalTasksInCategory(category);
        });
        
        const totalSolved = Object.keys(this.userProgress.solvedTasks || {}).length;
        
        document.getElementById('total-tasks').textContent = totalTasks;
        document.getElementById('total-categories').textContent = totalCategories;
        document.getElementById('solved-tasks').textContent = totalSolved;
    }

    updateProgressView() {
        this.updateOverallProgress();
        this.updateCategoriesProgress();
        this.updateLearningAnalytics();
        this.updateAchievements();
    }

    updateOverallProgress() {
        const totalTasks = this.getTotalTasksCount();
        const solvedTasks = Object.keys(this.userProgress.solvedTasks || {}).length;
        const progressPercent = totalTasks > 0 ? (solvedTasks / totalTasks) * 100 : 0;
        
        document.getElementById('progress-solved').textContent = solvedTasks;
        document.getElementById('progress-total').textContent = totalTasks;
        
        const progressCircle = document.querySelector('[data-percent]');
        if (progressCircle) {
            progressCircle.setAttribute('data-percent', Math.round(progressPercent));
            this.updateCircularProgress(progressCircle, progressPercent);
        }
        
        document.getElementById('current-streak').textContent = this.userStats.currentStreak || 0;
        document.getElementById('max-streak').textContent = this.userStats.maxStreak || 0;
    }

    updateCircularProgress(element, percent) {
        const progressNumber = element.querySelector('.progress-number');
        if (progressNumber) {
            progressNumber.textContent = `${Math.round(percent)}%`;
        }
        
        const progressCircle = element.querySelector('.progress-circle');
        if (progressCircle) {
            const angle = (percent / 100) * 360;
            progressCircle.style.background = `conic-gradient(var(--primary-color) ${angle}deg, var(--bg-tertiary) ${angle}deg)`;
        }
    }

    updateCategoriesProgress() {
        const container = document.getElementById('categories-progress');
        if (!container || !this.data) return;
        
        container.innerHTML = this.data.categories.map(category => {
            const progress = this.getCategoryProgress(category.categoryId);
            const totalTasks = this.getTotalTasksInCategory(category);
            const solvedTasks = this.getSolvedTasksInCategory(category.categoryId);
            
            return `
                <div class="category-progress-item">
                    <div class="category-progress-header">
                        <span class="category-progress-name">${category.categoryName}</span>
                        <span class="category-progress-stats">${solvedTasks}/${totalTasks}</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    getSolvedTasksInCategory(categoryId) {
        const category = this.data.categories.find(c => c.categoryId === categoryId);
        if (!category) return 0;
        
        let solved = 0;
        category.subcategories.forEach(subcategory => {
            solved += this.getSolvedTasksCount(categoryId, subcategory.subcategoryId);
        });
        
        return solved;
    }

    updateLearningAnalytics() {
        this.updateDifficultTopics();
        this.updateRecommendations();
        this.updateTimeChart();
    }

    updateDifficultTopics() {
        const container = document.getElementById('difficult-topics');
        if (!container) return;
        
        const difficultTasks = Object.entries(this.userProgress.taskProgress || {})
            .filter(([key, progress]) => progress.status === 'difficult')
            .map(([key]) => {
                const [categoryId, subcategoryId, taskId] = key.split('_');
                const category = this.data.categories.find(c => c.categoryId === categoryId);
                const subcategory = category?.subcategories.find(s => s.subcategoryId === subcategoryId);
                return subcategory ? `${category.categoryName} - ${subcategory.subcategoryName}` : null;
            })
            .filter(Boolean);
        
        if (difficultTasks.length === 0) {
            container.innerHTML = '<p>У вас пока нет отмеченных сложных тем</p>';
        } else {
            container.innerHTML = `
                <ul>
                    ${difficultTasks.slice(0, 5).map(topic => `<li>${topic}</li>`).join('')}
                </ul>
            `;
        }
    }

    updateRecommendations() {
        const container = document.getElementById('recommendations');
        if (!container) return;
        
        const recommendations = this.generateRecommendations();
        
        if (recommendations.length === 0) {
            container.innerHTML = '<p>Продолжайте решать задачи для получения персональных рекомендаций</p>';
        } else {
            container.innerHTML = `
                <ul>
                    ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            `;
        }
    }

    generateRecommendations() {
        const recommendations = [];
        const totalSolved = Object.keys(this.userProgress.solvedTasks || {}).length;
        
        if (totalSolved === 0) {
            recommendations.push('Начните с решения первых задач из любой категории');
            return recommendations;
        }
        
        if (this.userStats.currentStreak === 0) {
            recommendations.push('Попробуйте решать задачи каждый день для поддержания регулярности');
        }
        
        const categoryProgress = this.data.categories.map(category => ({
            category,
            progress: this.getCategoryProgress(category.categoryId)
        })).sort((a, b) => a.progress - b.progress);
        
        const weakestCategory = categoryProgress[0];
        if (weakestCategory.progress < 50) {
            recommendations.push(`Рекомендуем уделить больше внимания категории "${weakestCategory.category.categoryName}"`);
        }
        
        const needsPractice = Object.entries(this.userProgress.taskProgress || {})
            .filter(([key, progress]) => progress.status === 'needs_practice').length;
        
        if (needsPractice > 0) {
            recommendations.push(`У вас ${needsPractice} задач отмечены для дополнительной практики`);
        }
        
        if (totalSolved >= 10 && this.userStats.currentStreak >= 3) {
            recommendations.push('Отличный прогресс! Попробуйте более сложные категории');
        }
        
        return recommendations;
    }

    updateTimeChart() {
        const today = new Date();
        const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        
        document.querySelectorAll('.time-bar').forEach((bar, index) => {
            const dayIndex = (today.getDay() - 6 + index) % 7;
            if (dayIndex < 0) dayIndex += 7;
            
            const hours = Math.random() * 3;
            bar.style.height = `${(hours / 3) * 80 + 10}px`;
            bar.querySelector('span').textContent = `${hours.toFixed(1)}ч`;
            bar.setAttribute('data-day', days[dayIndex]);
        });
    }

    updateAchievements() {
        const container = document.getElementById('achievements-container');
        if (!container) return;
        
        const earnedAchievements = this.achievementsList.filter(achievement => 
            achievement.condition()
        );
        
        container.innerHTML = this.achievementsList.slice(0, 6).map(achievement => {
            const isEarned = achievement.condition();
            return `
                <div class="achievement ${isEarned ? '' : 'locked'}" title="${achievement.description}">
                    <span class="achievement-icon">${achievement.icon}</span>
                    <span class="achievement-name">${achievement.name}</span>
                </div>
            `;
        }).join('');
        
        this.checkNewAchievements(earnedAchievements);
    }

    checkNewAchievements(currentAchievements) {
        const previousAchievements = this.userStats.achievements || [];
        const newAchievements = currentAchievements.filter(achievement => 
            !previousAchievements.includes(achievement.id)
        );
        
        if (newAchievements.length > 0) {
            this.userStats.achievements = currentAchievements.map(a => a.id);
            this.saveStats();
            
            newAchievements.forEach(achievement => {
                this.showAchievementNotification(achievement);
            });
        }
    }

    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-content">
                <span class="achievement-icon">${achievement.icon}</span>
                <div>
                    <h4>Достижение разблокировано!</h4>
                    <p>${achievement.name}</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    updateUserStats() {
        const totalSolved = Object.keys(this.userProgress.solvedTasks || {}).length;
        this.userStats.totalSolved = totalSolved;
        this.updateDailyStreak();
        this.saveStats();
        this.updateGlobalStats();
    }

    updateDailyStreak() {
        const today = new Date().toDateString();
        const lastActivity = this.userStats.lastActivityDate;
        
        if (lastActivity === today) {
            return;
        }
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastActivity === yesterday.toDateString()) {
            this.userStats.currentStreak = (this.userStats.currentStreak || 0) + 1;
        } else if (lastActivity !== today) {
            this.userStats.currentStreak = 1;
        }
        
        this.userStats.maxStreak = Math.max(
            this.userStats.maxStreak || 0, 
            this.userStats.currentStreak || 0
        );
        
        this.userStats.lastActivityDate = today;
        this.saveStats();
    }

    getTotalTasksCount() {
        if (!this.data) return 0;
        
        let total = 0;
        this.data.categories.forEach(category => {
            total += this.getTotalTasksInCategory(category);
        });
        
        return total;
    }

    hasPerfectCategory() {
        if (!this.data) return false;
        
        return this.data.categories.some(category => 
            this.getCategoryProgress(category.categoryId) === 100
        );
    }

    hasTriedAllCategories() {
        if (!this.data) return false;
        
        return this.data.categories.every(category => 
            this.getCategoryProgress(category.categoryId) > 0
        );
    }

    calculateRecommendations() {
        setTimeout(() => {
            this.updateRecommendations();
        }, 1000);
    }

    filterCategories(filter) {
        this.renderCategories(filter);
    }

    getCategoryIcon(categoryName) {
        const name = categoryName.toLowerCase();
        if (name.includes('алгебра')) return '📐';
        if (name.includes('геометрия')) return '📏';
        if (name.includes('5')) return '🌟';
        if (name.includes('6')) return '⭐';
        if (name.includes('7')) return '🎯';
        if (name.includes('8')) return '🚀';
        if (name.includes('9')) return '💫';
        if (name.includes('огэ') || name.includes('егэ')) return '🎓';
        if (name.includes('экзамен') || name.includes('олимпиада')) return '🏆';
        return '📚';
    }

    getCategoryDifficulty(category) {
        const name = category.categoryName.toLowerCase();
        if (name.includes('5') || name.includes('6')) return 'difficulty-easy';
        if (name.includes('7') || name.includes('8')) return 'difficulty-medium';
        if (name.includes('9') || name.includes('огэ') || name.includes('егэ')) return 'difficulty-hard';
        return 'difficulty-medium';
    }

    getDifficultyText(difficulty) {
        switch (difficulty) {
            case 'difficulty-easy': return 'Легкий';
            case 'difficulty-medium': return 'Средний';
            case 'difficulty-hard': return 'Сложный';
            default: return 'Средний';
        }
    }

    getTaskDifficulty(task) {
        if (task.difficulty) {
            return this.getDifficultyText(`difficulty-${task.difficulty}`);
        }
        
        const problemLength = this.stripHTML(task.problemText).length;
        if (problemLength < 200) return 'Легкий';
        if (problemLength < 400) return 'Средний';
        return 'Сложный';
    }

    stripHTML(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    }

    startDailyQuoteRotation() {
        this.updateDailyQuote();
        setInterval(() => {
            this.updateDailyQuote();
        }, 30000);
    }

    updateDailyQuote() {
        const quote = this.motivationalQuotes[Math.floor(Math.random() * this.motivationalQuotes.length)];
        const quoteElement = document.getElementById('daily-quote');
        const authorElement = document.getElementById('quote-author');
        
        if (quoteElement && authorElement) {
            quoteElement.textContent = quote.text;
            authorElement.textContent = quote.author;
        }
    }

    handleContactForm(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        this.showLoadingOverlay();
        
        setTimeout(() => {
            this.hideLoadingOverlay();
            this.showNotification('Спасибо за ваше сообщение! Мы свяжемся с вами в ближайшее время.', 'success');
            e.target.reset();
        }, 2000);
    }

    handleEscapeKey() {
        const modal = document.querySelector('.modal.active');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    handleScroll() {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    toggleMobileMenu() {
        const menu = document.querySelector('.navbar-menu');
        const toggle = document.querySelector('.mobile-menu-toggle');
        
        menu.classList.toggle('active');
        toggle.classList.toggle('active');
    }

    showLoadingOverlay() {
        document.getElementById('loading-overlay').style.display = 'flex';
    }

    hideLoadingOverlay() {
        document.getElementById('loading-overlay').style.display = 'none';
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    playSuccessAnimation() {
        const element = document.getElementById('answer-feedback');
        element.classList.add('bounce');
        setTimeout(() => {
            element.classList.remove('bounce');
        }, 600);
    }

    playShakeAnimation() {
        const element = document.getElementById('user-answer');
        element.classList.add('shake');
        setTimeout(() => {
            element.classList.remove('shake');
        }, 500);
    }

    loadProgress() {
        try {
            const saved = localStorage.getItem('mathTutorProgress');
            return saved ? JSON.parse(saved) : { solvedTasks: {}, taskProgress: {} };
        } catch (error) {
            console.error('Ошибка загрузки прогресса:', error);
            return { solvedTasks: {}, taskProgress: {} };
        }
    }

    saveProgress() {
        try {
            localStorage.setItem('mathTutorProgress', JSON.stringify(this.userProgress));
        } catch (error) {
            console.error('Ошибка сохранения прогресса:', error);
        }
    }

    loadStats() {
        try {
            const saved = localStorage.getItem('mathTutorStats');
            return saved ? JSON.parse(saved) : {
                totalSolved: 0,
                currentStreak: 0,
                maxStreak: 0,
                lastActivityDate: null,
                achievements: []
            };
        } catch (error) {
            console.error('Ошибка загрузки статистики:', error);
            return {
                totalSolved: 0,
                currentStreak: 0,
                maxStreak: 0,
                lastActivityDate: null,
                achievements: []
            };
        }
    }

    saveStats() {
        try {
            localStorage.setItem('mathTutorStats', JSON.stringify(this.userStats));
        } catch (error) {
            console.error('Ошибка сохранения статистики:', error);
        }
    }

    exportProgress() {
        const data = {
            progress: this.userProgress,
            stats: this.userStats,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `math-tutor-progress-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }

    importProgress(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.progress && data.stats) {
                    this.userProgress = data.progress;
                    this.userStats = data.stats;
                    this.saveProgress();
                    this.saveStats();
                    this.updateUI();
                    this.showNotification('Прогресс успешно импортирован!', 'success');
                } else {
                    this.showError('Неверный формат файла');
                }
            } catch (error) {
                console.error('Ошибка импорта:', error);
                this.showError('Ошибка при импорте файла');
            }
        };
        reader.readAsText(file);
    }

    resetProgress() {
        if (confirm('Вы уверены, что хотите сбросить весь прогресс? Это действие нельзя отменить.')) {
            this.userProgress = { solvedTasks: {}, taskProgress: {} };
            this.userStats = {
                totalSolved: 0,
                currentStreak: 0,
                maxStreak: 0,
                lastActivityDate: null,
                achievements: []
            };
            
            this.saveProgress();
            this.saveStats();
            this.updateUI();
            this.showNotification('Прогресс сброшен', 'info');
        }
    }

    updateUI() {
        this.updateGlobalStats();
        if (this.currentSection === 'progress') {
            this.updateProgressView();
        }
        if (this.currentSection === 'categories') {
            this.renderCategories();
        }
    }

    generatePDFReport() {
        const reportData = this.generateReportData();
        this.showNotification('Функция генерации PDF отчетов будет доступна в следующих версиях', 'info');
    }

    generateReportData() {
        const totalTasks = this.getTotalTasksCount();
        const solvedTasks = Object.keys(this.userProgress.solvedTasks || {}).length;
        const progress = totalTasks > 0 ? (solvedTasks / totalTasks) * 100 : 0;
        
        return {
            summary: {
                totalTasks,
                solvedTasks,
                progress: Math.round(progress),
                currentStreak: this.userStats.currentStreak,
                maxStreak: this.userStats.maxStreak
            },
            categories: this.data.categories.map(category => ({
                name: category.categoryName,
                progress: Math.round(this.getCategoryProgress(category.categoryId)),
                totalTasks: this.getTotalTasksInCategory(category),
                solvedTasks: this.getSolvedTasksInCategory(category.categoryId)
            })),
            achievements: this.achievementsList.filter(a => a.condition()).map(a => a.name),
            recommendations: this.generateRecommendations()
        };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.mathTutorApp = new MathTutorApp();
});

window.addEventListener('beforeunload', () => {
    if (window.mathTutorApp) {
        window.mathTutorApp.saveProgress();
        window.mathTutorApp.saveStats();
    }
});

const styles = `
.achievement-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    border: 2px solid var(--success-color);
    border-radius: var(--border-radius-lg);
    padding: 1rem;
    box-shadow: var(--shadow-xl);
    z-index: 10000;
    transform: translateX(400px);
    transition: transform 0.3s ease;
    max-width: 300px;
}

.achievement-notification.show {
    transform: translateX(0);
}

.achievement-content {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.achievement-content .achievement-icon {
    font-size: 2rem;
}

.achievement-content h4 {
    margin: 0 0 0.25rem 0;
    color: var(--success-color);
    font-size: 1rem;
}

.achievement-content p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.875rem;
}

.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: var(--border-radius);
    color: white;
    font-weight: 500;
    z-index: 10000;
    transform: translateX(400px);
    transition: transform 0.3s ease;
    max-width: 300px;
    word-wrap: break-word;
}

.notification.show {
    transform: translateX(0);
}

.notification-success {
    background: var(--success-color);
}

.notification-error {
    background: var(--danger-color);
}

.notification-warning {
    background: var(--warning-color);
}

.notification-info {
    background: var(--primary-color);
}

@media (max-width: 768px) {
    .navbar-menu.active {
        display: flex;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        box-shadow: var(--shadow-lg);
        padding: 1rem;
        flex-direction: column;
    }
    
    .navbar-nav {
        flex-direction: column;
        gap: 1rem;
    }
    
    .mobile-menu-toggle.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }
    
    .mobile-menu-toggle.active span:nth-child(2) {
        opacity: 0;
    }
    
    .mobile-menu-toggle.active span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }
    
    .achievement-notification,
    .notification {
        top: 10px;
        right: 10px;
        left: 10px;
        max-width: none;
        transform: translateY(-100px);
    }
    
    .achievement-notification.show,
    .notification.show {
        transform: translateY(0);
    }
}
`;

const styleElement = document.createElement('style');
styleElement.textContent = styles;
document.head.appendChild(styleElement);