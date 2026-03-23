<nav class="sidebar-yb" id="mySidebar">
    
    <div class="menu-toggle-btn" onclick="togglePin()">
        <i class="fas fa-bars"></i>
    </div>
    
    <div class="sidebar-profile">
        <h5 class="sidebar-profile-text mb-0">Sistema Municipal</h5>
    </div>

    <div class="sidebar-nav">
        <a href="VistaGestionAuditoria.php" class="nav-link-yb" data-roles="admin,secretaria">
            <i class="fas fa-clipboard-list"></i> <span>Gestión</span>
        </a>
        
        <a href="VistaHistorialAuditoria.php" class="nav-link-yb" data-roles="admin,secretaria">
            <i class="fas fa-clipboard"></i> <span>Historial</span>
        </a>
        
        <a href="VistaUsuario.php" class="nav-link-yb" data-roles="admin">
            <i class="fas fa-users-cog"></i> <span>Gestión Usuario</span>
        </a>
        
        <a href="VistaListaAuditoria.php" class="nav-link-yb" data-roles="admin,alcalde">
            <i class="fas fa-list"></i> <span>Lista Auditorias</span>
        </a>
        <a href="VistaDerivacion.php" class="nav-link-yb" data-roles="admin,alcalde">
            <i class="fas fa-list"></i> <span>Lista Derivaciones</span>
        </a>
    </div>

    <div class="sidebar-footer">
        <a href="#" onclick="cerrarSesion()" class="btn-logout-yb">
            <i class="fas fa-sign-out-alt"></i> <span>Cerrar Sesión</span>
        </a>
    </div>
</nav>