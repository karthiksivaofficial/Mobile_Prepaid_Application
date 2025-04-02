package com.rechargeflow.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "Plan_Features")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PlanFeature {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "feature_id")
    private Long featureId;

    @ManyToOne
    @JoinColumn(name = "plan_id", nullable = false)
    private RechargePlan plan;

    @Column(name = "feature_name", length = 255, nullable = false)
    private String featureName;

    @Column(name = "feature_value", length = 255, nullable = false)
    private String featureValue;
}