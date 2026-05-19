from fastapi import APIRouter
from app.api.v1 import auth, containers, experiments, inventory, reports, samples, users

router = APIRouter(prefix="/api/v1")
router.include_router(auth.router)
router.include_router(users.router)
router.include_router(containers.router)
router.include_router(samples.router)
router.include_router(inventory.router)
router.include_router(experiments.router)
router.include_router(reports.router)
