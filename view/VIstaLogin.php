<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - I. Municipalidad de Yerbas Buenas</title>    
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" rel="stylesheet">
    <link rel="stylesheet" href="../assets/css/Styles.css">
</head>
<body class="login-bg d-flex align-items-center justify-content-center vh-100">

    <div class="container">
        <div class="row justify-content-center">
            <div class="col-11 col-sm-9 col-md-7 col-lg-4">
                
                <div class="card login-card shadow-lg p-4 p-md-5 border-0">
                    
                    <div class="text-center mb-4">
                        <div class="user-icon-wrapper shadow-sm mx-auto mb-3">
                            <i class="bi bi-person-circle text-danger-yb"></i>
                        </div>
                        <h3 class="fw-bold text-black mb-1">Acceso al Sistema</h3>
                        <p class="text-muted small">I. Municipalidad de Yerbas Buenas</p>
                    </div>

                    <form id="form_login">
                        
                        <div class="mb-3">
                            <label for="usuario" class="form-label fw-bold small text-muted text-uppercase">Usuario</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light border-end-0 text-muted">
                                    <i class="bi bi-person-fill"></i>
                                </span>
                                <input type="text" id="usuario" name="usuario" class="form-control bg-light border-start-0 ps-0" placeholder="Ingrese su usuario" required>
                            </div>
                        </div>

                        <div class="mb-4">
                            <label for="password" class="form-label fw-bold small text-muted text-uppercase">Contraseña</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light border-end-0 text-muted">
                                    <i class="bi bi-lock-fill"></i>
                                </span>
                                <input type="password" id="password" name="password" class="form-control bg-light border-start-0 ps-0" required>
                            </div>
                        </div>

                        <button type="submit" class="btn btn-custom w-100 py-3 fw-bold shadow-sm" style="background-color: var(--yb-blue); color: white; border: none;">
                            <i class="bi bi-box-arrow-in-right me-2"></i> INICIAR SESIÓN
                        </button>

                    </form>
<script src="../model/api.js"></script>
<script src="../assets/js/Login.js"></script>
</body>
</html>