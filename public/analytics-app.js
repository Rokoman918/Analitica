const API_URL = window.location.origin;
let currentPanel = 'scoring';
let scoringData = [];
let cadenaData = [];
let crossData = [];
let chartAreas = null;
let chartFriccionesArea = null;

document.addEventListener('DOMContentLoaded', () => {
    loadScoring();
});

function showPanel(panel) {
    currentPanel = panel;
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.analytics-nav button').forEach(b => b.classList.remove('active'));
    document.getElementById(`panel-${panel}`).classList.add('active');
    event.target.classList.add('active');
    loadCurrentPanel();
}

function loadCurrentPanel() {
    switch (currentPanel) {
        case 'scoring': loadScoring(); break;
        case 'cadena': loadCadena(); break;
        case 'matrix': loadMatrix(); break;
        case 'heatmap': loadHeatmap(); break;
        case 'cross': loadCross(); break;
    }
}

// ========== SCORING ==========
async function loadScoring() {
    try {
        const res = await fetch(`${API_URL}/api/analytics/scoring`);
        const data = await res.json();
        if (data.success) {
            scoringData = data.data;
            renderScoring(scoringData);
        }
    } catch (e) { console.error('Error scoring:', e); }
}

function renderScoring(data) {
    if (data.length === 0) {
        document.getElementById('scoring-body').innerHTML = '<tr><td colspan="11" style="text-align:center;padding:2rem;color:#94a3b8;">No hay datos de scoring disponibles.</td></tr>';
        document.getElementById('scoring-summary').innerHTML = '';
        return;
    }

    const maxScore = Math.max(...data.map(d => d.score));
    const avgScore = (data.reduce((s, d) => s + d.score, 0) / data.length).toFixed(1);
    const topArea = data.length > 0 ? data[0].area : '-';

    document.getElementById('scoring-summary').innerHTML = `
        <div class="summary-card"><div class="number">${data.length}</div><div class="label">Preguntas Analizadas</div></div>
        <div class="summary-card"><div class="number">${maxScore.toFixed(1)}</div><div class="label">Score Máximo</div></div>
        <div class="summary-card"><div class="number">${avgScore}</div><div class="label">Score Promedio</div></div>
        <div class="summary-card"><div class="number">${topArea}</div><div class="label">Área Top #1</div></div>
    `;

    document.getElementById('scoring-body').innerHTML = data.map((d, i) => {
        const scoreClass = d.score >= maxScore * 0.7 ? 'score-high' : d.score >= maxScore * 0.4 ? 'score-medium' : 'score-low';
        return `<tr>
            <td><strong>${i + 1}</strong></td>
            <td><span class="score-badge ${scoreClass}">${d.score.toFixed(1)}</span></td>
            <td>${d.pregunta_clave}</td>
            <td>${d.decision || '-'}</td>
            <td>${d.area}</td>
            <td>${d.capa || '-'}</td>
            <td>${d.frecuencia}</td>
            <td><span class="badge badge-${d.impacto.toLowerCase()}">${d.impacto}</span></td>
            <td style="text-align:center;">${d.votos_impacto}</td>
            <td style="text-align:center;">${d.votos_urgencia}</td>
            <td style="text-align:center;">${d.num_fricciones}</td>
        </tr>`;
    }).join('');
}

// ========== CADENA COMPLETA ==========
async function loadCadena() {
    try {
        const capa = document.getElementById('filter-capa').value;
        const res = await fetch(`${API_URL}/api/analytics/cadena-completa?capa=${encodeURIComponent(capa)}`);
        const data = await res.json();
        if (data.success) {
            cadenaData = data.data;
            renderCadena(cadenaData);
        }
    } catch (e) { console.error('Error cadena:', e); }
}

function renderCadena(data) {
    if (data.length === 0) {
        document.getElementById('cadena-body').innerHTML = '<tr><td colspan="10" style="text-align:center;padding:2rem;color:#94a3b8;">No hay datos disponibles.</td></tr>';
        return;
    }
    document.getElementById('cadena-body').innerHTML = data.map(d => `<tr>
        <td><strong>${d.nombre || '-'}</strong></td>
        <td>${d.area || '-'}</td>
        <td>${d.capa || '-'}</td>
        <td>${d.decision || '-'}</td>
        <td>${d.frecuencia || '-'}</td>
        <td>${d.impacto ? `<span class="badge badge-${d.impacto.toLowerCase()}">${d.impacto}</span>` : '-'}</td>
        <td>${d.pregunta_clave || '-'}</td>
        <td style="text-align:center;">${d.total_votos > 0 ? `🔵${d.votos_impacto} 🔴${d.votos_urgencia}` : '-'}</td>
        <td>${d.situacion_actual || '-'}</td>
        <td>${d.consecuencia || '-'}</td>
    </tr>`).join('');
}

// ========== MATRIZ 2x2 ==========
async function loadMatrix() {
    try {
        const res = await fetch(`${API_URL}/api/analytics/scoring`);
        const data = await res.json();
        if (data.success) renderMatrix(data.data);
    } catch (e) { console.error('Error matrix:', e); }
}

