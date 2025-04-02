package com.rechargeflow.service;

import com.rechargeflow.dto.PlanDetailsDTO;
import com.rechargeflow.model.Category;
import com.rechargeflow.model.RechargePlan;
import com.rechargeflow.repository.CategoryRepository; // New import
import com.rechargeflow.repository.PlanRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PlanService {
    @Autowired
    private PlanRepo planRepo;

    @Autowired
    private CategoryRepository categoryRepository; // New dependency

    @Transactional(readOnly = true)
    public List<PlanDetailsDTO> getPlans() {
        return planRepo.findPlanDetails();
    }

    public void updatePlan(PlanDetailsDTO planDetailsDTO) {
        planRepo.findById(planDetailsDTO.getPlanId()).ifPresentOrElse(plan -> {
            try {
                plan.setPlanName(planDetailsDTO.getPlanName());
                plan.setPlanType(planDetailsDTO.getPlanType());
                Category category = categoryRepository.findByName(planDetailsDTO.getPlanType().toString())
                        .orElseThrow(() -> new RuntimeException("Category not found: " + planDetailsDTO.getPlanType()));
                plan.setCategory(category);
                plan.setPrice(planDetailsDTO.getPrice());
                plan.setData(planDetailsDTO.getData());
                plan.setValidity(planDetailsDTO.getValidity());
                plan.setFeature(planDetailsDTO.getFeature());
                plan.setStatus(planDetailsDTO.getStatus());
                planRepo.save(plan);
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid status: " + planDetailsDTO.getStatus());
            }
        }, () -> {
            throw new RuntimeException("Plan not found with ID: " + planDetailsDTO.getPlanId());
        });
    }

    public void addPlan(RechargePlan rechargePlan) {
        if (rechargePlan.getCategory() != null) {
            Category category = categoryRepository.findByName(rechargePlan.getCategory().getName())
                    .orElseThrow(() -> new RuntimeException("Category not found: " + rechargePlan.getCategory().getName()));
            rechargePlan.setCategory(category);
        }
        planRepo.save(rechargePlan);
    }

    public void deletePlan(Long planId) {
        planRepo.deleteById(planId);
    }
}