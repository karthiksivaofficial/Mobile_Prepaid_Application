package com.rechargeflow.repository;

import com.rechargeflow.dto.UserDetailsDTO;
import com.rechargeflow.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface UserRepo extends JpaRepository<User, String> {
    @Query("SELECT new com.rechargeflow.dto.UserDetailsDTO(" +
            "u.name, " +
            "u.phoneNumber, " +
            "rp.planName, " +
            "p.amount, " +
            "p.transactionStatus, " +
            "p.transactionDate, " +
            "u.status) " +
            "FROM User u " +
            "LEFT JOIN Payment p ON u.phoneNumber = p.user.phoneNumber " +
            "LEFT JOIN RechargePlan rp ON p.plan.planId = rp.planId " +
            "WHERE p.transactionDate = (SELECT MAX(p2.transactionDate) " +
            "FROM Payment p2 WHERE p2.user.phoneNumber = u.phoneNumber) " +
            "OR p.transactionDate IS NULL")
    List<UserDetailsDTO> findUserRechargeDetails();

    boolean existsByPhoneNumber(String phoneNumber);
}