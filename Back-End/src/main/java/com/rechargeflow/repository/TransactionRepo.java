package com.rechargeflow.repository;

import com.rechargeflow.dto.TransactionDetailsDTO;
import com.rechargeflow.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepo extends JpaRepository<Payment, Long> {
    @Query("SELECT NEW com.rechargeflow.dto.TransactionDetailsDTO(" +
            "p.paymentReference, " +
            "u.name, " +
            "rh.rechargeDate, " +
            "p.amount, " +
            "rh.plan.planName, " +
            "p.paymentMethod, " +
            "p.transactionStatus) " +
            "FROM RechargeHistory rh " +
            "LEFT JOIN rh.user u " +
            "LEFT JOIN Payment p ON p.user.phoneNumber = u.phoneNumber " +
            "AND p.plan.planId = rh.plan.planId")
    List<TransactionDetailsDTO> getTransactionDetails();
}