function renderMatrix(data) {
    const container = document.getElementById('matrix-container');
    // Remove old dots
    container.querySelectorAll('.matrix-dot').forEach(d => d.remove());

    const questionsWithVotes = data.filter(d => d.total_votos > 0);
    if (questionsWithVotes.length === 0) return;

    const maxImpacto = Math.max(...questionsWithVotes.map(d => d.votos_impacto), 1);
    const maxUrgencia = Math.max(...questionsWithVotes.map(d => d.votos_urgencia), 1);
    const containerRect = container.getBoundingClientRect();
    const w = container.offsetWidth;
    const h = container.offsetHeight;

    const areaColors = {};
    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];
    let colorIdx = 0;

    questionsWithVotes.forEach(d => {
        if (!areaColors[d.area]) areaColors[d.area] = colors[colorIdx++ % colors.length];
        const x = (d.votos_impacto / maxImpacto) * (w * 0.85) + (w * 0.075);
        const y = h - ((d.votos_urgencia / maxUrgencia) * (h * 0.85) + (h * 0.075));

        const dot = document.createElement('div');
        dot.className = 'matrix-dot';
        dot.style.left = `${x}px`;
        dot.style.bottom = `${h - y}px`;
        dot.style.background = areaColors[d.area];
        dot.style.width = `${Math.max(12, d.total_votos * 4)}px`;
        dot.style.height = `${Math.max(12, d.total_votos * 4)}px`;

        dot.addEventListener('mouseenter', (e) => {
            const tooltip = document.getElementById('matrix-tooltip');
            tooltip.innerHTML = `<strong>${d.pregunta_clave}</strong><br>
                📊 Decisión: ${d.decision}<br>
                👤 ${d.gerente_nombre} (${d.area})<br>
                🔵 Impacto: ${d.votos_impacto} | 🔴 Urgencia: ${d.votos_urgencia}<br>
                🏆 Score: ${d.score.toFixed(1)}`;
            tooltip.style.display = 'block';
            tooltip.style.left = `${e.pageX + 15}px`;
            tooltip.style.top = `${e.pageY - 10}px`;
        });
        dot.addEventListener('mouseleave', () => {
            document.getElementById('matrix-tooltip').style.display = 'none';
        });

        container.appendChild(dot);
    });
}

// ========== HEATMAP ==========
async function loadHeatmap() {
    try {
        const res = await fetch(`${API_URL}/api/analytics/heatmap`);
        const data = await res.json();
        if (data.success) renderHeatmap(data.data);
    } catch (e) { console.error('Error heatmap:', e); }
}

function renderHeatmap(data) {
    const frecuencias = ['Diaria', 'Semanal', 'Quincenal', 'Mensual', 'Trimestral', 'Anual'];
    const impactos = ['Bajo', 'Medio', 'Alto', 'Crítico'];

    const matrix = {};
    frecuencias.forEach(f => { matrix[f] = {}; impactos.forEach(i => { matrix[f][i] = 0; }); });
    data.forEach(d => { if (matrix[d.frecuencia]) matrix[d.frecuencia][d.impacto] = d.cantidad; });

    const maxVal = Math.max(...data.map(d => d.cantidad), 1);

    let html = '<div class="heatmap-cell heatmap-header"></div>';
    impactos.forEach(i => { html += `<div class="heatmap-cell heatmap-header">${i}</div>`; });

    frecuencias.forEach(f => {
        html += `<div class="heatmap-cell heatmap-label">${f}</div>`;
        impactos.forEach(i => {
            const val = matrix[f][i];
            const level = val === 0 ? 0 : Math.min(5, Math.ceil((val / maxVal) * 5));
            html += `<div class="heatmap-cell heat-${level}">${val > 0 ? val : '-'}</div>`;
        });
    });

    document.getElementById('heatmap-grid').innerHTML = html;
}

// ========== CROSS-FUNCIONAL ==========
async function loadCross() {
    try {
        const res = await fetch(`${API_URL}/api/analytics/cross-funcional`);
        const data = await res.json();
        if (data.success) {
            crossData = data.data;
            renderCross(crossData);
        }
    } catch (e) { console.error('Error cross:', e); }
}

