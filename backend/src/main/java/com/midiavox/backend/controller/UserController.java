package com.midiavox.backend.controller;

import com.midiavox.backend.model.User;
import com.midiavox.backend.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.HttpStatus;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/filter")
    public ResponseEntity<List<User>> filterUsers(@RequestParam(required = false) String permission,
                                                  @RequestParam(required = false) String keyword) {
        List<User> users;
        boolean hasPermission = permission != null && !permission.isEmpty();
        boolean hasKeyword = keyword != null && !keyword.isEmpty();

        if (hasPermission && hasKeyword) {
            // Filter by permission and username containing keyword
            users = userRepository.findByPermission(permission).stream()
                    .filter(user -> user.getUsername() != null && user.getUsername().toLowerCase().contains(keyword.toLowerCase()))
                    .toList();
        } else if (hasPermission) {
            users = userRepository.findByPermission(permission);
        } else if (hasKeyword) {
            users = userRepository.findByUsernameContainingIgnoreCase(keyword);
        } else {
            users = userRepository.findAll();
        }
        return ResponseEntity.ok(users);
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .map(user -> ResponseEntity.ok(user))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        return userRepository.findById(id)
            .map(user -> {
                user.setUsername(updatedUser.getUsername());
                user.setEmpresaUsuario(updatedUser.getEmpresaUsuario());
                user.setPermission(updatedUser.getPermission());
                user.setEmail(updatedUser.getEmail());
                user.setPassword(updatedUser.getPassword());
                User savedUser = userRepository.save(user);
                return ResponseEntity.ok(savedUser);
            })
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteUser(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        System.out.println("deleteUser called by: " + currentUsername);
        java.util.Optional<User> currentUserOpt = userRepository.findByUsername(currentUsername);
        if (!currentUserOpt.isPresent()) {
            System.out.println("User not found for username: " + currentUsername);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Usuário não encontrado.");
        }
        String permission = currentUserOpt.get().getPermission();
        System.out.println("User permission: " + permission);
        if (!( "master".equalsIgnoreCase(permission) || "admin".equalsIgnoreCase(permission) )) {
            System.out.println("User permission not allowed to delete users: " + permission);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Apenas usuário master ou admin pode deletar usuários.");
        }
        User currentUser = currentUserOpt.get();
        return userRepository.findById(id)
            .map(user -> {
                userRepository.delete(user);
                return ResponseEntity.noContent().build();
            })
            .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
