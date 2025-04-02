package com.rechargeflow.repository;

import com.rechargeflow.model.UserRegister;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRegisterRepo extends JpaRepository<UserRegister, Integer> {
    UserRegister findByUsername(String username);
}
