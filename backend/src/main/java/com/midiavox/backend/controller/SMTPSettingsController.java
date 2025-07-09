package com.midiavox.backend.controller;

import com.midiavox.backend.model.SMTPSettings;
import com.midiavox.backend.repository.SMTPSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/smtp-settings")
public class SMTPSettingsController {

    @Autowired
    private SMTPSettingsRepository smtpSettingsRepository;

    @GetMapping
    public List<SMTPSettings> getAllSettings() {
        return smtpSettingsRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<SMTPSettings> createOrUpdateSettings(@RequestBody SMTPSettings settings) {
        List<SMTPSettings> existingSettings = smtpSettingsRepository.findAll();
        if (!existingSettings.isEmpty()) {
            SMTPSettings existing = existingSettings.get(0);
            existing.setHost(settings.getHost());
            existing.setPort(settings.getPort());
            existing.setUsername(settings.getUsername());
            existing.setPassword(settings.getPassword());
            existing.setTlsEnabled(settings.isTlsEnabled());
            SMTPSettings updated = smtpSettingsRepository.save(existing);
            return ResponseEntity.ok(updated);
        } else {
            SMTPSettings created = smtpSettingsRepository.save(settings);
            return ResponseEntity.ok(created);
        }
    }
}
