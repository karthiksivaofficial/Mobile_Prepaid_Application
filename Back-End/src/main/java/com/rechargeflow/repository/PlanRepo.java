package com.rechargeflow.repository;

import com.rechargeflow.dto.PlanDetailsDTO;
import com.rechargeflow.model.RechargePlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PlanRepo extends JpaRepository<RechargePlan, Long> {

    @Query("SELECT new com.rechargeflow.dto.PlanDetailsDTO(" +
            "r.planId, " +
            "r.planName, " +
            "r.planType, " +
            "r.price, " +
            "r.data, " +
            "r.validity, " +
            "r.feature, " +
            "r.status) " +
            "FROM RechargePlan r")
    List<PlanDetailsDTO> findPlanDetails();
}