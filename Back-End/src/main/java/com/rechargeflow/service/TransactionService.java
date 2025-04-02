package com.rechargeflow.service;

import com.rechargeflow.dto.PlanDetailsDTO;
import com.rechargeflow.dto.TransactionDetailsDTO;
import com.rechargeflow.repository.PlanRepo;
import com.rechargeflow.repository.TransactionRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepo transactionRepo;

    @Transactional(readOnly = true)
    public List<TransactionDetailsDTO> getTransactionDetails() {
        return transactionRepo.getTransactionDetails();
    }
}
