/* =========================================================================
   CONSTANTES GLOBALES
   ========================================================================= */
const API_REQUEST_FAIL = 0;
const API_REQUEST_SUCCESS = 1;

/* =========================================================================
   FUNCIÓN CAZADORA DE ERRORES (Reutilizable para todos los módulos)
   ========================================================================= */
const procesarPeticion = async (url, opciones = {}) => {
    try {
        // En cada petición futura que se haga, buscamos el token guardado
        const token = localStorage.getItem('jwt_token');
        
        if (!opciones.headers) {
            opciones.headers = {};
        }

        // Si existe el token, se lo enviamos al backend PHP como autorización
        if (token) {
            opciones.headers['Authorization'] = 'Bearer ' + token;
        }

        const req = await fetch(url, opciones);
        const textoCrudo = await req.text(); // Atrapamos la respuesta cruda de PHP
        
        try {
            return JSON.parse(textoCrudo); 
        } catch (errorParseo) {
            console.error("❌ ERROR EN PHP DETECTADO ❌\n", textoCrudo);
            return { status: 0, message: "Error interno del servidor. Revisa la consola (F12)." };
        }
    } catch (errorRed) {
        console.error("Error real de conexión:", errorRed);
        return { status: 0, message: "No se pudo conectar con el servidor." };
    }
};

/* =========================================================================
   API: USUARIOS
   ========================================================================= */
const apiUsuarios = {
    baseUrl: '../controller/usuario_controller.php',

    getUsuarios: async () => await procesarPeticion(`${apiUsuarios.baseUrl}?action=getUsuarios`, { method: 'GET' }),
    
    createUsuario: async (datos) => await procesarPeticion(apiUsuarios.baseUrl, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'createUsuario', ...datos })
    }),
    
    updateUsuario: async (datos) => await procesarPeticion(apiUsuarios.baseUrl, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateUsuario', ...datos })
    }),
    
    deleteUsuario: async (id) => await procesarPeticion(apiUsuarios.baseUrl, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deleteUsuario', id: id })
    })
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////// SECCION DE PABLO /////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

//mediente tokens y no variable de session
const validUserTokens = async (username, password) => {
    if (username.trim().length > 0 && password.length > 0) {
        const request = await fetch("../controller/login_controller.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: username, password: password })
        });

        if (!request.ok) return { status: 0, message: "Error en la solicitud" };
        
        const response = await request.json();

        // MAGIA AQUÍ: Si el login fue exitoso y el backend nos dio un token,
        // lo guardamos silenciosamente en el LocalStorage del navegador.
        if (response.status === 1 && response.token) {
            localStorage.setItem('jwt_token', response.token);
        }

        // Retornamos la respuesta tal cual para que el Login.js de tu amigo funcione
        return response;
    } else {
        return { status: 0, message: "Usuario o contraseña vacíos" };
    }
};
// para cazar errores y util para mas modulos
const ProcesarPeticion = async (url, opciones) => {
    try {
        // En cada petición futura que se haga, buscamos el token
        const token = localStorage.getItem('jwt_token');
        
        if (!opciones.headers) {
            opciones.headers = {};
        }

        // Si existe el token, se lo enviamos al backend PHP en las cabeceras
        if (token) {
            opciones.headers['Authorization'] = 'Bearer ' + token;
        }

        const req = await fetch(url, opciones);
        const textoCrudo = await req.text(); 
        
        try {
            return JSON.parse(textoCrudo); 
        } catch (errorParseo) {
            console.error("❌ ERROR EN PHP DETECTADO ❌\n", textoCrudo);
            return { status: 0, message: "Error interno del servidor. Revisa la consola (F12)." };
        }
    } catch (errorRed) {
        console.error("Error real de conexión:", errorRed);
        return { status: 0, message: "No se pudo conectar con el servidor." };
    }
};

/* =========================================================================
   API: GESTIÓN DE AUDITORÍAS (ALCALDE Y SECRETARIA)
   ========================================================================= */
const apiAuditoria = {
    baseUrl: '../../controller/auditoria_controller.php',

    // Leer pendientes para el Alcalde
    getPendientes: async () => await procesarPeticion(`${apiAuditoria.baseUrl}?action=getPendientes`, { method: 'GET' }),
    
    // Leer todo para la Secretaria
    getGestionDiaria: async () => await procesarPeticion(`${apiAuditoria.baseUrl}?action=getGestionDiaria`, { method: 'GET' }),
    
    // Cambiar estado (Botones del Alcalde)
    cambiarEstado: async (id, nuevo_estado) => await procesarPeticion(apiAuditoria.baseUrl, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cambiarEstado', id: id, nuevo_estado: nuevo_estado })
    }),
    
    // Crear nueva (Secretaria)
    createAuditoria: async (datos) => await procesarPeticion(apiAuditoria.baseUrl, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'createAuditoria', ...datos })
    }),
    
    // Editar (Secretaria)
    updateAuditoria: async (datos) => await procesarPeticion(apiAuditoria.baseUrl, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateAuditoria', ...datos })
    }),
    
    // Eliminar (Secretaria)
    deleteAuditoria: async (id) => await procesarPeticion(apiAuditoria.baseUrl, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deleteAuditoria', id: id })
    })
};

/* =========================================================================
   API: HISTORIAL GENERAL
   ========================================================================= */
const apiHistorial = {
    baseUrl: '../../controller/historial_controller.php',

    getHistorialGeneral: async () => await procesarPeticion(`${apiHistorial.baseUrl}?action=getHistorialGeneral`, { method: 'GET' })
};