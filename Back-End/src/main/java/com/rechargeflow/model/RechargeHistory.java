package com.rechargeflow.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "Recharge_History")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RechargeHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "recharge_id")
    private Long rechargeId;

    @ManyToOne
    @JoinColumn(name = "phone_number", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "plan_id", nullable = false)
    private RechargePlan plan;

    @Column(name = "recharge_date", updatable = false)
    private LocalDateTime rechargeDate = LocalDateTime.now();

    @Column(name = "expiry_date", nullable = false)
    private LocalDateTime expiryDate;
}