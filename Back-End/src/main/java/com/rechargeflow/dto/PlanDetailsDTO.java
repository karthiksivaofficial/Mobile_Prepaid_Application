package com.rechargeflow.dto;

import com.rechargeflow.model.RechargePlan;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlanDetailsDTO {
    private Long planId;
    private String planName;
    private String planType;
    private Double price;
    private Double data;
    private Integer validity;
    private String feature;
    private RechargePlan.PlanStatus status;
}