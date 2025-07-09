package com.midiavox.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.midiavox.backend.model.Chamado;
import com.midiavox.backend.repository.ChamadoRepository;

@Service
public class ChamadoService {

    private final ChamadoRepository chamadoRepository;

    public ChamadoService(ChamadoRepository chamadoRepository) {
        this.chamadoRepository = chamadoRepository;
    }

    public Chamado saveChamado(Chamado chamado) {
        return chamadoRepository.save(chamado);
    }

    public List<Chamado> getChamadosByUsuario(String usuario) {
        return chamadoRepository.findByUsuario(usuario);
    }
}
