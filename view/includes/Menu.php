<nav class="sidebar-yb" id="mySidebar">
    <div class="menu-toggle-btn" onclick="togglePin()">
        <i class="fas fa-bars"></i>
    </div>
    
    <div class="sidebar-profile">
        <h5 class="sidebar-profile-text mb-0">Sistema Municipal</h5>
    </div>

    <div class="sidebar-nav">
        <a href="VistaListaAuditoria.php" class="nav-link-yb active">
            <i>🏠</i> <span>Inicio</span>
        </a>
        <a href="VistaGestionAuditoria.php" class="nav-link-yb">
            <i>📝</i> <span>Gestión</span>
        </a>
        </div>

    <div class="sidebar-footer">
        <a href="logout.php" class="btn-logout-yb">
            <i>🚪</i> <span>Cerrar Sesión</span>
        </a>
    </div>
</nav>

<script>
    function togglePin() {
        document.getElementById("mySidebar").classList.toggle("pinned");
    }
</script>