package com.midiavox.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "smtp_settings")
@Data
public class SMTPSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String host;

    @Column(nullable = false)
    private int port;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private boolean tlsEnabled;
}
