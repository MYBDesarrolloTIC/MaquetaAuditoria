// assets/js/ListaAuditoria.js
document.addEventListener("DOMContentLoaded", () => {
    cargarVisitasPendientes();
});

async function cargarVisitasPendientes() {
    const contenedor = document.getElementById('contenedor-visitas');
    if (!contenedor) return;

    contenedor.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-danger" role="status"></div>
            <p class="mt-2 text-muted fw-bold">Cargando visitas pendientes...</p>
        </div>`;

    try {
        const res = await apiAuditoria.getPendientes();
        contenedor.innerHTML = '';

        if (res && res.status === 1 && res.data && res.data.length > 0) {
            res.data.forEach(item => {
                contenedor.innerHTML += `
                <div class="col-md-6 mb-4" id="tarjeta-visita-${item.id}">
                    <div class="card shadow-sm border-0 h-100" style="border-left: 5px solid var(--yb-blue) !important;">
                        <div class="card-body p-4">
                            <h5 class="card-title fw-bold text-black">${item.nombre_solicitante}</h5>
                            <h6 class="card-subtitle mb-3 text-muted">
                                <i class="fas fa-id-card me-1"></i> RUT: ${item.rut_solicitante} | 
                                <i class="fas fa-clock me-1 text-warning"></i> Hora: ${item.hora.substring(0, 5)}
                            </h6>
                            <p class="card-text bg-light p-3 rounded">
                                <strong class="text-primary"><i class="fas fa-comment-dots me-1"></i> Motivo de Consulta:</strong><br>
                                ${item.motivo}
                            </p>
                            <div class="d-flex justify-content-between mt-4">
                                <button type="button" class="btn btn-success fw-bold" onclick="cambiarEstadoVisita(${item.id}, 'Completada')">
                                    <i class="fas fa-check me-1"></i> Completada
                                </button>
                                <button type="button" class="btn btn-danger fw-bold" onclick="cambiarEstadoVisita(${item.id}, 'No Completada')">
                                    <i class="fas fa-times me-1"></i> Denegada
                                </button>
                            </div>
                        </div>
                    </div>
                </div>`;
            });
        } else {
            contenedor.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-success text-center fw-bold p-4 shadow-sm border-0">
                        <i class="fas fa-check-circle fs-2 text-success d-block mb-2"></i>
                        ¡Excelente! No tienes visitas pendientes en este momento.
                    </div>
                </div>`;
        }
    } catch (error) {
        contenedor.innerHTML = `<div class="col-12"><div class="alert alert-danger text-center">Error de conexión al cargar las visitas.</div></div>`;
    }
}

async function cambiarEstadoVisita(id, nuevo_estado) {
    const accion = nuevo_estado === 'Completada' ? 'completar' : 'denegar';
    
    if(confirm(`¿Estás seguro de ${accion} esta solicitud?`)) {
        const res = await apiAuditoria.cambiarEstado(id, nuevo_estado);
        
        if (res.status === 1) {
            const tarjeta = document.getElementById(`tarjeta-visita-${id}`);
            if (tarjeta) {
                tarjeta.style.transition = "opacity 0.3s ease, transform 0.3s ease";
                tarjeta.style.opacity = "0";
                tarjeta.style.transform = "scale(0.8)";
                
                setTimeout(() => {
                    // Refresca la lista completa desde la BD para asegurar que solo queden los Pendientes
                    cargarVisitasPendientes();
                }, 300);
            } else {
                cargarVisitasPendientes();
            }
        } else {
            alert("Error: " + res.message);
        }
    }
}