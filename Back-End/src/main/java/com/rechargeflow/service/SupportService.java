package com.rechargeflow.service;

import com.rechargeflow.dto.SupportTicketDTO;
import com.rechargeflow.model.SupportTicket;
import com.rechargeflow.repository.SupportRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SupportService {
    @Autowired
    private SupportRepo supportRepo;
    public List<SupportTicketDTO> getSupportDetails(){
        return supportRepo.getSupportTicketDetails();
    }
}
