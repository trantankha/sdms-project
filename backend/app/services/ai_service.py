from google import genai
from google.genai import types
import os
from dotenv import load_dotenv
from app.core.knowledge_base import SYSTEM_RULES

load_dotenv()

class AIService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.client = None
        
        if not self.api_key:
            print("WARNING: GEMINI_API_KEY not found in environment variables.")
        else:
            # Initialize the new GenAI Client
            self.client = genai.Client(api_key=self.api_key)
            
        # STRICTLY use Gemini 2.5 Flash as requested for speed and capabilities
        # The new SDK might require model names like 'gemini-2.0-flash-exp' or similar. 
        # 'gemini-2.5-flash' was confirmed available by previous debug, 
        # but safely falling back to 'gemini-2.0-flash' if 2.5 has specific naming in new SDK.
        self.model_name = "gemini-2.5-flash"
        
        # Base Persona
        self.base_instruction = """
        Bạn là "Tinmyn AI" - Trợ lý ảo thông minh của Hệ thống Quản lý Ký túc xá (SDMS).
        
        VAI TRÒ CỦA BẠN:
        - Hỗ trợ sinh viên giải đáp thắc mắc về quy định, thủ tục, và sinh hoạt tại ký túc xá.
        - Giọng điệu: Thân thiện, chuyên nghiệp, ngắn gọn và hữu ích.
        - Luôn xưng hô là "Mình" hoặc "Tinmyn" và gọi người dùng là "Bạn".
        - TUYỆT ĐỐI không bịa đặt thông tin. Nếu không biết, hãy xin lỗi và hướng dẫn liên hệ Admin.
        """

    async def generate_response(self, message: str, user_context: str = "") -> str:
        if not self.client:
             return "Lỗi hệ thống: Chưa cấu hình khóa API."
             
        try:
            # Construct dynamic system prompt
            full_system_prompt = f"""
            {self.base_instruction}

            ---
            KIẾN THỨC VỀ HỆ THỐNG (SYSTEM RULES):
            {SYSTEM_RULES}

            ---
            THÔNG TIN NGƯỜI DÙNG HIỆN TẠI (CONTEXT):
            {user_context if user_context else "Người dùng chưa đăng nhập hoặc không có dữ liệu."}
            
            HÃY TRẢ LỜI DỰA TRÊN THÔNG TIN TRÊN.
            """
            
            # Use the new SDK's generate_content method
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=message,
                config=types.GenerateContentConfig(
                    system_instruction=full_system_prompt
                )
            )
            return response.text
            
        except Exception as e:
            print(f"Error generating AI response with {self.model_name}: {e}")
            if "429" in str(e) or "quota" in str(e).lower():
                return "Hệ thống đang quá tải (Quota Exceeded). Vui lòng thử lại sau ít phút."
            return "Xin lỗi, Tinmyn đang gặp trục trặc kỹ thuật. Vui lòng thử lại sau."

ai_service = AIService()
