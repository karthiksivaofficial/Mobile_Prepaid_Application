package com.rechargeflow.dto;

import com.rechargeflow.model.Payment;
import com.rechargeflow.model.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserDetailsDTO {
    private String name;
    private String phoneNumber;
    private String planName;
    private Double amount;
    private Payment.TransactionStatus transactionStatus;
    private LocalDateTime transactionDate;
    private User.UserStatus status;
}