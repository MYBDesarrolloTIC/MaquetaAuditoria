// Esperamos a que todo el HTML del DOM esté cargado
document.addEventListener("DOMContentLoaded", function() {
    
    // Seleccionamos nuestro menú y el botón de hamburguesa
    const sidebar = document.getElementById("mySidebar");
    const toggleBtn = document.querySelector(".menu-toggle-btn");

    // 1. Verificar si hay un estado guardado en el navegador
    // Esto es vital para que al cambiar de página en PHP, el menú no "salte" y olvide su estado
    const isPinned = localStorage.getItem("sidebarPinned");
    
    if (isPinned === "true") {
        sidebar.classList.add("pinned");
    }

    // 2. Darle la funcionalidad al botón de anclar/desanclar
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener("click", function() {
            // Alternamos la clase 'pinned' que definimos en tu CSS
            sidebar.classList.toggle("pinned");

            // Guardamos la decisión del usuario en el localStorage
            if (sidebar.classList.contains("pinned")) {
                localStorage.setItem("sidebarPinned", "true");
            } else {
                localStorage.setItem("sidebarPinned", "false");
            }
        });
    }

    // 3. Pequeño detalle visual (Opcional): 
    // Que el ícono de la hamburguesa cambie si está anclado o no
    
    toggleBtn.addEventListener("click", function() {
        const icon = this.querySelector("i");
        if (sidebar.classList.contains("pinned")) {
            icon.classList.remove("fa-bars");
            icon.classList.add("fa-times"); // Cambia a una 'X' o a otro ícono
        } else {
            icon.classList.remove("fa-times");
            icon.classList.add("fa-bars");
        }
    });
    
});