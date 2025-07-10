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

    public List<Chamado> getChamadosByTecnico(String tecnico) {
        return chamadoRepository.findByTecnico(tecnico);
    }

    public java.util.Optional<Chamado> getChamadoById(Long id) {
        return chamadoRepository.findById(id);
    }

    public List<Chamado> getAllChamados() {
        return chamadoRepository.findAll();
    }

    public void deleteChamadoById(Long id) {
        chamadoRepository.deleteById(id);
    }

    public List<Chamado> getChamadosSemTecnico() {
        return chamadoRepository.findByTecnicoIsNull();
    }

    public List<Chamado> getChamadosByPrioridade(String prioridade) {
        return chamadoRepository.findByPrioridade(prioridade);
    }

    public List<Chamado> getChamadosByStatus(String status) {
        return chamadoRepository.findByStatus(status);
    }

    public List<Chamado> searchChamadosByTitulo(String keyword) {
        return chamadoRepository.findByChamadoContainingIgnoreCase(keyword);
    }
}
