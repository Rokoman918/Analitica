const API_URL = window.location.origin;

let currentUser = null;
let votosImpacto = 3;
let votosUrgencia = 2;
let votosActuales = { impacto: [], urgencia: [] };

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showTallerSection();
    }

    document.getElementById('registro-form').addEventListener('submit', handleRegistro);
    document.getElementById('btn-logout').addEventListener('click', handleLogout);
    document.getElementById('decision-form').addEventListener('submit', handleDecision);
    document.getElementById('pregunta-form').addEventListener('submit', handlePregunta);
    document.getElementById('friccion-form').addEventListener('submit', handleFriccion);

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.dataset.tab;
            switchTab(tab);
        });
    });
}

async function handleRegistro(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('nombre').value.trim();
    const area = document.getElementById('area').value.trim();
    const email = document.getElementById('email').value.trim();

    try {
        const response = await fetch(`${API_URL}/api/gerentes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, area, email })
        });

        const data = await response.json();
        
        if (data.success) {
            currentUser = { id: data.gerenteId, nombre, area, email };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showToast('¡Bienvenido al taller!', 'success');
            showTallerSection();
        } else {
            showToast('Error al registrar participante', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error de conexión', 'error');
    }
}

function handleLogout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    document.getElementById('registro-section').classList.remove('hidden');
    document.getElementById('taller-section').classList.add('hidden');
    document.getElementById('registro-form').reset();
}

function showTallerSection() {
    document.getElementById('registro-section').classList.add('hidden');
    document.getElementById('taller-section').classList.remove('hidden');
    document.getElementById('user-name').textContent = currentUser.nombre;
    document.getElementById('user-area').textContent = currentUser.area;
    
    loadDecisiones();
    loadPreguntas();
    loadFricciones();
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');

    if (tabName === 'modulo2') {
        loadMisDecisiones();
    } else if (tabName === 'modulo3') {
        loadMisPreguntas();
    } else if (tabName === 'modulo4') {
        loadVotacion();
    } else if (tabName === 'dashboard') {
        loadDashboard();
    }
}

async function handleDecision(e) {
    e.preventDefault();
    
    const decision = document.getElementById('decision').value.trim();
    const frecuencia = document.getElementById('frecuencia').value;
    const impacto = document.getElementById('impacto').value;

    try {
        const response = await fetch(`${API_URL}/api/decisiones`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                gerente_id: currentUser.id,
                decision,
                frecuencia,
                impacto
            })
        });

        const data = await response.json();
        
        if (data.success) {
            showToast('Decisión agregada correctamente', 'success');
            document.getElementById('decision-form').reset();
            loadDecisiones();
        } else {
            showToast('Error al agregar decisión', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error de conexión', 'error');
    }
}

async function loadDecisiones() {
    try {
        const response = await fetch(`${API_URL}/api/decisiones`);
        const data = await response.json();
        
        if (data.success) {
            renderDecisiones(data.data);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function renderDecisiones(decisiones) {
    const container = document.getElementById('decisiones-list');
    
    if (decisiones.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No hay decisiones registradas aún.</p>';
        return;
    }

    container.innerHTML = decisiones.map(d => `
        <div class="data-item">
            <div class="data-item-header">
                <div class="data-item-title">${d.decision}</div>
                <span class="badge badge-${d.impacto.toLowerCase()}">${d.impacto}</span>
            </div>
            <div class="data-item-meta">
                <strong>Frecuencia:</strong> ${d.frecuencia} | 
                <strong>Por:</strong> ${d.gerente_nombre} (${d.area})
            </div>
        </div>
    `).join('');
}

async function loadMisDecisiones() {
    try {
        const response = await fetch(`${API_URL}/api/decisiones`);
        const data = await response.json();
        
        if (data.success) {
            const misDecisiones = data.data.filter(d => d.gerente_id === currentUser.id);
            const selector = document.getElementById('decision-id');
            const infoBox = document.getElementById('mis-decisiones-info');
            
            if (misDecisiones.length === 0) {
                selector.innerHTML = '<option value="">No tienes decisiones creadas</option>';
                selector.disabled = true;
                infoBox.style.display = 'block';
            } else {
                selector.innerHTML = '<option value="">Selecciona una decisión...</option>' +
                    misDecisiones.map(d => `<option value="${d.id}">${d.decision} (${d.frecuencia} - ${d.impacto})</option>`).join('');
                selector.disabled = false;
                infoBox.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function handlePregunta(e) {
    e.preventDefault();
    
    const decision_id = document.getElementById('decision-id').value;
    const pregunta_clave = document.getElementById('pregunta-clave').value.trim();

    if (!decision_id) {
        showToast('Debes seleccionar una decisión', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/preguntas-criticas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                gerente_id: currentUser.id,
                decision_id: parseInt(decision_id),
                pregunta_clave
            })
        });

        const data = await response.json();
        
        if (data.success) {
            showToast('Pregunta agregada correctamente', 'success');
            document.getElementById('pregunta-form').reset();
            loadMisDecisiones();
            loadPreguntas();
        } else {
            showToast('Error al agregar pregunta', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error de conexión', 'error');
    }
}

async function loadPreguntas() {
    try {
        const response = await fetch(`${API_URL}/api/preguntas-criticas`);
        const data = await response.json();
        
        if (data.success) {
            renderPreguntas(data.data);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function renderPreguntas(preguntas) {
    const container = document.getElementById('preguntas-list');
    
    if (preguntas.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No hay preguntas registradas aún.</p>';
        return;
    }

    container.innerHTML = preguntas.map(p => `
        <div class="data-item">
            <div class="data-item-header">
                <div class="data-item-title">${p.pregunta_clave}</div>
            </div>
            ${p.decision_texto ? `<div style="margin-top: 0.5rem; padding: 0.5rem; background: #f1f5f9; border-radius: 6px;"><strong>📊 Decisión:</strong> ${p.decision_texto}</div>` : ''}
            <div class="data-item-meta">
                <strong>Por:</strong> ${p.gerente_nombre} (${p.area})
            </div>
        </div>
    `).join('');
}

async function loadMisPreguntas() {
    try {
        const response = await fetch(`${API_URL}/api/preguntas-criticas`);
        const data = await response.json();
        
        if (data.success) {
            const misPreguntas = data.data.filter(p => p.gerente_id === currentUser.id);
            const selector = document.getElementById('pregunta-critica-id');
            const infoBox = document.getElementById('mis-preguntas-info');
            
            if (misPreguntas.length === 0) {
                selector.innerHTML = '<option value="">No tienes preguntas creadas</option>';
                selector.disabled = true;
                infoBox.style.display = 'block';
            } else {
                selector.innerHTML = '<option value="">Selecciona una pregunta...</option>' +
                    misPreguntas.map(p => `<option value="${p.id}">${p.pregunta_clave.substring(0, 80)}${p.pregunta_clave.length > 80 ? '...' : ''}</option>`).join('');
                selector.disabled = false;
                infoBox.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function handleFriccion(e) {
    e.preventDefault();
    
    const pregunta_critica_id = document.getElementById('pregunta-critica-id').value;
    const situacion_actual = document.getElementById('situacion-actual').value.trim();
    const consecuencia = document.getElementById('consecuencia').value.trim();

    if (!pregunta_critica_id) {
        showToast('Debes seleccionar una pregunta crítica', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/fricciones`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                gerente_id: currentUser.id,
                pregunta_critica_id: parseInt(pregunta_critica_id),
                situacion_actual,
                consecuencia
            })
        });

        const data = await response.json();
        
        if (data.success) {
            showToast('Fricción agregada correctamente', 'success');
            document.getElementById('friccion-form').reset();
            loadMisPreguntas();
            loadFricciones();
        } else {
            showToast('Error al agregar fricción', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error de conexión', 'error');
    }
}

