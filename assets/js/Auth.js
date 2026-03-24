// assets/js/Auth.js

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

function verificarAcceso() {
    const token = localStorage.getItem('jwt_token');
    const currentPath = window.location.pathname.toLowerCase();
    const isLogin = currentPath.includes('vistalogin.php');

    // 1. Si no hay token y no es el login, patada al login
    if (!token) {
        if (!isLogin) window.location.replace("VistaLogin.php");
        return;
    }

    // 2. Desencriptar token y validar expiración
    const decoded = parseJwt(token);
    if (!decoded || decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem('jwt_token');
        if (!isLogin) {
            alert("Tu sesión ha expirado.");
            window.location.replace("VistaLogin.php");
        }
        return;
    }

    const rol = decoded.data.rol.toLowerCase();

    // 3. Redirigir si está en el login pero ya tiene sesión válida
    if (isLogin) {
        redirigirSegunRol(rol);
        return;
    }

    // 4. Lógica de validación por vista
    if (currentPath.includes('vistausuario.php')) {
        if (rol !== 'admin') expulsar(rol);
    } 
    else if (currentPath.includes('vistagestionauditoria.php') || currentPath.includes('vistahistorialauditoria.php')) {
        if (rol !== 'admin' && rol !== 'secretaria') expulsar(rol);
    }
    else if (currentPath.includes('vistalistaauditoria.php')) {
        if (rol !== 'admin' && rol !== 'alcalde') expulsar(rol);
    }
}

function expulsar(rol) {
    alert("Acceso denegado. No tienes permisos de " + rol + " para ver esta página.");
    redirigirSegunRol(rol);
}

function redirigirSegunRol(rol) {
    if (rol === 'admin' || rol === 'secretaria') {
        window.location.replace("VistaGestionAuditoria.php");
    } else if (rol === 'alcalde') {
        window.location.replace("VistaListaAuditoria.php");
    } else if (rol === 'director') {
        window.location.replace("VistaDerivacion.php"); // El director va a su bandeja
    } else {
        cerrarSesion();
    }
}

function cerrarSesion() {
    localStorage.removeItem('jwt_token');
    window.location.replace("VistaLogin.php");
}

// Ejecutar la validación inmediatamente al cargar el script
verificarAcceso();