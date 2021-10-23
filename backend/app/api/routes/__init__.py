from fastapi import APIRouter
from app.api.routes.users import router as users_router
from app.api.routes.profiles import router as profiles_router
# from app.api.routes.ergo import router as ergo_router
from app.api.routes.asset import router as asset_router
from app.api.routes.emails import router as emails_router

router = APIRouter()

router.include_router(users_router, prefix="/users", tags=["users"])
router.include_router(profiles_router, prefix="/profiles", tags=["profiles"])
# router.include_router(ergo_router, prefix="/ergo", tags=["ergo"])
router.include_router(asset_router, prefix="/asset", tags=["asset"])
router.include_router(emails_router, prefix="/emails", tags=["emails"])