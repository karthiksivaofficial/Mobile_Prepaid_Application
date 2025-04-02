package com.rechargeflow.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "Payment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    private Long paymentId;

    @ManyToOne
    @JoinColumn(name = "phone_number", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "plan_id", nullable = false)
    private RechargePlan plan;

    @Column(name = "amount", nullable = false)
    private Double amount;

    @Column(name = "tax_amount", nullable = false)
    private Double taxAmount = 0.0;

    @Column(name = "discount_amount", nullable = false)
    private Double discountAmount = 0.0;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_status", nullable = false)
    private TransactionStatus transactionStatus;

    @Column(name = "transaction_date", updatable = false)
    private LocalDateTime transactionDate = LocalDateTime.now();

    @Column(name = "payment_reference", unique = true, nullable = false)
    private String paymentReference;

    @Column(name = "gateway_transaction_id")
    private String gatewayTransactionId;

    @Column(name = "gateway_error_message")
    private String gatewayErrorMessage;

    @Enumerated(EnumType.STRING)
    @Column(name = "refund_status")
    private RefundStatus refundStatus = RefundStatus.NOT_APPLICABLE;

    public enum PaymentMethod {
        UPI, CARD, NET_BANKING, WALLET, CASH, CRYPTO
    }

    public enum TransactionStatus {
        SUCCESS, FAILED, PENDING, REFUNDED, PARTIALLY_REFUNDED
    }

    public enum RefundStatus {
        NOT_APPLICABLE, REQUESTED, PROCESSED
    }
}