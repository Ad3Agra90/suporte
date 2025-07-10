package com.midiavox.backend.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.midiavox.backend.model.Chamado;
import com.midiavox.backend.model.User;
import com.midiavox.backend.repository.UserRepository;
import com.midiavox.backend.service.ChamadoService;

@RestController
@RequestMapping("/api/chamados")
public class ChamadoController {

    private final ChamadoService chamadoService;
    private final UserRepository userRepository;

    public ChamadoController(ChamadoService chamadoService, UserRepository userRepository) {
        this.chamadoService = chamadoService;
        this.userRepository = userRepository;
    }

    @GetMapping("/kanban")
    public List<Chamado> getChamadosForKanban(Principal principal) {
        String username = principal.getName();
        User currentUser = userRepository.findByUsername(username).orElse(null);
        if (currentUser == null) {
            return java.util.Collections.emptyList();
        }
        String permission = currentUser.getPermission();
        if ("tecnico".equalsIgnoreCase(permission)) {
            return chamadoService.getChamadosByTecnico(username);
        } else if ("cliente".equalsIgnoreCase(permission)) {
            return chamadoService.getChamadosByUsuario(username);
        } else {
            return java.util.Collections.emptyList();
        }
    }

    @PostMapping
    public ResponseEntity<Chamado> createChamado(@RequestBody Chamado chamado, Principal principal) {
        System.out.println("createChamado called by principal: " + principal.getName());
        User currentUser = userRepository.findByUsername(principal.getName()).orElse(null);
        if (currentUser == null) {
            System.out.println("User not found for username: " + principal.getName());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        // Allow any permission to create chamado
        // String permission = currentUser.getPermission();
        // System.out.println("User permission: " + permission);
        // if (!("cliente".equalsIgnoreCase(permission) || "admin".equalsIgnoreCase(permission) || "master".equalsIgnoreCase(permission))) {
        //     System.out.println("User permission not allowed to create chamado: " + permission);
        //     return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        // }
        // Set the logged-in user as the usuario
        chamado.setUsuario(principal.getName());
        // Set initial values
        chamado.setResposta(null);
        chamado.setPrevisao(null);
        chamado.setTecnico(null);
        chamado.setStatus("Aberto");

        Chamado savedChamado = chamadoService.saveChamado(chamado);
        return ResponseEntity.ok(savedChamado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Chamado> updateChamado(@PathVariable Long id, @RequestBody Chamado chamado, Principal principal) {
        chamado.setId(id);
        // Check ownership or admin permission
        User currentUser = userRepository.findByUsername(principal.getName()).orElse(null);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Chamado existingChamado = chamadoService.getChamadoById(id).orElse(null);
        if (existingChamado == null) {
            return ResponseEntity.notFound().build();
        }
        boolean isOwner = existingChamado.getUsuario().equals(principal.getName());
        boolean isAdmin = currentUser.getPermission() != null && (currentUser.getPermission().equalsIgnoreCase("admin") || currentUser.getPermission().equalsIgnoreCase("master"));
        if (!isOwner && !isAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        Chamado updatedChamado = chamadoService.saveChamado(chamado);
        return ResponseEntity.ok(updatedChamado);
    }

    @GetMapping
    public ResponseEntity<List<Chamado>> getChamadosByUsuario(Principal principal) {
        System.out.println("Fetching chamados for user: " + principal.getName());
        List<Chamado> chamados = chamadoService.getChamadosByUsuario(principal.getName());
        System.out.println("Chamados found: " + chamados.size());
        return ResponseEntity.ok(chamados);
    }

    @GetMapping("/all")
    public ResponseEntity<List<Chamado>> getAllChamados() {
        List<Chamado> chamados = chamadoService.getAllChamados();
        return ResponseEntity.ok(chamados);
    }

    @GetMapping("/tecnico")
    public ResponseEntity<List<Chamado>> getChamadosByTecnico(Principal principal) {
        System.out.println("Fetching chamados for tecnico: " + principal.getName());
        List<Chamado> chamados = chamadoService.getChamadosByTecnico(principal.getName());
        System.out.println("Chamados found for tecnico: " + chamados.size());
        return ResponseEntity.ok(chamados);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteChamado(@PathVariable Long id) {
        chamadoService.deleteChamadoById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/filter")
    public ResponseEntity<List<Chamado>> filterChamados(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean semTecnico,
            @RequestParam(required = false) String prioridade,
            @RequestParam(required = false) String status) {

        List<Chamado> chamados;

        if (keyword != null && !keyword.isEmpty()) {
            chamados = chamadoService.searchChamadosByTitulo(keyword);
        } else if (semTecnico != null && semTecnico) {
            chamados = chamadoService.getChamadosSemTecnico();
        } else if (prioridade != null && !prioridade.isEmpty()) {
            chamados = chamadoService.getChamadosByPrioridade(prioridade);
        } else if (status != null && !status.isEmpty()) {
            chamados = chamadoService.getChamadosByStatus(status);
        } else {
            chamados = chamadoService.getAllChamados();
        }

        return ResponseEntity.ok(chamados);
    }
}