async function loadFricciones() {
    try {
        const response = await fetch(`${API_URL}/api/fricciones`);
        const data = await response.json();
        
        if (data.success) {
            renderFricciones(data.data);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function renderFricciones(fricciones) {
    const container = document.getElementById('fricciones-list');
    
    if (fricciones.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No hay fricciones registradas aún.</p>';
        return;
    }

    container.innerHTML = fricciones.map(f => `
        <div class="data-item">
            ${f.pregunta_texto ? `<div style="margin-bottom: 0.75rem; padding: 0.5rem; background: #eff6ff; border-left: 3px solid #3b82f6; border-radius: 6px;"><strong>❓ Pregunta Crítica:</strong> ${f.pregunta_texto}</div>` : ''}
            ${f.decision_texto ? `<div style="margin-bottom: 0.75rem; padding: 0.5rem; background: #f1f5f9; border-left: 3px solid #64748b; border-radius: 6px;"><strong>📊 Decisión:</strong> ${f.decision_texto}</div>` : ''}
            <div style="margin-top: 0.75rem;">
                <div style="margin-bottom: 0.5rem;"><strong>Hoy qué pasa:</strong> ${f.situacion_actual}</div>
                <div><strong>Consecuencia:</strong> ${f.consecuencia}</div>
            </div>
            <div class="data-item-meta">
                <strong>Por:</strong> ${f.gerente_nombre} (${f.area})
            </div>
        </div>
    `).join('');
}

async function loadVotacion() {
    try {
        const [preguntasRes, votosRes] = await Promise.all([
            fetch(`${API_URL}/api/preguntas-criticas`),
            fetch(`${API_URL}/api/votaciones/gerente/${currentUser.id}`)
        ]);

        const preguntasData = await preguntasRes.json();
        const votosData = await votosRes.json();

        if (preguntasData.success && votosData.success) {
            votosActuales = { impacto: [], urgencia: [] };
            
            votosData.data.forEach(voto => {
                if (voto.tipo_voto === 'impacto') {
                    votosActuales.impacto.push(voto.pregunta_critica_id);
                } else {
                    votosActuales.urgencia.push(voto.pregunta_critica_id);
                }
            });

            updateVotosRestantes();
            renderVotacion(preguntasData.data);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function updateVotosRestantes() {
    document.getElementById('votos-impacto-restantes').textContent = 3 - votosActuales.impacto.length;
    document.getElementById('votos-urgencia-restantes').textContent = 2 - votosActuales.urgencia.length;
}

function renderVotacion(preguntas) {
    const container = document.getElementById('votacion-list');
    
    if (preguntas.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No hay preguntas para votar aún.</p>';
        return;
    }

    container.innerHTML = preguntas.map(p => {
        const hasImpacto = votosActuales.impacto.includes(p.id);
        const hasUrgencia = votosActuales.urgencia.includes(p.id);
        const impactoDisabled = !hasImpacto && votosActuales.impacto.length >= 3;
        const urgenciaDisabled = !hasUrgencia && votosActuales.urgencia.length >= 2;

        return `
            <div class="votacion-item">
                <div class="votacion-pregunta">${p.pregunta_clave}</div>
                ${p.decision_texto ? `
                    <div style="margin: 0.75rem 0; padding: 0.75rem; background: #f1f5f9; border-left: 3px solid #64748b; border-radius: 6px;">
                        <strong style="color: #475569;">📊 Decisión relacionada:</strong>
                        <div style="margin-top: 0.25rem; color: #1e293b;">${p.decision_texto}</div>
                    </div>
                ` : ''}
                <div class="votacion-stats" style="margin-bottom: 0.75rem;">
                    <strong>Propuesta por:</strong> ${p.gerente_nombre} (${p.area})
                </div>
                <div class="votacion-buttons">
                    <button 
                        class="vote-btn impacto ${hasImpacto ? 'voted' : ''}" 
                        onclick="toggleVoto(${p.id}, 'impacto')"
                        ${impactoDisabled ? 'disabled' : ''}
                    >
                        🔵 ${hasImpacto ? 'Votado' : 'Votar'} Impacto
                    </button>
                    <button 
                        class="vote-btn urgencia ${hasUrgencia ? 'voted' : ''}" 
                        onclick="toggleVoto(${p.id}, 'urgencia')"
                        ${urgenciaDisabled ? 'disabled' : ''}
                    >
                        🔴 ${hasUrgencia ? 'Votado' : 'Votar'} Urgencia
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

async function toggleVoto(preguntaId, tipoVoto) {
    const hasVoted = votosActuales[tipoVoto].includes(preguntaId);

    try {
        if (hasVoted) {
            const response = await fetch(`${API_URL}/api/votaciones/${currentUser.id}/${preguntaId}/${tipoVoto}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            if (data.success) {
                votosActuales[tipoVoto] = votosActuales[tipoVoto].filter(id => id !== preguntaId);
                showToast('Voto eliminado', 'success');
            }
        } else {
            const response = await fetch(`${API_URL}/api/votaciones`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gerente_id: currentUser.id,
                    pregunta_critica_id: preguntaId,
                    tipo_voto: tipoVoto
                })
            });

            const data = await response.json();
            if (data.success) {
                votosActuales[tipoVoto].push(preguntaId);
                showToast('Voto registrado', 'success');
            }
        }

        updateVotosRestantes();
        loadVotacion();
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al procesar voto', 'error');
    }
}

async function loadDashboard() {
    try {
        const [statsRes, resumenRes] = await Promise.all([
            fetch(`${API_URL}/api/dashboard/stats`),
            fetch(`${API_URL}/api/votaciones/resumen`)
        ]);

        const statsData = await statsRes.json();
        const resumenData = await resumenRes.json();

        if (statsData.success) {
            renderStats(statsData.stats);
            renderCharts(statsData.stats);
        }

        if (resumenData.success) {
            renderTopPreguntas(resumenData.data);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function renderStats(stats) {
    document.getElementById('stat-gerentes').textContent = stats.totalGerentes;
    document.getElementById('stat-decisiones').textContent = stats.totalDecisiones;
    document.getElementById('stat-preguntas').textContent = stats.totalPreguntas;
    document.getElementById('stat-fricciones').textContent = stats.totalFricciones;
    document.getElementById('stat-votaciones').textContent = stats.totalVotaciones;
}

let chartImpacto = null;
let chartFrecuencia = null;

function renderCharts(stats) {
    const ctxImpacto = document.getElementById('chart-impacto');
    const ctxFrecuencia = document.getElementById('chart-frecuencia');

    if (chartImpacto) chartImpacto.destroy();
    if (chartFrecuencia) chartFrecuencia.destroy();

    const impactoLabels = stats.impacto.map(i => i.impacto);
    const impactoData = stats.impacto.map(i => i.cantidad);

    chartImpacto = new Chart(ctxImpacto, {
        type: 'doughnut',
        data: {
            labels: impactoLabels,
            datasets: [{
                data: impactoData,
                backgroundColor: [
                    '#10b981',
                    '#f59e0b',
                    '#ef4444',
                    '#991b1b'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    const frecuenciaLabels = stats.frecuencia.map(f => f.frecuencia);
    const frecuenciaData = stats.frecuencia.map(f => f.cantidad);

    chartFrecuencia = new Chart(ctxFrecuencia, {
        type: 'bar',
        data: {
            labels: frecuenciaLabels,
            datasets: [{
                label: 'Cantidad de Decisiones',
                data: frecuenciaData,
                backgroundColor: '#2563eb'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function renderTopPreguntas(preguntas) {
    const container = document.getElementById('top-preguntas-list');
    
    const top10 = preguntas.slice(0, 10);

    if (top10.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No hay votaciones registradas aún.</p>';
        return;
    }

    container.innerHTML = top10.map((p, index) => `
        <div class="top-pregunta-item">
            <div class="top-pregunta-rank">#${index + 1}</div>
            <div class="top-pregunta-content">
                <div class="top-pregunta-text">${p.pregunta_clave}</div>
                ${p.decision_relacionada ? `<div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Decisión: ${p.decision_relacionada}</div>` : ''}
                <div class="top-pregunta-votes">
                    <span>🔵 Impacto: <strong>${p.votos_impacto}</strong></span>
                    <span>🔴 Urgencia: <strong>${p.votos_urgencia}</strong></span>
                    <span>📊 Total: <strong>${p.total_votos}</strong></span>
                </div>
            </div>
        </div>
    `).join('');
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
