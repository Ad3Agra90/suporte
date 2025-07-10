package com.midiavox.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.midiavox.backend.model.Chamado;

import java.util.List;

@Repository
public interface ChamadoRepository extends JpaRepository<Chamado, Long> {
    List<Chamado> findByUsuario(String usuario);
    List<Chamado> findByTecnico(String tecnico);

    List<Chamado> findByTecnicoIsNull();

    List<Chamado> findByPrioridade(String prioridade);

    List<Chamado> findByStatus(String status);

    // Changed from 'titulo' to 'chamado' because Chamado entity has 'chamado' field, not 'titulo'
    List<Chamado> findByChamadoContainingIgnoreCase(String keyword);
}
