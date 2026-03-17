document.addEventListener("DOMContentLoaded", () => {
    // Seleccionamos todos los botones de las tarjetas
    const btnCompletada = document.querySelectorAll('.btn-success');
    const btnDenegada = document.querySelectorAll('.btn-danger');

    // Función para animar y remover la tarjeta
    const removerTarjeta = (boton, mensaje) => {
        // Buscamos la tarjeta padre más cercana (.col-md-6)
        const tarjeta = boton.closest('.col-md-6');
        
        // Pequeña animación de desvanecimiento
        tarjeta.style.transition = "opacity 0.4s ease, transform 0.4s ease";
        tarjeta.style.opacity = "0";
        tarjeta.style.transform = "scale(0.9)";

        // Esperamos que termine la animación para eliminar el HTML
        setTimeout(() => {
            tarjeta.remove();
            alert(mensaje); // En producción, aquí usarías un Toast de Bootstrap o SweetAlert
        }, 400);
    };

    // Asignar eventos a los botones de "Completada"
    btnCompletada.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            removerTarjeta(this, "✅ Solicitud marcada como COMPLETADA.");
        });
    });

    // Asignar eventos a los botones de "Denegada"
    btnDenegada.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            removerTarjeta(this, "❌ Solicitud DENEGADA o No Completada.");
        });
    });
});