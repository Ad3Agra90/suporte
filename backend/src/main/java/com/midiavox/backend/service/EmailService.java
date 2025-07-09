package com.midiavox.backend.service;

import com.midiavox.backend.model.SMTPSettings;
import com.midiavox.backend.repository.SMTPSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Properties;

@Service
public class EmailService {

    @Autowired
    private SMTPSettingsRepository smtpSettingsRepository;

    private JavaMailSender mailSender;

    private void configureMailSender() {
        List<SMTPSettings> settingsList = smtpSettingsRepository.findAll();
        if (settingsList.isEmpty()) {
            throw new RuntimeException("SMTP settings not configured.");
        }
        SMTPSettings settings = settingsList.get(0);

        JavaMailSenderImpl mailSenderImpl = new JavaMailSenderImpl();
        mailSenderImpl.setHost(settings.getHost());
        mailSenderImpl.setPort(settings.getPort());
        mailSenderImpl.setUsername(settings.getUsername());
        mailSenderImpl.setPassword(settings.getPassword());

        Properties props = mailSenderImpl.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", String.valueOf(settings.isTlsEnabled()));
        props.put("mail.debug", "true");

        this.mailSender = mailSenderImpl;
    }

    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        if (mailSender == null) {
            configureMailSender();
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Password Reset Request");
        message.setText("You requested a password reset. Use the following token to reset your password:\n\n" + resetToken + "\n\nIf you did not request this, please ignore this email.");

        mailSender.send(message);
    }
}
