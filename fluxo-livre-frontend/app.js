// ==========================================
// API CONFIGURATION
// ==========================================
// dev
const API_BASE_URL = 'http://fluxo-livre-backend.test/api';

// prod
// const API_BASE_URL = 'https://fluxo-livre-api.onrender.com/api';

// Production environment
// const API_BASE_URL = 'https://xxxx.railway.app/api';

// ==========================================
// MAP & OBSTACLES (ONLY RUNS ON MAP PAGE)
// ==========================================
const mapElement = document.getElementById('map');

if (mapElement) {
    // 1. MAP AND TILES INITIALIZATION
    const map = L.map('map').setView([-25.4284, -49.2733], 13);

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri'
    }).addTo(map);

    let markersGroup = L.layerGroup().addTo(map);

    // USER CURRENT LOCATION
    let userLocationMarker = null;

    const userLocationIcon = L.divIcon({
        className: 'user-location-wrapper',
        html: `
            <div class="user-location-marker">
                <div class="pulse-ring"></div>
                <div class="location-dot"></div>
            </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });

    function updateUserLocation(lat, lng, panTo = false) {
        if (!userLocationMarker) {
            userLocationMarker = L.marker([lat, lng], {
                icon: userLocationIcon,
                zIndexOffset: 1000,
                title: 'Sua localização atual'
            }).addTo(map);

            userLocationMarker.bindPopup('<b>Você está aqui</b>');
        } else {
            userLocationMarker.setLatLng([lat, lng]);
        }

        if (panTo) {
            map.flyTo([lat, lng], 15, { duration: 1.2 });
        }
    }

    function locateUser(panTo = false) {
        if (!navigator.geolocation) {
            if (panTo) alert('Geolocalização não é suportada pelo seu navegador.');
            return;
        }

        const handleSuccess = (position) => {
            const { latitude, longitude } = position.coords;
            updateUserLocation(latitude, longitude, panTo);
        };

        const tryLowAccuracy = () => {
            navigator.geolocation.getCurrentPosition(
                handleSuccess,
                (error) => {
                    console.warn('Erro ao obter localização do usuário:', error.message);
                    if (panTo) {
                        alert('Não foi possível obter sua localização. Verifique as permissões de localização do navegador.');
                    }
                },
                {
                    enableHighAccuracy: false,
                    timeout: 15000,
                    maximumAge: 300000
                }
            );
        };

        navigator.geolocation.getCurrentPosition(
            handleSuccess,
            (error) => {
                if (error.code === error.TIMEOUT || error.code === error.POSITION_UNAVAILABLE) {
                    tryLowAccuracy();
                } else {
                    console.warn('Erro ao obter localização do usuário:', error.message);
                    if (panTo) {
                        alert('Permissão de localização negada ou indisponível.');
                    }
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 60000
            }
        );
    }

    // Try locating user on load
    locateUser(false);

    const btnLocateMe = document.getElementById('btn-locate-me');
    if (btnLocateMe) {
        btnLocateMe.addEventListener('click', () => locateUser(true));
    }

    // 2. FETCH OBSTACLES (GET)
    async function loadObstacles() {
        try {
            const response = await fetch(`${API_BASE_URL}/obstacles`, {
                headers: { 'Accept': 'application/json' }
            });

            const results = await response.json();

            if (results.success) {
                markersGroup.clearLayers();

                const currentUserId = localStorage.getItem('user_id'); 
        
                if (!results.data || results.data.length === 0) {
                    console.log('Nenhum obstáculo no banco.');
                    return; 
                }

                results.data.forEach(obstaculo => {
                    const marker = L.marker([obstaculo.latitude, obstaculo.longitude]);
                    
                    const isOwner = currentUserId && parseInt(currentUserId, 10) === parseInt(obstaculo.user_id, 10);
                    
                    const safeTitle = (obstaculo.title || '').replace(/'/g, "\\'");
                    const safeDescription = (obstaculo.description || '').replace(/'/g, "\\'").replace(/\n/g, ' ');

                    const actionButtons = isOwner ? `
                        <div style="margin-top: 10px; display: flex; gap: 6px;">
                            <button onclick="openEditModal(${obstaculo.id}, '${safeTitle}', '${safeDescription}', ${obstaculo.category_id || "''"})" 
                                    style="background: #1E5CFA; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                                Editar
                            </button>
                            <button onclick="deleteObstacle(${obstaculo.id})" 
                                    style="background: #e11d48; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                                Excluir
                            </button>
                        </div>
                    ` : '';

                    const conteudoPopup = `
                        <div style="font-family: sans-serif;">
                            <h3 style="margin: 0 0 5px 0;">${obstaculo.title}</h3>
                            <p style="margin: 0 0 5px 0; color: #555;">${obstaculo.description || 'Sem descrição'}</p>
                            <small><b>Categoria:</b> ${obstaculo.category ? obstaculo.category.title : 'Geral'}</small>
                            ${actionButtons}
                        </div>
                    `;
                    marker.bindPopup(conteudoPopup);
                    markersGroup.addLayer(marker);
                });
            }
        } catch (erro) {
            console.error('Error fetching obstacles:', erro);
        }
    }

    window.loadObstacles = loadObstacles;

    loadObstacles();
    loadObstacleCategories();

    // 3. SUBMIT NEW OBSTACLE (POST)
    const modal = document.getElementById('modal-obstacle');
    const modalAuthWarning = document.getElementById('modal-auth-warning');
    const btnBackToMap = document.getElementById('btn-back-to-map');
    const btnAdd = document.getElementById('btn-add-obstacle');
    const btnCancel = document.getElementById('btn-cancel');
    const form = document.getElementById('form-obstacle');

    let tempMarker = null;
    let isAddingMode = false;

    if (btnBackToMap && modalAuthWarning) {
        btnBackToMap.addEventListener('click', () => {
            modalAuthWarning.classList.add('hidden');
        });
    }

    if (modalAuthWarning) {
        modalAuthWarning.addEventListener('click', (e) => {
            if (e.target === modalAuthWarning) {
                modalAuthWarning.classList.add('hidden');
            }
        });
    }

    if (btnAdd) {
        btnAdd.addEventListener('click', () => {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                if (modalAuthWarning) {
                    modalAuthWarning.classList.remove('hidden');
                }
                return;
            }

            isAddingMode = true;
            alert('Clique no local exato do mapa onde deseja adicionar o obstáculo.');
        });
    }

    if (btnCancel) {
        btnCancel.addEventListener('click', () => {
            modal.classList.add('hidden');
            isAddingMode = false;
            if (tempMarker) map.removeLayer(tempMarker);
        });
    }

    map.on('click', (e) => {
        if (!isAddingMode) return;

        const { lat, lng } = e.latlng;
        
        document.getElementById('latitude').value = lat.toFixed(6);
        document.getElementById('longitude').value = lng.toFixed(6);

        if (tempMarker) map.removeLayer(tempMarker);
        tempMarker = L.marker([lat, lng]).addTo(map);

        modal.classList.remove('hidden');
        isAddingMode = false;
    });

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const authToken = localStorage.getItem('auth_token');
            if (!authToken) {
                modal.classList.add('hidden');
                if (modalAuthWarning) {
                    modalAuthWarning.classList.remove('hidden');
                } else {
                    alert('Você não está autenticado.');
                }
                return;
            }
            const categoryId = document.getElementById('obstacle_category_id').value;
            
            const userId = localStorage.getItem('user_id');
            const payload = {
                title: document.getElementById('title').value,
                category_id: categoryId,
                description: document.getElementById('description').value,
                latitude: parseFloat(document.getElementById('latitude').value),
                longitude: parseFloat(document.getElementById('longitude').value)
            };
            if (userId) {
                payload.user_id = parseInt(userId, 10);
            }

            try {
                const response = await fetch(`${API_BASE_URL}/obstacles/create`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    alert('Obstáculo registrado com sucesso!');
                    modal.classList.add('hidden');
                    form.reset();
                    if (tempMarker) map.removeLayer(tempMarker);
                    loadObstacles();
                } else {
                    const errorData = await response.json();
                    alert(errorData.message || 'Erro ao salvar obstáculo.');
                }
            } catch (err) {
                console.error('Connection error:', err);
                alert('Não foi possível conectar à API.');
            }
        });
    }
}

// ==========================================
// AUTHENTICATION (LOGIN)
// ==========================================
const loginForm = document.getElementById('form-login');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const payload = {
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        };

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            const token = data.token || (data.data && data.data.token);
            const user = data.user || (data.data && data.data.user);
            const firstName = (user && user.first_name) || (data.data && data.data.first_name);
            const userId = (user && user.id) || (data.data && (data.data.id || data.data.user_id));

            if (response.ok && token) {
                localStorage.setItem('auth_token', token);
                if (firstName) {
                    localStorage.setItem('user_first_name', firstName);
                }
                if (userId) {
                    localStorage.setItem('user_id', userId);
                }
                alert('Login efetuado com sucesso!');
                window.location.href = 'map.html';
            } else {
                alert(data.message || 'Falha na autenticação. Verifique os dados.');
            }
        } catch (err) {
            console.error('Login error:', err);
            alert('Não foi possível conectar ao servidor.');
        }
    });
}

// ==========================================
// USER REGISTRATION (REGISTER)
// ==========================================
const registerForm = document.getElementById('form-register');

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const password = document.getElementById('password').value;
        const passwordConfirmation = document.getElementById('password_confirmation').value;

        if (password !== passwordConfirmation) {
            alert('As senhas não coincidem!');
            return;
        }

        const payload = {
            first_name: document.getElementById('first_name').value,
            last_name: document.getElementById('last_name').value,
            cpf: document.getElementById('cpf').value,
            email: document.getElementById('email').value,
            password: password
        };

        try {
            const response = await fetch(`${API_BASE_URL}/sign-up`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            const token = result.token || (result.data && result.data.token);
            const user = result.user || (result.data && result.data.user);
            const firstName = (user && user.first_name) || (result.data && result.data.first_name) || document.getElementById('first_name').value;
            const userId = (user && user.id) || (result.data && (result.data.id || result.data.user_id));

            if (response.ok && token) {
                localStorage.setItem('auth_token', token);
                if (firstName) {
                    localStorage.setItem('user_first_name', firstName);
                }
                if (userId) {
                    localStorage.setItem('user_id', userId);
                }
                alert('Conta criada com sucesso!');
                
                window.location.assign('map.html');
            } else {
                alert(result.message || 'Erro ao realizar cadastro. Verifique os dados.');
            }
        } catch (err) {
            console.error('Registration error:', err);
            alert('Não foi possível conectar ao servidor.');
        }
    });
}

// ==========================================
// RETRIEVING OBSTACLE CATEGORIES
// ==========================================
let obstacleCategories = [];

async function loadObstacleCategories() {
    const categorySelect = document.getElementById('obstacle_category_id');
    const editCategorySelect = document.getElementById('edit-category-id');

    try {
        const response = await fetch(`${API_BASE_URL}/obstacle-categories`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        const result = await response.json();

        if (response.ok) {
            const categories = result.data || result;
            obstacleCategories = categories;

            const optionsHtml = '<option value="">Selecione uma categoria...</option>' + 
                categories.map(cat => `<option value="${cat.id}">${cat.title}</option>`).join('');

            if (categorySelect) categorySelect.innerHTML = optionsHtml;
            if (editCategorySelect) editCategorySelect.innerHTML = optionsHtml;
        }
    } catch (err) {
        console.error('Falha na requisição de categorias:', err);
        if (categorySelect) categorySelect.innerHTML = '<option value="">Erro de conexão</option>';
        if (editCategorySelect) editCategorySelect.innerHTML = '<option value="">Erro de conexão</option>';
    }
}

// ==========================================
// USER AUTH STATE & TOP BAR
// ==========================================
async function initUserHeader() {
    const userHeader = document.getElementById('user-header');
    if (!userHeader) return;

    const token = localStorage.getItem('auth_token');
    let firstName = localStorage.getItem('user_first_name');

    if (!token) {
        userHeader.innerHTML = `
            <a href="login.html" class="header-login-btn">
                <span>Entrar</span>
            </a>
        `;
        return;
    }

    if (!firstName) {
        try {
            const res = await fetch(`${API_BASE_URL}/me`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                firstName = (data.data && data.data.first_name) || data.first_name;
                const userId = (data.data && data.data.id) || data.id;
                if (firstName) {
                    localStorage.setItem('user_first_name', firstName);
                }
                if (userId) {
                    localStorage.setItem('user_id', userId);
                }
            } else if (res.status === 401) {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_first_name');
                localStorage.removeItem('user_id');
                initUserHeader();
                return;
            }
        } catch (e) {
            console.warn('Could not fetch user details:', e);
        }
    }

    const displayName = firstName || 'Usuário';

    userHeader.innerHTML = `
        <button type="button" class="user-pill-btn" id="btn-user-profile" title="Clique para sair">
            <svg class="user-pill-icon" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span class="user-pill-name">${displayName}</span>
            <span class="user-pill-logout-badge">Sair</span>
        </button>
    `;

    const btnProfile = document.getElementById('btn-user-profile');
    if (btnProfile) {
        btnProfile.addEventListener('click', handleLogout);
    }
}

async function handleLogout() {
    const firstName = localStorage.getItem('user_first_name') || 'usuário';
    const confirmed = confirm(`Deseja realmente sair da sua conta, ${firstName}?`);
    if (!confirmed) return;

    const token = localStorage.getItem('auth_token');

    try {
        if (token) {
            await fetch(`${API_BASE_URL}/logout`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
        }
    } catch (err) {
        console.error('Logout error:', err);
    } finally {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_first_name');
        localStorage.removeItem('user_id');
        initUserHeader();
        if (typeof window.loadObstacles === 'function') {
            window.loadObstacles();
        }
    }
}

initUserHeader();

// ==========================================
// PASSWORD VISIBILITY TOGGLE
// ==========================================
function initPasswordToggles() {
    const toggleButtons = document.querySelectorAll('.btn-toggle-password');
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const wrapper = btn.closest('.password-wrapper');
            if (!wrapper) return;
            const input = wrapper.querySelector('input');
            if (!input) return;

            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';

            const iconEye = btn.querySelector('.icon-eye');
            const iconEyeOff = btn.querySelector('.icon-eye-off');
            if (iconEye && iconEyeOff) {
                iconEye.classList.toggle('hidden', isPassword);
                iconEyeOff.classList.toggle('hidden', !isPassword);
            }
            btn.setAttribute('aria-label', isPassword ? 'Ocultar senha' : 'Ver senha');
            input.focus();
        });
    });
}

initPasswordToggles();

// ==========================================
// DELETE & EDIT OBSTACLE
// ==========================================
window.deleteObstacle = async function(id) {
    if (!confirm('Tem certeza que deseja excluir este obstáculo?')) return;

    const token = localStorage.getItem('auth_token');

    try {
        const response = await fetch(`${API_BASE_URL}/obstacles/${id}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (response.ok) {
            alert('Obstáculo excluído com sucesso!');
            if (window.loadObstacles) window.loadObstacles();
        } else {
            alert(result.message || 'Erro ao excluir obstáculo.');
        }
    } catch (err) {
        console.error('Delete error:', err);
        alert('Não foi possível conectar ao servidor.');
    }
};

window.openEditModal = function(id, title, description, categoryId) {
    document.getElementById('edit-obstacle-id').value = id;
    document.getElementById('edit-title').value = title;
    document.getElementById('edit-description').value = description;
    document.getElementById('edit-category-id').value = categoryId || '';

    document.getElementById('modal-edit-obstacle').classList.remove('hidden');
};

// EDIT FORM SUBMISSION
const editForm = document.getElementById('form-edit-obstacle');
if (editForm) {
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('edit-obstacle-id').value;
        const token = localStorage.getItem('auth_token');

        const payload = {
            title: document.getElementById('edit-title').value,
            description: document.getElementById('edit-description').value,
            category_id: document.getElementById('edit-category-id').value
        };

        try {
            const response = await fetch(`${API_BASE_URL}/obstacles/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                alert('Obstáculo atualizado!');
                document.getElementById('modal-edit-obstacle').classList.add('hidden');
                if (window.loadObstacles) window.loadObstacles();
            } else {
                alert(result.message || 'Erro ao atualizar obstáculo.');
            }
        } catch (err) {
            console.error('Update error:', err);
            alert('Não foi possível conectar ao servidor.');
        }
    });
}