from fastapi import APIRouter
from app.api.v1.endpoints import auth, rooms, contracts, services, communication, finance, users, conduct, transfers, dashboard, support, payment, chat

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(rooms.router, prefix="/rooms", tags=["Rooms"])
api_router.include_router(contracts.router, prefix="/contracts", tags=["Contracts"])
api_router.include_router(services.router, prefix="/services", tags=["Services"])
api_router.include_router(communication.router, prefix="/announcements", tags=["Communication"])
api_router.include_router(finance.router, prefix="/finance", tags=["Finance"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(conduct.router, prefix="/conduct", tags=["Conduct"])
api_router.include_router(transfers.router, prefix="/transfers", tags=["Transfers"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(support.router, prefix="/support", tags=["Support"])
api_router.include_router(chat.router, prefix="/chat", tags=["AI Chat"])
api_router.include_router(payment.router, prefix="/payment", tags=["Payment"])