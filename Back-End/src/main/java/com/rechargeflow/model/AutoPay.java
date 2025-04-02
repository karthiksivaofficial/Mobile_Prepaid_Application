package com.rechargeflow.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "autopay")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AutoPay {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "autopay_id")
    private Long autopayId;

    @ManyToOne
    @JoinColumn(name = "phone_number", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "plan_id", nullable = false)
    private RechargePlan plan;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    private PaymentMethod paymentMethod;

    @Column(name = "card_number")
    private String cardNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private AutoPayStatus status;

    @Column(name = "next_recharge_date", nullable = false)
    private LocalDateTime nextRechargeDate;

    @Column(name = "failure_count", nullable = false)
    private Integer failureCount = 0;

    @Column(name = "last_attempted_payment")
    private LocalDateTime lastAttemptedPayment;

    @Enumerated(EnumType.STRING)
    @Column(name = "last_payment_status")
    private PaymentStatus lastPaymentStatus;

    public enum PaymentMethod {
        UPI, CARD, NET_BANKING, WALLET
    }

    public enum AutoPayStatus {
        ACTIVE, INACTIVE
    }

    public enum PaymentStatus {
        SUCCESS, FAILED, PENDING
    }
}