/* =========================================================================
   CONSTANTES GLOBALES
   ========================================================================= */
const API_REQUEST_FAIL = 0;
const API_REQUEST_SUCCESS = 1;
/* =========================================================================
   API: LOGIN Y AUTENTICACIÓN
   ========================================================================= */
const validUser = async (username, password) => {
    if (username.trim().length > 0) {
        if (password.length > 0) { // CORRECCIÓN 3: Dejar pasar cualquier largo de clave al backend
            const request = await fetch("../../controller/login_controller.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username, // Sin encodeURIComponent, el JSON ya protege los datos
                    password: password
                })
            });

            if (!request.ok) return { status: API_REQUEST_FAIL, message: "Error en la solicitud" };
            return {
                status: API_REQUEST_SUCCESS,
                message: "Usuario válido",
                data: await request.json(),
            };
        } else {
            return { status: API_REQUEST_FAIL, message: "La contraseña no puede estar vacía" };
        }
    } else {
        return { status: API_REQUEST_FAIL, message: "El usuario está en blanco" };
    }
};  

/* =========================================================================
   FUNCIÓN CAZADORA DE ERRORES (Reutilizable para todos los módulos)
   ========================================================================= */
const procesarPeticion = async (url, opciones) => {
    try {
        const req = await fetch(url, opciones);
        const textoCrudo = await req.text(); // Atrapamos la respuesta cruda de PHP
        
        try {
            return JSON.parse(textoCrudo); // Intentamos convertirlo a JSON
        } catch (errorParseo) {
            // SI PHP DIO ERROR, CAEREMOS AQUÍ Y LO VEREMOS EN CONSOLA
            console.error("❌ ERROR EN PHP DETECTADO ❌");
            console.error("Lo que PHP devolvió realmente fue:", textoCrudo);
            return { status: 0, message: "Error interno del servidor. Revisa la consola (F12)." };
        }
    } catch (errorRed) {
        console.error("Error real de conexión:", errorRed);
        return { status: 0, message: "No se pudo conectar con el servidor." };
    }
};


/* =========================================================================
   API: GESTIÓN DE FUNCIONARIOS
   ========================================================================= */
const apiFuncionarios = {
    baseUrl: '../../controller/funcionario_controller.php',

    getFuncionarios: async () => {
        return await procesarPeticion(`${apiFuncionarios.baseUrl}?action=getFuncionarios`, { method: 'GET' });
    },

    createFuncionario: async (datos) => {
        return await procesarPeticion(apiFuncionarios.baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'createFuncionario', ...datos })
        });
    },

    updateFuncionario: async (datos) => {
        return await procesarPeticion(apiFuncionarios.baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'updateFuncionario', ...datos })
        });
    },

    deleteFuncionario: async (rut) => {
        return await procesarPeticion(apiFuncionarios.baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'deleteFuncionario', rut: rut })
        });
    }
};

/* 
-------------------------------------------------------------
        api Gestion Usuarios
------------------------------------------------------------- */
const apiUsuarios = {
    baseUrl: '../../controller/usuario_controller.php',

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
