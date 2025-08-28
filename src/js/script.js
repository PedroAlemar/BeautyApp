// Utilitários para localStorage
const Storage = {
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Erro ao salvar no localStorage:', error);
            return false;
        }
    },
    
    get: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Erro ao ler do localStorage:', error);
            return null;
        }
    },
    
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Erro ao remover do localStorage:', error);
            return false;
        }
    }
};

// Utilitários de navegação
const Navigation = {
    goTo: (page) => {
        window.location.href = page;
    },
    
    getCurrentPage: () => {
        const path = window.location.pathname;
        const filename = path.split('/').pop();
        return filename || 'index.html';
    }
};

// Utilitários de validação
const Validation = {
    email: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    password: (password) => {
        return password && password.length >= 6;
    },
    
    phone: (phone) => {
        const phoneRegex = /^[\d\s\-\(\)]+$/;
        return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
    },
    
    name: (name) => {
        return name && name.trim().length >= 2;
    }
};

// Utilitários de UI
const UI = {
    showError: (message, element = null) => {
        // Remove erros anteriores
        const existingErrors = document.querySelectorAll('.error-message');
        existingErrors.forEach(error => error.remove());
        
        // Cria nova mensagem de erro
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            color: #e74c3c;
            font-size: 0.9rem;
            margin-top: 5px;
            padding: 8px;
            background: #ffeaea;
            border-radius: 5px;
            border-left: 3px solid #e74c3c;
        `;
        errorDiv.textContent = message;
        
        if (element) {
            element.parentNode.insertBefore(errorDiv, element.nextSibling);
        } else {
            const container = document.querySelector('.form-container') || document.body;
            container.appendChild(errorDiv);
        }
        
        // Remove a mensagem após 5 segundos
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    },
    
    showSuccess: (message) => {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.style.cssText = `
            color: #27ae60;
            font-size: 0.9rem;
            margin-top: 10px;
            padding: 8px;
            background: #eafaf1;
            border-radius: 5px;
            border-left: 3px solid #27ae60;
            text-align: center;
        `;
        successDiv.textContent = message;
        
        const container = document.querySelector('.form-container') || document.body;
        container.appendChild(successDiv);
        
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.remove();
            }
        }, 3000);
    },
    
    setLoading: (button, loading = true) => {
        if (loading) {
            button.disabled = true;
            button.textContent = 'Carregando...';
            button.classList.add('loading');
        } else {
            button.disabled = false;
            button.classList.remove('loading');
        }
    }
};

// Classe para gerenciar usuários
class UserManager {
    constructor() {
        this.currentUser = Storage.get('currentUser');
        this.users = Storage.get('users') || [];
    }
    
    register(userData) {
        // Verifica se o email já existe
        const existingUser = this.users.find(user => user.email === userData.email);
        if (existingUser) {
            throw new Error('Este email já está cadastrado');
        }
        
        // Cria novo usuário
        const newUser = {
            id: Date.now().toString(),
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            password: userData.password, // Em produção, seria hash
            createdAt: new Date().toISOString()
        };
        
        this.users.push(newUser);
        Storage.set('users', this.users);
        
        return newUser;
    }
    
    login(email, password) {
        const user = this.users.find(u => u.email === email && u.password === password);
        if (!user) {
            throw new Error('Email ou senha incorretos');
        }
        
        this.currentUser = user;
        Storage.set('currentUser', user);
        
        return user;
    }
    
    logout() {
        this.currentUser = null;
        Storage.remove('currentUser');
    }
    
    isLoggedIn() {
        return !!this.currentUser;
    }
    
    getCurrentUser() {
        return this.currentUser;
    }
}

// Instância global do gerenciador de usuários
const userManager = new UserManager();

// Funções específicas para cada página
const PageHandlers = {
    // Página inicial
    index: () => {
        const startButton = document.getElementById('startButton');
        if (startButton) {
            startButton.addEventListener('click', () => {
                // Verifica se já está logado
                if (userManager.isLoggedIn()) {
                    Navigation.goTo('home.html');
                } else {
                    Navigation.goTo('login.html');
                }
            });
        }
    },
    
    // Página de login
    login: () => {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const email = document.getElementById('loginEmail').value.trim();
                const password = document.getElementById('loginPassword').value;
                const submitButton = loginForm.querySelector('button[type="submit"]');
                
                // Validações
                if (!email || !password) {
                    UI.showError('Por favor, preencha todos os campos');
                    return;
                }
                
                if (!Validation.email(email)) {
                    UI.showError('Por favor, insira um email válido');
                    return;
                }
                
                try {
                    UI.setLoading(submitButton, true);
                    
                    // Simula delay de rede
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    const user = userManager.login(email, password);
                    UI.showSuccess('Login realizado com sucesso!');
                    
                    // Redireciona após sucesso
                    setTimeout(() => {
                        Navigation.goTo('home.html');
                    }, 1500);
                    
                } catch (error) {
                    UI.showError(error.message);
                } finally {
                    UI.setLoading(submitButton, false);
                    submitButton.textContent = 'Login';
                }
            });
        }
    },
    
    // Página de cadastro
    register: () => {
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const name = document.getElementById('registerName').value.trim();
                const email = document.getElementById('registerEmail').value.trim();
                const phone = document.getElementById('registerPhone').value.trim();
                const password = document.getElementById('registerPassword').value;
                const confirmPassword = document.getElementById('confirmPassword').value;
                const termsAccepted = document.getElementById('termsCheckbox').checked;
                const submitButton = registerForm.querySelector('button[type="submit"]');
                
                // Validações
                if (!name || !email || !phone || !password || !confirmPassword) {
                    UI.showError('Por favor, preencha todos os campos');
                    return;
                }
                
                if (!Validation.name(name)) {
                    UI.showError('Nome deve ter pelo menos 2 caracteres');
                    return;
                }
                
                if (!Validation.email(email)) {
                    UI.showError('Por favor, insira um email válido');
                    return;
                }
                
                if (!Validation.phone(phone)) {
                    UI.showError('Por favor, insira um telefone válido');
                    return;
                }
                
                if (!Validation.password(password)) {
                    UI.showError('A senha deve ter pelo menos 6 caracteres');
                    return;
                }
                
                if (password !== confirmPassword) {
                    UI.showError('As senhas não coincidem');
                    return;
                }
                
                if (!termsAccepted) {
                    UI.showError('Você deve aceitar os termos para continuar');
                    return;
                }
                
                try {
                    UI.setLoading(submitButton, true);
                    
                    // Simula delay de rede
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    const user = userManager.register({
                        name,
                        email,
                        phone,
                        password
                    });
                    
                    UI.showSuccess('Cadastro realizado com sucesso!');
                    
                    // Auto-login após cadastro
                    userManager.login(email, password);
                    
                    // Redireciona após sucesso
                    setTimeout(() => {
                        Navigation.goTo('home.html');
                    }, 1500);
                    
                } catch (error) {
                    UI.showError(error.message);
                } finally {
                    UI.setLoading(submitButton, false);
                    submitButton.textContent = 'Cadastrar';
                }
            });
        }
    },
    
    // Página home
    home: () => {
        // Verifica se está logado
        if (!userManager.isLoggedIn()) {
            Navigation.goTo('login.html');
            return;
        }
        
        // Atualiza informações do usuário na interface
        const currentUser = userManager.getCurrentUser();
        if (currentUser) {
            // Atualiza nome do usuário se houver elemento para isso
            const userNameElements = document.querySelectorAll('.user-name');
            userNameElements.forEach(element => {
                element.textContent = currentUser.name;
            });
        }
        
        // Adiciona funcionalidade aos itens de navegação
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                // Remove classe active de todos os itens
                navItems.forEach(nav => nav.classList.remove('active'));
                // Adiciona classe active ao item clicado
                item.classList.add('active');
                
                // Aqui você pode adicionar lógica para navegar entre seções
                switch(index) {
                    case 0: // Home
                        console.log('Navegando para Home');
                        break;
                    case 1: // Agenda
                        console.log('Navegando para Agenda');
                        break;
                    case 2: // Pedidos
                        console.log('Navegando para Pedidos');
                        break;
                    case 3: // Perfil
                        console.log('Navegando para Perfil');
                        break;
                }
            });
        });
        
        // Adiciona funcionalidade aos especialistas
        const specialistItems = document.querySelectorAll('.specialist-item');
        specialistItems.forEach(item => {
            item.addEventListener('click', () => {
                const specialistName = item.querySelector('h4').textContent;
                alert(`Agendamento com ${specialistName} - Funcionalidade em desenvolvimento`);
            });
        });
        
        // Adiciona funcionalidade às categorias
        const categoryItems = document.querySelectorAll('.category-item');
        categoryItems.forEach(item => {
            item.addEventListener('click', () => {
                const categoryName = item.querySelector('span').textContent;
                alert(`Categoria ${categoryName} - Funcionalidade em desenvolvimento`);
            });
        });
        
        // Menu hambúrguer
        const menuIcon = document.querySelector('.menu-icon');
        if (menuIcon) {
            menuIcon.addEventListener('click', () => {
                // Cria menu lateral simples
                const existingMenu = document.querySelector('.side-menu');
                if (existingMenu) {
                    existingMenu.remove();
                    return;
                }
                
                const sideMenu = document.createElement('div');
                sideMenu.className = 'side-menu';
                sideMenu.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 250px;
                    height: 100vh;
                    background: white;
                    box-shadow: 2px 0 10px rgba(0,0,0,0.1);
                    z-index: 1000;
                    padding: 20px;
                    transform: translateX(-100%);
                    transition: transform 0.3s ease;
                `;
                
                sideMenu.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                        <h3>Menu</h3>
                        <span class="close-menu" style="font-size: 1.5rem; cursor: pointer;">&times;</span>
                    </div>
                    <div class="menu-item" style="padding: 15px 0; border-bottom: 1px solid #eee; cursor: pointer;">
                        Perfil
                    </div>
                    <div class="menu-item" style="padding: 15px 0; border-bottom: 1px solid #eee; cursor: pointer;">
                        Configurações
                    </div>
                    <div class="menu-item" style="padding: 15px 0; border-bottom: 1px solid #eee; cursor: pointer;">
                        Ajuda
                    </div>
                    <div class="menu-item logout-item" style="padding: 15px 0; cursor: pointer; color: #e74c3c;">
                        Sair
                    </div>
                `;
                
                document.body.appendChild(sideMenu);
                
                // Anima a entrada
                setTimeout(() => {
                    sideMenu.style.transform = 'translateX(0)';
                }, 10);
                
                // Adiciona eventos
                const closeMenu = sideMenu.querySelector('.close-menu');
                const logoutItem = sideMenu.querySelector('.logout-item');
                
                closeMenu.addEventListener('click', () => {
                    sideMenu.style.transform = 'translateX(-100%)';
                    setTimeout(() => sideMenu.remove(), 300);
                });
                
                logoutItem.addEventListener('click', () => {
                    if (confirm('Tem certeza que deseja sair?')) {
                        userManager.logout();
                        Navigation.goTo('index.html');
                    }
                });
                
                // Fecha menu ao clicar fora
                document.addEventListener('click', (e) => {
                    if (!sideMenu.contains(e.target) && !menuIcon.contains(e.target)) {
                        sideMenu.style.transform = 'translateX(-100%)';
                        setTimeout(() => sideMenu.remove(), 300);
                    }
                }, { once: true });
            });
        }
    }
};

// Inicialização da página
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = Navigation.getCurrentPage();
    
    // Remove extensão do nome da página para comparação
    const pageName = currentPage.replace('.html', '');
    
    // Executa handler específico da página
    if (PageHandlers[pageName]) {
        PageHandlers[pageName]();
    }
    
    // Adiciona funcionalidades globais
    
    // Formatação automática de telefone
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 11) {
                value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
                if (value.length < 14) {
                    value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
                }
                e.target.value = value;
            }
        });
    });
    
    // Adiciona efeitos visuais aos formulários
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentNode.classList.add('focused');
        });
        
        input.addEventListener('blur', () => {
            if (!input.value) {
                input.parentNode.classList.remove('focused');
            }
        });
    });
});

// Adiciona estilos dinâmicos para melhorar a experiência
const dynamicStyles = `
    .input-group.focused input {
        border-color: #ff6b6b !important;
        box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1) !important;
    }
    
    .error-message {
        animation: slideIn 0.3s ease-out;
    }
    
    .success-message {
        animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .side-menu .menu-item:hover {
        background: #f8f9fa;
        padding-left: 20px;
        transition: all 0.3s ease;
    }
`;

// Adiciona os estilos dinâmicos ao documento
const styleSheet = document.createElement('style');
styleSheet.textContent = dynamicStyles;
document.head.appendChild(styleSheet);

// Função para debug (pode ser removida em produção)
window.debugApp = {
    userManager,
    Storage,
    clearAllData: () => {
        localStorage.clear();
        location.reload();
    },
    showUsers: () => {
        console.table(Storage.get('users') || []);
    },
    getCurrentUser: () => {
        console.log(userManager.getCurrentUser());
    }
};



// Funcionalidades para as novas telas

// Classe para gerenciar agendamentos
class AppointmentManager {
    constructor() {
        this.appointments = Storage.get('appointments') || [];
        this.selectedDate = null;
        this.selectedTime = null;
        this.selectedSpecialist = null;
    }
    
    createAppointment(appointmentData) {
        const newAppointment = {
            id: Date.now().toString(),
            userId: userManager.getCurrentUser()?.id,
            date: appointmentData.date,
            time: appointmentData.time,
            specialist: appointmentData.specialist,
            service: appointmentData.service,
            price: appointmentData.price,
            status: 'scheduled',
            createdAt: new Date().toISOString()
        };
        
        this.appointments.push(newAppointment);
        Storage.set('appointments', this.appointments);
        
        return newAppointment;
    }
    
    getUserAppointments(userId) {
        return this.appointments.filter(apt => apt.userId === userId);
    }
    
    cancelAppointment(appointmentId) {
        const appointment = this.appointments.find(apt => apt.id === appointmentId);
        if (appointment) {
            appointment.status = 'cancelled';
            Storage.set('appointments', this.appointments);
        }
    }
}

// Classe para gerenciar notificações
class NotificationManager {
    constructor() {
        this.notifications = Storage.get('notifications') || this.getDefaultNotifications();
    }
    
    getDefaultNotifications() {
        return [
            {
                id: '1',
                type: 'confirmed',
                title: 'Confirmado - Lavagem de cabelo',
                message: 'Ter, Tarde às 14h00',
                time: 'Há 2 horas',
                read: false
            },
            {
                id: '2',
                type: 'confirmed',
                title: 'Confirmado - Lavagem de cabelo',
                message: 'Ter, Tarde às 14h00',
                time: 'Há 4 horas',
                read: false
            },
            {
                id: '3',
                type: 'reminder',
                title: 'Lembrete - Próximo agendamento',
                message: 'Amanhã às 15h00 - Corte de cabelo',
                time: 'Há 1 dia',
                read: false
            },
            {
                id: '4',
                type: 'promotion',
                title: 'Promoção especial!',
                message: '20% de desconto em tratamentos faciais',
                time: 'Há 2 dias',
                read: true
            }
        ];
    }
    
    addNotification(notification) {
        const newNotification = {
            id: Date.now().toString(),
            ...notification,
            time: 'Agora',
            read: false
        };
        
        this.notifications.unshift(newNotification);
        Storage.set('notifications', this.notifications);
    }
    
    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            Storage.set('notifications', this.notifications);
        }
    }
    
    markAllAsRead() {
        this.notifications.forEach(n => n.read = true);
        Storage.set('notifications', this.notifications);
    }
}

// Instâncias globais
const appointmentManager = new AppointmentManager();
const notificationManager = new NotificationManager();

// Adicionar handlers para as novas páginas
PageHandlers.agenda = () => {
    if (!userManager.isLoggedIn()) {
        Navigation.goTo('login.html');
        return;
    }
    
    // Funcionalidade do calendário
    const monthNav = document.querySelectorAll('.month-nav');
    const currentMonthElement = document.getElementById('currentMonth');
    const dayCells = document.querySelectorAll('.day-cell:not(.empty)');
    const timeSlots = document.querySelectorAll('.time-slot');
    const specialistOptions = document.querySelectorAll('.specialist-option');
    const scheduleBtn = document.querySelector('.schedule-btn');
    
    let selectedDate = null;
    let selectedTime = null;
    let selectedSpecialist = null;
    
    // Navegação do mês
    monthNav.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            const currentMonth = currentMonthElement.textContent;
            const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                          'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
            let currentIndex = months.indexOf(currentMonth);
            
            if (index === 0) { // Anterior
                currentIndex = currentIndex > 0 ? currentIndex - 1 : 11;
            } else { // Próximo
                currentIndex = currentIndex < 11 ? currentIndex + 1 : 0;
            }
            
            currentMonthElement.textContent = months[currentIndex];
        });
    });
    
    // Seleção de data
    dayCells.forEach(cell => {
        cell.addEventListener('click', () => {
            dayCells.forEach(c => c.classList.remove('selected'));
            cell.classList.add('selected');
            selectedDate = cell.textContent;
            updateScheduleButton();
        });
    });
    
    // Seleção de horário
    timeSlots.forEach(slot => {
        slot.addEventListener('click', () => {
            timeSlots.forEach(s => s.classList.remove('selected'));
            slot.classList.add('selected');
            selectedTime = slot.textContent;
            updateScheduleButton();
        });
    });
    
    // Seleção de especialista
    specialistOptions.forEach(option => {
        option.addEventListener('click', () => {
            specialistOptions.forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            selectedSpecialist = {
                name: option.querySelector('h4').textContent,
                price: option.querySelector('.price').textContent
            };
            updateScheduleButton();
        });
    });
    
    function updateScheduleButton() {
        if (selectedDate && selectedTime && selectedSpecialist) {
            scheduleBtn.disabled = false;
            scheduleBtn.textContent = `Agendar - ${selectedSpecialist.price}`;
        } else {
            scheduleBtn.disabled = true;
            scheduleBtn.textContent = 'Selecione data, horário e especialista';
        }
    }
    
    // Agendar
    scheduleBtn.addEventListener('click', () => {
        if (selectedDate && selectedTime && selectedSpecialist) {
            const appointment = appointmentManager.createAppointment({
                date: selectedDate,
                time: selectedTime,
                specialist: selectedSpecialist.name,
                service: 'Lavagem de cabelo',
                price: selectedSpecialist.price
            });
            
            // Adicionar notificação
            notificationManager.addNotification({
                type: 'confirmed',
                title: 'Agendamento confirmado!',
                message: `${selectedDate} às ${selectedTime} com ${selectedSpecialist.name}`
            });
            
            UI.showSuccess('Agendamento realizado com sucesso!');
            
            setTimeout(() => {
                Navigation.goTo('home.html');
            }, 2000);
        }
    });
    
    updateScheduleButton();
};

PageHandlers.notifications = () => {
    if (!userManager.isLoggedIn()) {
        Navigation.goTo('login.html');
        return;
    }
    
    const markAllBtn = document.querySelector('.notification-actions .btn-secondary');
    const configBtn = document.querySelector('.notification-actions .btn-primary');
    
    if (markAllBtn) {
        markAllBtn.addEventListener('click', () => {
            notificationManager.markAllAsRead();
            UI.showSuccess('Todas as notificações foram marcadas como lidas');
            
            // Atualizar visualmente
            const notificationItems = document.querySelectorAll('.notification-item');
            notificationItems.forEach(item => {
                item.style.opacity = '0.7';
            });
        });
    }
    
    if (configBtn) {
        configBtn.addEventListener('click', () => {
            alert('Configurações de notificação - Em desenvolvimento');
        });
    }
    
    // Marcar notificação como lida ao clicar
    const notificationItems = document.querySelectorAll('.notification-item');
    notificationItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            const notifications = notificationManager.notifications;
            if (notifications[index]) {
                notificationManager.markAsRead(notifications[index].id);
                item.style.opacity = '0.7';
            }
        });
    });
};

PageHandlers.profile = () => {
    if (!userManager.isLoggedIn()) {
        Navigation.goTo('login.html');
        return;
    }
    
    const currentUser = userManager.getCurrentUser();
    
    // Atualizar nome do usuário
    const profileName = document.querySelector('.profile-name');
    if (profileName && currentUser) {
        profileName.textContent = currentUser.name;
    }
    
    // Toggle do modo escuro
    const darkModeToggle = document.getElementById('darkMode');
    if (darkModeToggle) {
        const isDarkMode = Storage.get('darkMode') || false;
        darkModeToggle.checked = isDarkMode;
        
        darkModeToggle.addEventListener('change', () => {
            const enabled = darkModeToggle.checked;
            Storage.set('darkMode', enabled);
            
            if (enabled) {
                document.body.classList.add('dark-mode');
                UI.showSuccess('Modo escuro ativado');
            } else {
                document.body.classList.remove('dark-mode');
                UI.showSuccess('Modo escuro desativado');
            }
        });
        
        // Aplicar modo escuro se estiver ativado
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        }
    }
    
    // Funcionalidade dos itens do menu
    const menuItems = document.querySelectorAll('.menu-item:not(.logout-item)');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const menuText = item.querySelector('h4').textContent;
            alert(`${menuText} - Funcionalidade em desenvolvimento`);
        });
    });
};

PageHandlers['appointment-history'] = () => {
    if (!userManager.isLoggedIn()) {
        Navigation.goTo('login.html');
        return;
    }
    
    const currentUser = userManager.getCurrentUser();
    const userAppointments = appointmentManager.getUserAppointments(currentUser.id);
    
    // Atualizar estatísticas
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length >= 3) {
        statNumbers[0].textContent = userAppointments.length;
        
        const totalSpent = userAppointments
            .filter(apt => apt.status === 'completed')
            .reduce((sum, apt) => sum + parseFloat(apt.price.replace('R$', '')), 0);
        statNumbers[1].textContent = `R$ ${totalSpent.toFixed(2)}`;
        
        const scheduled = userAppointments.filter(apt => apt.status === 'scheduled').length;
        statNumbers[2].textContent = scheduled;
    }
    
    // Adicionar funcionalidade aos itens do histórico
    const historyItems = document.querySelectorAll('.history-item');
    historyItems.forEach(item => {
        item.addEventListener('click', () => {
            const serviceName = item.querySelector('h4').textContent;
            const serviceTime = item.querySelector('p').textContent;
            alert(`Detalhes do serviço:\n${serviceName}\n${serviceTime}`);
        });
    });
};

PageHandlers.payment = () => {
    if (!userManager.isLoggedIn()) {
        Navigation.goTo('login.html');
        return;
    }
    
    const paymentOptions = document.querySelectorAll('.payment-option');
    const paymentBtn = document.querySelector('.payment-btn');
    let selectedPayment = 'card';
    
    // Seleção de método de pagamento
    paymentOptions.forEach(option => {
        option.addEventListener('click', () => {
            paymentOptions.forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            
            const radio = option.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
                selectedPayment = radio.name;
            }
        });
    });
    
    // Processar pagamento
    if (paymentBtn) {
        paymentBtn.addEventListener('click', async () => {
            UI.setLoading(paymentBtn, true);
            
            try {
                // Simular processamento de pagamento
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Criar agendamento
                const appointment = appointmentManager.createAppointment({
                    date: '2',
                    time: '14:00',
                    specialist: 'Doe John',
                    service: 'Lavagem de cabelo',
                    price: 'R$42,5'
                });
                
                // Adicionar notificação
                notificationManager.addNotification({
                    type: 'confirmed',
                    title: 'Pagamento confirmado!',
                    message: 'Seu agendamento foi confirmado e o pagamento processado'
                });
                
                UI.showSuccess('Pagamento realizado com sucesso!');
                
                setTimeout(() => {
                    Navigation.goTo('home.html');
                }, 2000);
                
            } catch (error) {
                UI.showError('Erro ao processar pagamento. Tente novamente.');
            } finally {
                UI.setLoading(paymentBtn, false);
                paymentBtn.textContent = 'Agendar Agora/ R$42,5';
            }
        });
    }
};

// Função global de logout
window.logout = () => {
    if (confirm('Tem certeza que deseja sair?')) {
        userManager.logout();
        Navigation.goTo('index.html');
    }
};

// Atualizar navegação na home para incluir as novas telas
const originalHomeHandler = PageHandlers.home;
PageHandlers.home = () => {
    originalHomeHandler();
    
    // Atualizar navegação inferior
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            // Remove classe active de todos os itens
            navItems.forEach(nav => nav.classList.remove('active'));
            // Adiciona classe active ao item clicado
            item.classList.add('active');
            
            // Navegar para a tela correspondente
            switch(index) {
                case 0: // Home
                    // Já está na home
                    break;
                case 1: // Agenda
                    Navigation.goTo('agenda.html');
                    break;
                case 2: // Pedidos
                    Navigation.goTo('appointment-history.html');
                    break;
                case 3: // Perfil
                    Navigation.goTo('profile.html');
                    break;
            }
        });
    });
};

// Adicionar estilos para modo escuro
const darkModeStyles = `
.dark-mode {
    background: #1a1a1a !important;
    color: #ffffff !important;
}

.dark-mode .container {
    background: #1a1a1a !important;
}

.dark-mode header,
.dark-mode .form-container,
.dark-mode .promo-card,
.dark-mode .category-item,
.dark-mode .specialist-item,
.dark-mode .calendar-section,
.dark-mode .notification-item,
.dark-mode .menu-section,
.dark-mode .history-item,
.dark-mode .summary-card,
.dark-mode .specialist-summary,
.dark-mode .appointment-details,
.dark-mode .payment-summary,
.dark-mode .payment-method {
    background: #2d2d2d !important;
    color: #ffffff !important;
}

.dark-mode .bottom-nav {
    background: #2d2d2d !important;
    border-top: 1px solid #404040;
}

.dark-mode .input-group input {
    background: #404040 !important;
    border-color: #555 !important;
    color: #ffffff !important;
}

.dark-mode .input-group input::placeholder {
    color: #aaa !important;
}

.dark-mode .day-cell,
.dark-mode .time-slot,
.dark-mode .payment-option {
    background: #404040 !important;
    border-color: #555 !important;
    color: #ffffff !important;
}

.dark-mode .menu-text h4,
.dark-mode .menu-text p,
.dark-mode h1, .dark-mode h2, .dark-mode h3, .dark-mode h4 {
    color: #ffffff !important;
}

.dark-mode .notification-content h4,
.dark-mode .notification-content p,
.dark-mode .service-info h4,
.dark-mode .service-info p {
    color: #ffffff !important;
}
`;

// Adicionar estilos de modo escuro ao documento
const darkStyleSheet = document.createElement('style');
darkStyleSheet.textContent = darkModeStyles;
document.head.appendChild(darkStyleSheet);

// Aplicar modo escuro se estiver salvo
document.addEventListener('DOMContentLoaded', () => {
    const isDarkMode = Storage.get('darkMode') || false;
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }
});

// Atualizar debug tools
window.debugApp = {
    ...window.debugApp,
    appointmentManager,
    notificationManager,
    showAppointments: () => {
        console.table(Storage.get('appointments') || []);
    },
    showNotifications: () => {
        console.table(Storage.get('notifications') || []);
    },
    toggleDarkMode: () => {
        const isDark = document.body.classList.contains('dark-mode');
        if (isDark) {
            document.body.classList.remove('dark-mode');
            Storage.set('darkMode', false);
        } else {
            document.body.classList.add('dark-mode');
            Storage.set('darkMode', true);
        }
    }
};

