// ==========================================
// FUNCIONES GLOBALES (Pueden ser llamadas desde el HTML)
// ==========================================

function togglePin() {
    const sidebar = document.getElementById("mySidebar");
    const toggleBtn = document.querySelector(".menu-toggle-btn");
    
    if (sidebar) {
        sidebar.classList.toggle("pinned");
        
        if (sidebar.classList.contains("pinned")) {
            localStorage.setItem("sidebarPinned", "true");
        } else {
            localStorage.setItem("sidebarPinned", "false");
        }

        if (toggleBtn) {
            const icon = toggleBtn.querySelector("i");
            if (icon) {
                if (sidebar.classList.contains("pinned")) {
                    icon.classList.remove("fa-bars");
                    icon.classList.add("fa-times");
                } else {
                    icon.classList.remove("fa-times");
                    icon.classList.add("fa-bars");
                }
            }
        }
    }
}

function cerrarSesion() {
    localStorage.removeItem('jwt_token');
    window.location.href = "VistaLogin.php"; 
}

function obtenerRolUsuario() {
    const token = localStorage.getItem('jwt_token');
    if (!token) return null;
    
    try {
        const payloadBase64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const payloadJson = decodeURIComponent(atob(payloadBase64).split('').map(c => 
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join(''));
        
        return JSON.parse(payloadJson).data.rol.toLowerCase();
    } catch (e) {
        console.error("Error al decodificar token", e);
        return null;
    }
}

// ==========================================
// LÓGICA AL CARGAR LA PÁGINA
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    
    // --- 1. RESTAURAR ESTADO DEL MENÚ (PINNED) ---
    const sidebar = document.getElementById("mySidebar");
    const toggleBtn = document.querySelector(".menu-toggle-btn");
    const isPinned = localStorage.getItem("sidebarPinned");
    
    if (sidebar && isPinned === "true") {
        sidebar.classList.add("pinned");
        if(toggleBtn){
            const icon = toggleBtn.querySelector("i");
            if(icon){
                icon.classList.remove("fa-bars");
                icon.classList.add("fa-times");
            }
        }
    }

    // --- 2. FILTRADO DE MENÚ POR ROLES ---
    const rolActual = obtenerRolUsuario();

    if (!rolActual) {
        window.location.href = "VistaLogin.php";
        return;
    }

    const navLinks = document.querySelectorAll('.nav-link-yb');
    
    navLinks.forEach(link => {
        const dataRoles = link.getAttribute('data-roles');
        
        if (dataRoles) {
            const rolesPermitidos = dataRoles.split(',');
            if (!rolesPermitidos.includes(rolActual)) {
                link.style.display = 'none';
            }
        }
    });

    // --- 3. MARCAR EL BOTÓN ACTIVO EN AZUL (NUEVO MÉTODO) ---
    // Obtenemos solo la ruta de la página actual (ej: /view/VistaGestionAuditoria.php)
    const currentPath = window.location.pathname.toLowerCase();
    
    console.log("📍 ESTÁS EN LA PÁGINA:", currentPath); // <-- Esto saldrá en la consola

    navLinks.forEach(link => {
        // Obtenemos el atributo exacto que escribiste en el HTML
        const rawHref = link.getAttribute('href'); 
        
        if (rawHref && rawHref !== "#") {
            const cleanHref = rawHref.toLowerCase(); // ej: vistagestionauditoria.php
            
            // Verificamos si la ruta actual termina con el nombre de ese archivo
            if (currentPath.endsWith(cleanHref)) {
                console.log("✅ HIZO MATCH CON EL BOTÓN:", cleanHref); // <-- Mensaje de éxito
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        }
    });
});