import hmac
import hashlib
from datetime import datetime
from typing import Dict, Any
from uuid import UUID
from app.core.config import settings
from app.models.enums import InvoiceStatus, PaymentMethod
from app.schemas.finance import PaymentCreate
from app.services.finance_service import finance_service
from sqlalchemy.orm import Session
import urllib.parse

class PaymentGatewayService:
    def create_payment_url(self, invoice_id: UUID, amount: float, ip_addr: str, billing_name: str, student_info: str = "Unknown") -> str:
        short_id = str(invoice_id).split('-')[0].upper()
        order_desc = f"THANH TOAN HOA DON {short_id}"

        # 1. Create Order Info
        order_info = {
            "orderId": str(invoice_id),
            "amount": int(amount),
            "ipAddr": ip_addr,
            "createDate": datetime.now().strftime("%Y%m%d%H%M%S"),
            "orderDesc": order_desc,
            "billingName": billing_name or "Unknown",
            "studentInfo": student_info,
        }
        
        # 2. Sort parameters to ensure consistent signature
        sorted_params = sorted(order_info.items())
        
        # 3. Create Query String (URL Encoded)
        query_string = "&".join([f"{k}={urllib.parse.quote(str(v))}" for k, v in sorted_params])
        
        # 4. Create Signature
        signature = hmac.new(
            settings.PAYMENT_SECRET_KEY.encode('utf-8'),
            query_string.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        # 5. Return Full URL (Frontend Gateway Path)
        base_url = "/payment-gateway" 
        return f"{base_url}?{query_string}&signature={signature}"

    def verify_ipn(self, params: Dict[str, Any]) -> bool:
        """
        Verifies the incoming IPN request signature.
        """
        if "signature" not in params:
            return False
            
        received_signature = params.pop("signature")
        
        # Secure Params to Hash (matches what we sent)
        # Note: In this Mock Setup, we re-use the ORIGINAL signature sent TO the gateway.
        # Therefore, we must only verify the keys that were originally signed.
        # Real Gateway would generate a NEW signature for the connection.
        valid_keys = ["orderId", "amount", "ipAddr", "createDate", "orderDesc", "billingName", "studentInfo"]
        filtered_params = {k: v for k, v in params.items() if k in valid_keys}
        
        sorted_params = sorted(filtered_params.items())
        
        query_string = "&".join([f"{k}={urllib.parse.quote(str(v))}" for k, v in sorted_params])
        
        expected_signature = hmac.new(
            settings.PAYMENT_SECRET_KEY.encode('utf-8'),
            query_string.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(expected_signature, received_signature)

    def process_ipn(self, db: Session, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process the IPN (Webhook) from Gateway.
        """
        # 1. Verify Signature
        if not self.verify_ipn(params.copy()):
            return {"RspCode": "97", "Message": "Invalid Signature"}
            
        # 2. Check Response Code (00 = Success)
        if params.get("responseCode") != "00":
             return {"RspCode": "00", "Message": "Confirm Success"} # Just confirm receipt
             
        # 3. Process Payment
        invoice_id = params.get("orderId")
        amount = float(params.get("amount"))
        transaction_no = params.get("vnp_TransactionNo", f"VIRTUAL_{datetime.now().strftime('%Y%m%d%H%M%S')}")
        
        try:
            # Create Payment Record
            payment_in = PaymentCreate(
                 invoice_id=UUID(invoice_id),
                 amount=amount,
                 payment_method=PaymentMethod.VIRTUAL_BANK,
                 transaction_id=str(transaction_no)
            )
            finance_service.process_payment(db, payment_in)
            
            return {"RspCode": "00", "Message": "Confirm Success"}
        except Exception as e:
            print(f"Payment Processing Error: {e}")
            return {"RspCode": "99", "Message": f"Error: {str(e)}"}

payment_gateway_service = PaymentGatewayService()
