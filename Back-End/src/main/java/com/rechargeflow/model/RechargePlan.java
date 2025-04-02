package com.rechargeflow.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "Recharge_Plan")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RechargePlan {
    @Id
    @Column(name = "plan_id")
    private Long planId;

    @Column(name = "plan_name", length = 255, nullable = false)
    private String planName;

    @Column(name = "plan_type", nullable = false)
    private String planType; // Changed from Enum to String

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(name = "price", nullable = false)
    private Double price;

    @Column(name = "data", nullable = false)
    private Double data;

    @Column(name = "validity", nullable = false)
    private Integer validity;

    @Column(name = "feature", length = 255)
    private String feature;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private PlanStatus status;

    @Column(name = "created_date", updatable = false)
    private LocalDateTime createdDate = LocalDateTime.now();

    public enum PlanStatus {
        ACTIVE, INACTIVE, DELETED
    }
}