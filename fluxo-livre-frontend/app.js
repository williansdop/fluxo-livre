// ==========================================
// API CONFIGURATION
// ==========================================
// dev
// const API_BASE_URL = 'http://fluxo-livre-backend.test/api';

// prod
const API_BASE_URL = 'https://fluxo-livre-api.onrender.com';

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

    // 2. FETCH OBSTACLES (GET)
    async function loadObstacles() {
        try {
            const response = await fetch(`${API_BASE_URL}/obstacles`, {
                headers: { 'Accept': 'application/json' }
            });

            const results = await response.json();

            if (results.success) {
                markersGroup.clearLayers();

                results.data.forEach(obstaculo => {
                    const marker = L.marker([obstaculo.latitude, obstaculo.longitude]);
                    const conteudoPopup = `
                        <div style="font-family: sans-serif;">
                            <h3 style="margin: 0 0 5px 0;">${obstaculo.title}</h3>
                            <p style="margin: 0 0 5px 0; color: #555;">${obstaculo.description || 'No description'}</p>
                            <small><b>Category:</b> ${obstaculo.category ? obstaculo.category.title : 'General'}</small>
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

    loadObstacles();
    loadObstacleCategories();

    // 3. SUBMIT NEW OBSTACLE (POST)
    const modal = document.getElementById('modal-obstacle');
    const btnAdd = document.getElementById('btn-add-obstacle');
    const btnCancel = document.getElementById('btn-cancel');
    const form = document.getElementById('form-obstacle');

    let tempMarker = null;
    let isAddingMode = false;

    if (btnAdd) {
        btnAdd.addEventListener('click', () => {
            isAddingMode = true;
            alert('Click on the exact map location where you want to add the obstacle.');
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
            const categoryId = document.getElementById('obstacle_category_id').value;
            
            const payload = {
                title: document.getElementById('title').value,
                category_id: categoryId,
                description: document.getElementById('description').value,
                latitude: parseFloat(document.getElementById('latitude').value),
                longitude: parseFloat(document.getElementById('longitude').value)
            };

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
                    alert('Obstacle registered successfully!');
                    modal.classList.add('hidden');
                    form.reset();
                    if (tempMarker) map.removeLayer(tempMarker);
                    loadObstacles();
                } else {
                    const errorData = await response.json();
                    alert(errorData.message || 'Error saving obstacle.');
                }
            } catch (err) {
                console.error('Connection error:', err);
                alert('Could not connect to the API.');
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

            if (response.ok && data.token) {
                localStorage.setItem('auth_token', data.token);
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
            
            console.log('Resposta do Servidor:', result);

            const token = result.token || (result.data && result.data.token);

            if (response.ok && token) {
                localStorage.setItem('auth_token', token);
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
    if (!categorySelect) return;

    try {
        const response = await fetch(`${API_BASE_URL}/obstacle-categories`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        const result = await response.json();

        if (response.ok) {
            const categories = result.data || result;
            obstacleCategories = categories;

            categorySelect.innerHTML = '<option value="">Selecione uma categoria...</option>';

            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.title; 
                categorySelect.appendChild(option);
            });
        } else {
            console.error('Erro ao carregar categorias:', result.message);
            categorySelect.innerHTML = '<option value="">Erro ao carregar categorias</option>';
        }
    } catch (err) {
        console.error('Falha na requisição de categorias:', err);
        categorySelect.innerHTML = '<option value="">Erro de conexão</option>';
    }
}