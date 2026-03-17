/* =========================================================================
   MÓDULO 1: LOGIN
   ========================================================================= */
async function procesarLogin(e) {
    e.preventDefault();
    const userVal = document.getElementById("usuario").value.trim();
    const passVal = document.getElementById("password").value;

    if (!userVal || !passVal) {
        mostrarNotificacion("Por favor, ingresa tu usuario y contraseña.", "warning");
        return;
    }

    try {
        // Llamamos a tu API intacta. Si el navegador bloquea el localStorage aquí, 
        // JavaScript saltará automáticamente al bloque 'catch' de abajo.
        const vuser = await validUserTokens(userVal, passVal);
        
        if (vuser.status === 1 && vuser.data && vuser.data.status === 1) {
            const rolUsuario = String(vuser.data.rol || '').toLowerCase().trim();
            if (['admin','secretaria'].includes(rolUsuario)) {
                window.location.href = "VistaGestionAuditoria.php?login=success";
            } else {
                window.location.href = "VistaListaAuditoria.php?login=success";
            }
        } else {
            const mensajeFallo = vuser.data ? vuser.data.message : (vuser.message || "Credenciales incorrectas.");
            mostrarNotificacion(mensajeFallo, "error");
            document.getElementById("password").value = '';
        }
    } catch (error) {
        console.error("Error capturado en procesarLogin:", error);

        // Detectamos si el error fue provocado por el bloqueo de seguridad del navegador
        if (error.name === 'SecurityError' || error.message.toLowerCase().includes('storage') || error.message.toLowerCase().includes('localstorage')) {
            mostrarNotificacion("El navegador bloqueó el inicio de sesión. Por favor, desactiva la 'Prevención de seguimiento' o permite las cookies para este sitio.", "error");
        } else {
            mostrarNotificacion("Error interno al procesar la solicitud.", "error");
        }
        
        document.getElementById("password").value = '';
    }
}
// Espera a que el HTML cargue y conecta el formulario con la función
document.addEventListener("DOMContentLoaded", () => {
    const formLogin = document.getElementById("form_login");
    if (formLogin) {
        formLogin.addEventListener("submit", procesarLogin);
    }
});