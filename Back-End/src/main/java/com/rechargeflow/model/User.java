package com.rechargeflow.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "Users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "name", length = 255, nullable = false)
    private String name;

    @Column(name = "email", length = 255, nullable = false, unique = true)
    private String email;

    @Column(name = "password", length = 255, nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private UserStatus status = UserStatus.ACTIVE;

    @Column(name = "address")
    private String address;

    @Column(name = "dob")
    private LocalDate dob;

    @Column(name = "preferred_language", length = 50)
    private String preferredLanguage;

    @Column(name = "join_date", updatable = false)
    private LocalDateTime joinDate = LocalDateTime.now();

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    public enum Role {
        ADMIN, USER, SUPPORT
    }

    public enum UserStatus {
        ACTIVE, INACTIVE, PENDING_VERIFICATION, SUSPENDED, BLOCKED, EXPIRING
    }
}