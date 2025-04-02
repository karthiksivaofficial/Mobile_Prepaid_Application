package com.rechargeflow.dto;

import com.rechargeflow.model.Payment;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionDetailsDTO {
    private String transactionId;
    private String customer;
    private LocalDateTime dateTime;
    private Double amount;
    private String plan;
    private Payment.PaymentMethod paymentMethod;
    private Payment.TransactionStatus status;
}