function renderCross(data) {
    if (data.length === 0) {
        document.getElementById('cross-body').innerHTML = '<tr><td colspan="8" style="text-align:center;padding:2rem;color:#94a3b8;">No hay datos.</td></tr>';
        return;
    }

    document.getElementById('cross-body').innerHTML = data.map(d => `<tr>
        <td><strong>${d.area}</strong></td>
        <td>${d.capa || '-'}</td>
        <td style="text-align:center;">${d.total_gerentes}</td>
        <td style="text-align:center;">${d.total_decisiones}</td>
        <td style="text-align:center;">${d.total_preguntas}</td>
        <td style="text-align:center;font-weight:700;color:${d.total_fricciones > 2 ? '#ef4444' : '#10b981'}">${d.total_fricciones}</td>
        <td style="text-align:center;">${d.decisiones_criticas}</td>
        <td style="text-align:center;">${d.decisiones_altas}</td>
    </tr>`).join('');

    // Charts
    const areas = data.map(d => d.area);
    const bgColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

    if (chartAreas) chartAreas.destroy();
    chartAreas = new Chart(document.getElementById('chart-areas'), {
        type: 'bar',
        data: {
            labels: areas,
            datasets: [
                { label: 'Decisiones', data: data.map(d => d.total_decisiones), backgroundColor: '#3b82f6' },
                { label: 'Preguntas', data: data.map(d => d.total_preguntas), backgroundColor: '#10b981' },
                { label: 'Fricciones', data: data.map(d => d.total_fricciones), backgroundColor: '#ef4444' }
            ]
        },
        options: { responsive: true, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
    });

    if (chartFriccionesArea) chartFriccionesArea.destroy();
    chartFriccionesArea = new Chart(document.getElementById('chart-fricciones-area'), {
        type: 'doughnut',
        data: {
            labels: areas,
            datasets: [{ data: data.map(d => d.total_fricciones), backgroundColor: bgColors.slice(0, areas.length) }]
        },
        options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });
}

// ========== CLASIFICACIÓN IA ==========
async function clasificarFricciones() {
    const container = document.getElementById('ai-results');
    container.innerHTML = `<div class="ai-loading"><div class="spinner"></div><p>🧠 Analizando fricciones con OpenAI...</p><p style="font-size:0.85rem;color:#94a3b8;">Esto puede tomar 10-30 segundos</p></div>`;

    try {
        const res = await fetch(`${API_URL}/api/analytics/clasificar-fricciones`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
        const data = await res.json();

        if (!data.success) {
            container.innerHTML = `<div style="padding:2rem;text-align:center;color:#ef4444;"><p>❌ ${data.error}</p></div>`;
            return;
        }

        if (data.data.length === 0) {
            container.innerHTML = `<div style="padding:2rem;text-align:center;color:#94a3b8;"><p>No hay fricciones para analizar.</p></div>`;
            return;
        }

        // Summary by category
        const categorias = {};
        data.data.forEach(d => {
            const cat = d.clasificacion.categoria || 'SIN CLASIFICAR';
            categorias[cat] = (categorias[cat] || 0) + 1;
        });

        let summaryHtml = '<div class="summary-cards">';
        Object.entries(categorias).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
            summaryHtml += `<div class="summary-card"><div class="number">${count}</div><div class="label">${cat}</div></div>`;
        });
        summaryHtml += '</div>';

        let cardsHtml = data.data.map(d => {
            const c = d.clasificacion;
            const catClass = `cat-${(c.categoria || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`;
            return `<div class="ai-card">
                <div class="ai-card-header">
                    <div>
                        <span class="ai-categoria ${catClass}">${c.categoria || 'N/A'}</span>
                        <span style="margin-left:0.5rem;font-size:0.85rem;color:#64748b;">Esfuerzo: <strong>${c.esfuerzo || 'N/A'}</strong> | Solución: <strong>${c.tipo_solucion || 'N/A'}</strong></span>
                    </div>
                    <span style="font-size:0.8rem;color:#94a3b8;">${d.area} (${d.capa || '-'})</span>
                </div>
                <div class="ai-meta">
                    <strong>Decisión:</strong> ${d.decision || 'N/A'} → <strong>Pregunta:</strong> ${d.pregunta_clave || 'N/A'}
                </div>
                <div style="margin-bottom:0.5rem;"><strong>Situación:</strong> ${d.situacion_actual} | <strong>Consecuencia:</strong> ${d.consecuencia}</div>
                <div class="ai-accion">💡 <strong>Acción recomendada:</strong> ${c.accion || 'N/A'}</div>
                ${c.insight ? `<div style="margin-top:0.5rem;font-size:0.85rem;color:#64748b;font-style:italic;">🔍 ${c.insight}</div>` : ''}
            </div>`;
        }).join('');

        container.innerHTML = summaryHtml + cardsHtml;
    } catch (e) {
        container.innerHTML = `<div style="padding:2rem;text-align:center;color:#ef4444;"><p>❌ Error de conexión: ${e.message}</p></div>`;
    }
}

// ========== EXPORTAR ==========
function exportCSV(tabla) {
    window.open(`${API_URL}/api/analytics/export/csv?tabla=${tabla}`, '_blank');
}

function exportJSON() {
    window.open(`${API_URL}/api/analytics/export/json`, '_blank');
}

// ========== FILTRO DE TEXTO ==========
function filterTable() {
    const search = document.getElementById('filter-search').value.toLowerCase();
    const activePanel = document.querySelector('.panel.active');
    if (!activePanel) return;
    const rows = activePanel.querySelectorAll('.data-table tbody tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(search) ? '' : 'none';
    });
}
