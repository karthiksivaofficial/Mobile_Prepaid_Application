package com.rechargeflow.dto;

public class PaymentRequest {
    private int amount;
    private String phoneNumber;
    private int planId;
    private int discountAmount;
    private String paymentMethod;
    private String paymentReference;
    private String gatewayTransactionId;
    private String upiId;
    private String bank;

    // Getters and setters
    public int getAmount() { return amount; }
    public void setAmount(int amount) { this.amount = amount; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public int getPlanId() { return planId; }
    public void setPlanId(int planId) { this.planId = planId; }
    public int getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(int discountAmount) { this.discountAmount = discountAmount; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getPaymentReference() { return paymentReference; }
    public void setPaymentReference(String paymentReference) { this.paymentReference = paymentReference; }
    public String getGatewayTransactionId() { return gatewayTransactionId; }
    public void setGatewayTransactionId(String gatewayTransactionId) { this.gatewayTransactionId = gatewayTransactionId; }
    public String getUpiId() { return upiId; }
    public void setUpiId(String upiId) { this.upiId = upiId; }
    public String getBank() { return bank; }
    public void setBank(String bank) { this.bank = bank; }
}