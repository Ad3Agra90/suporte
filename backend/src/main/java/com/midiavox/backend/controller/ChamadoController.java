package com.midiavox.backend.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.midiavox.backend.model.Chamado;
import com.midiavox.backend.service.ChamadoService;

@RestController
@RequestMapping("/api/chamados")
public class ChamadoController {

    private final ChamadoService chamadoService;

    public ChamadoController(ChamadoService chamadoService) {
        this.chamadoService = chamadoService;
    }

    @PostMapping
    public ResponseEntity<Chamado> createChamado(@RequestBody Chamado chamado, Principal principal) {
        // Set the logged-in user as the usuario
        chamado.setUsuario(principal.getName());
        // Set initial values
        chamado.setResposta(null);
        chamado.setPrevisao(null);
        chamado.setAtendente(null);
        chamado.setStatus("Aberto");

        Chamado savedChamado = chamadoService.saveChamado(chamado);
        return ResponseEntity.ok(savedChamado);
    }

    @GetMapping
    public ResponseEntity<List<Chamado>> getChamadosByUsuario(Principal principal) {
        System.out.println("Fetching chamados for user: " + principal.getName());
        List<Chamado> chamados = chamadoService.getChamadosByUsuario(principal.getName());
        System.out.println("Chamados found: " + chamados.size());
        return ResponseEntity.ok(chamados);
    }
}
