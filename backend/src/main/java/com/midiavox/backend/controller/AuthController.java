package com.midiavox.backend.controller;

import com.midiavox.backend.config.JwtTokenUtil;
import com.midiavox.backend.model.User;
import com.midiavox.backend.service.AuthService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthController.RegisterRequest registerRequest) {
        if (authService.findByUsername(registerRequest.getUsername()) != null) {
            return ResponseEntity.badRequest().body("Username já existe");
        }
        User newUser = new User();
        newUser.setUsername(registerRequest.getUsername());
        newUser.setEmail(registerRequest.getEmail());
        newUser.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        newUser.setEmpresaUsuario(registerRequest.getEmpresaUsuario());
        newUser.setOnline(false);
        newUser.setPermission("Cliente"); // Set default permission
        authService.saveUser(newUser);
        return ResponseEntity.ok("Usuário registrado com sucesso");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        User user = authService.authenticate(loginRequest.getUsername(), loginRequest.getPassword());
        if (user == null) {
            return ResponseEntity.status(401).body("Usuário ou senha incorretos");
        }
        // Set user online status to true on login
        user.setOnline(true);
        authService.saveUser(user);

        String token = jwtTokenUtil.generateToken(user.getUsername());
        var refreshToken = authService.createRefreshToken(user.getUsername());

        return ResponseEntity.ok(new LoginResponse(token, refreshToken.getToken(), user.getUsername(), user.getPermission()));
    }

    @PostMapping("/request-password-reset")
    public ResponseEntity<?> requestPasswordReset(@RequestBody PasswordResetRequest request) {
        boolean result = authService.sendPasswordResetToken(request.getEmail());
        if (result) {
            return ResponseEntity.ok("Email de redefinição enviado. Verifique sua caixa de entrada.");
        } else {
            return ResponseEntity.badRequest().body("Falha ao enviar email de redefinição.");
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody PasswordResetConfirm request) {
        boolean result = authService.resetPassword(request.getToken(), request.getNewPassword());
        if (result) {
            return ResponseEntity.ok("Senha redefinida com sucesso.");
        } else {
            return ResponseEntity.badRequest().body("Falha ao redefinir senha.");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody LogoutRequest logoutRequest) {
        User user = authService.findByUsername(logoutRequest.getUsername());
        if (user != null) {
            user.setOnline(false);
            authService.saveUser(user);
            authService.deleteAllByUsername(user.getUsername());
            return ResponseEntity.ok("Logout successful");
        }
        return ResponseEntity.badRequest().body("User not found");
    }

    public static class LoginRequest {
        private String username;
        private String password;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class RegisterRequest {
        private String username;
        private String email;
        private String password;
        private String empresaUsuario;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }

        public String getEmpresaUsuario() { return empresaUsuario; }
        public void setEmpresaUsuario(String empresaUsuario) { this.empresaUsuario = empresaUsuario; }
    }

    public static class LoginResponse {
        private String token;
        private String refreshToken;
        private String username;
        private String permission;

        public LoginResponse(String token, String refreshToken, String username, String permission) {
            this.token = token;
            this.refreshToken = refreshToken;
            this.username = username;
            this.permission = permission;
        }

        public String getToken() { return token; }
        public String getRefreshToken() { return refreshToken; }
        public String getUsername() { return username; }
        public String getPermission() { return permission; }
    }

    public static class PasswordResetRequest {
        private String email;
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    public static class PasswordResetConfirm {
        private String token;
        private String newPassword;
        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }

    public static class LogoutRequest {
        private String username;
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
    }
}
