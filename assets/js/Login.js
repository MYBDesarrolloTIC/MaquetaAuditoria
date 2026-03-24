/* =========================================================================
   MÓDULO 1: LOGIN (ACTUALIZADO CON EL ROL DIRECTOR)
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
        const vuser = await validUserTokens(userVal, passVal);
        
        if (vuser.status === 1 && vuser.data && vuser.data.status === 1) {
            const rolUsuario = String(vuser.data.rol || '').toLowerCase().trim();
            
            // REDIRECCIÓN INTELIGENTE SEGÚN ROL
            if (['admin','secretaria'].includes(rolUsuario)) {
                window.location.href = "VistaGestionAuditoria.php?login=success";
            } else if (rolUsuario === 'alcalde') {
                window.location.href = "VistaListaAuditoria.php?login=success";
            } else if (rolUsuario === 'director') {
                window.location.href = "VistaDerivacion.php?login=success";
            } else {
                mostrarNotificacion("Rol no reconocido.", "error");
            }
        } else {
            const mensajeFallo = vuser.data ? vuser.data.message : (vuser.message || "Credenciales incorrectas.");
            mostrarNotificacion(mensajeFallo, "error");
            document.getElementById("password").value = '';
        }
    } catch (error) {
        console.error("Error capturado en procesarLogin:", error);
        if (error.name === 'SecurityError' || error.message.toLowerCase().includes('storage') || error.message.toLowerCase().includes('localstorage')) {
            mostrarNotificacion("El navegador bloqueó el inicio de sesión. Por favor, desactiva la 'Prevención de seguimiento'.", "error");
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