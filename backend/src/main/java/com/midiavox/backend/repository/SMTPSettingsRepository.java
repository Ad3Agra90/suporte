package com.midiavox.backend.repository;

import com.midiavox.backend.model.SMTPSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SMTPSettingsRepository extends JpaRepository<SMTPSettings, Long> {
}
