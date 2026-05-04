from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, status
from fastapi.responses import RedirectResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timedelta, timezone
from pathlib import Path
import os, logging, uuid, jwt, httpx, urllib.parse

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ.get('DB_NAME', 'cs2drop')
STEAM_API_KEY = os.environ.get('STEAM_API_KEY', '')
SECRET_KEY = os.environ.get('SECRET_KEY', 'change-me')
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
BACKEND_URL = os.environ.get('BACKEND_URL', 'http://localhost:8001')
ALGORITHM = "HS256"
TOKEN_EXPIRE_DAYS = 30
INITIAL_BALANCE = 100.00
STEAM_OPENID_URL = "https://steamcommunity.com/openid/login"

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------- Models ----------
class User(BaseModel):
    steam_id: str
    username: str
    avatar: str
    profile_url: str
    balance: float = INITIAL_BALANCE
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_login: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SkinItem(BaseModel):
    id: str
    name: str
    wear: str
    rarity: str
    price: float
    image: str
    locked: bool = False

class InventoryAddRequest(BaseModel):
    skin: SkinItem

class BalanceUpdateRequest(BaseModel):
    amount: float

class BattleCreate(BaseModel):
    cases: List[str]
    mode: str
    underdog: bool = False
    vs_bot: bool = False

class BattleJoin(BaseModel):
    pass

# ---------- Helpers ----------
def create_token(steam_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=TOKEN_EXPIRE_DAYS)
    return jwt.encode({"sub": steam_id, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> dict:
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        steam_id = payload.get("sub")
        if not steam_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"steam_id": steam_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.pop("_id", None)
    return user

async def verify_steam_openid(params: dict) -> bool:
    verify = dict(params)
    verify["openid.mode"] = "check_authentication"
    async with httpx.AsyncClient() as c:
        r = await c.post(STEAM_OPENID_URL, data=verify, timeout=15.0)
        return "is_valid:true" in r.text

async def fetch_steam_profile(steam_id: str) -> Optional[dict]:
    if not STEAM_API_KEY:
        return None
    url = "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/"
    async with httpx.AsyncClient() as c:
        r = await c.get(url, params={"key": STEAM_API_KEY, "steamids": steam_id}, timeout=15.0)
        data = r.json()
        players = data.get("response", {}).get("players", [])
        return players[0] if players else None

# ---------- Auth Routes ----------
@api_router.get("/")
async def root():
    return {"message": "CS2DROP API"}

@api_router.get("/auth/steam")
async def steam_login():
    return_to = f"{BACKEND_URL}/api/auth/steam/callback"
    params = {
        "openid.ns": "http://specs.openid.net/auth/2.0",
        "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
        "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
        "openid.mode": "checkid_setup",
        "openid.realm": BACKEND_URL,
        "openid.return_to": return_to,
    }
    return RedirectResponse(f"{STEAM_OPENID_URL}?{urllib.parse.urlencode(params)}")

@api_router.get("/auth/steam/callback")
async def steam_callback(request: Request):
    params = dict(request.query_params)
    if params.get("openid.mode") != "id_res":
        return RedirectResponse(f"{FRONTEND_URL}/login?error=cancelled")
    if not await verify_steam_openid(params):
        return RedirectResponse(f"{FRONTEND_URL}/login?error=invalid")
    claimed_id = params.get("openid.claimed_id", "")
    steam_id = claimed_id.rsplit("/", 1)[-1]
    if not steam_id.isdigit():
        return RedirectResponse(f"{FRONTEND_URL}/login?error=bad_id")
    profile = await fetch_steam_profile(steam_id)
    if not profile:
        return RedirectResponse(f"{FRONTEND_URL}/login?error=no_profile")
    existing = await db.users.find_one({"steam_id": steam_id})
    now = datetime.now(timezone.utc)
    if existing:
        await db.users.update_one({"steam_id": steam_id}, {"$set": {
            "username": profile.get("personaname"),
            "avatar": profile.get("avatarfull"),
            "profile_url": profile.get("profileurl"),
            "last_login": now,
        }})
    else:
        user = User(
            steam_id=steam_id,
            username=profile.get("personaname", "Player"),
            avatar=profile.get("avatarfull", ""),
            profile_url=profile.get("profileurl", ""),
            balance=INITIAL_BALANCE,
        )
        await db.users.insert_one(user.dict())
    token = create_token(steam_id)
    return RedirectResponse(f"{FRONTEND_URL}/auth/callback?token={token}")

@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user

# ---------- User / Inventory ----------
@api_router.get("/inventory")
async def get_inventory(user: dict = Depends(get_current_user)):
    items = await db.inventory.find({"steam_id": user["steam_id"]}).to_list(2000)
    for it in items:
        it.pop("_id", None)
    return items

@api_router.post("/inventory/add")
async def add_inventory(req: InventoryAddRequest, user: dict = Depends(get_current_user)):
    item = req.skin.dict()
    item["id"] = f"inv_{uuid.uuid4().hex}"
    item["steam_id"] = user["steam_id"]
    item["acquired_at"] = datetime.now(timezone.utc).isoformat()
    await db.inventory.insert_one(item.copy())
    item.pop("_id", None)
    return item

@api_router.post("/inventory/{item_id}/sell")
async def sell_inventory(item_id: str, user: dict = Depends(get_current_user)):
    item = await db.inventory.find_one({"id": item_id, "steam_id": user["steam_id"]})
    if not item:
        raise HTTPException(404, "Not found")
    new_balance = round(user["balance"] + item["price"], 2)
    await db.users.update_one({"steam_id": user["steam_id"]}, {"$set": {"balance": new_balance}})
    await db.inventory.delete_one({"id": item_id, "steam_id": user["steam_id"]})
    return {"balance": new_balance}

@api_router.post("/inventory/sell-all")
async def sell_all(user: dict = Depends(get_current_user)):
    items = await db.inventory.find({"steam_id": user["steam_id"], "locked": {"$ne": True}}).to_list(2000)
    total = round(sum(i["price"] for i in items), 2)
    new_balance = round(user["balance"] + total, 2)
    await db.users.update_one({"steam_id": user["steam_id"]}, {"$set": {"balance": new_balance}})
    await db.inventory.delete_many({"steam_id": user["steam_id"], "locked": {"$ne": True}})
    return {"balance": new_balance, "sold_value": total}

@api_router.post("/inventory/{item_id}/lock")
async def lock_item(item_id: str, user: dict = Depends(get_current_user)):
    item = await db.inventory.find_one({"id": item_id, "steam_id": user["steam_id"]})
    if not item:
        raise HTTPException(404, "Not found")
    new_lock = not item.get("locked", False)
    await db.inventory.update_one({"id": item_id, "steam_id": user["steam_id"]}, {"$set": {"locked": new_lock}})
    return {"locked": new_lock}

@api_router.post("/balance/spend")
async def spend(req: BalanceUpdateRequest, user: dict = Depends(get_current_user)):
    if user["balance"] < req.amount:
        raise HTTPException(400, "Insufficient balance")
    new_balance = round(user["balance"] - req.amount, 2)
    await db.users.update_one(
        {"steam_id": user["steam_id"]},
        {"$set": {"balance": new_balance}, "$inc": {"wagered": req.amount}},
    )
    return {"balance": new_balance}

@api_router.get("/leaderboard")
async def leaderboard():
    users = await db.users.find({}, {"_id": 0, "steam_id": 1, "username": 1, "avatar": 1, "wagered": 1}).sort("wagered", -1).limit(50).to_list(50)
    return [
        {
            "rank": i + 1,
            "steam_id": u["steam_id"],
            "name": u.get("username", "Player"),
            "avatar": u.get("avatar", ""),
            "wagered": round(u.get("wagered", 0) or 0, 2),
            "reward": ["CHAMPION BOX", "CHALLENGER BOX", "CONTENDER BOX"][i] if i < 3 else "-",
        }
        for i, u in enumerate(users)
    ]

@api_router.post("/balance/add")
async def add_balance(req: BalanceUpdateRequest, user: dict = Depends(get_current_user)):
    new_balance = round(user["balance"] + req.amount, 2)
    await db.users.update_one({"steam_id": user["steam_id"]}, {"$set": {"balance": new_balance}})
    return {"balance": new_balance}

# ---------- Battles ----------
@api_router.get("/battles")
async def list_battles():
    battles = await db.battles.find({"status": {"$in": ["open", "in_progress"]}}).sort("created_at", -1).to_list(100)
    for b in battles:
        b.pop("_id", None)
    return battles

@api_router.post("/battles")
async def create_battle(req: BattleCreate, user: dict = Depends(get_current_user)):
    battle = {
        "id": f"battle_{uuid.uuid4().hex[:10]}",
        "creator_id": user["steam_id"],
        "creator_name": user["username"],
        "creator_avatar": user["avatar"],
        "cases": req.cases,
        "mode": req.mode,
        "underdog": req.underdog,
        "vs_bot": req.vs_bot,
        "status": "open",
        "players": [{"steam_id": user["steam_id"], "name": user["username"], "avatar": user["avatar"]}],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.battles.insert_one(battle.copy())
    battle.pop("_id", None)
    return battle

@api_router.post("/battles/{battle_id}/join")
async def join_battle(battle_id: str, user: dict = Depends(get_current_user)):
    battle = await db.battles.find_one({"id": battle_id})
    if not battle:
        raise HTTPException(404, "Battle not found")
    if any(p["steam_id"] == user["steam_id"] for p in battle["players"]):
        raise HTTPException(400, "Already joined")
    battle["players"].append({"steam_id": user["steam_id"], "name": user["username"], "avatar": user["avatar"]})
    await db.battles.update_one({"id": battle_id}, {"$set": {"players": battle["players"]}})
    battle.pop("_id", None)
    return battle

@api_router.get("/battles/{battle_id}")
async def get_battle(battle_id: str):
    battle = await db.battles.find_one({"id": battle_id})
    if not battle:
        raise HTTPException(404, "Battle not found")
    battle.pop("_id", None)
    return battle

@api_router.delete("/battles/{battle_id}")
async def cancel_battle(battle_id: str, user: dict = Depends(get_current_user)):
    battle = await db.battles.find_one({"id": battle_id})
    if not battle:
        raise HTTPException(404, "Not found")
    if battle["creator_id"] != user["steam_id"]:
        raise HTTPException(403, "Not your battle")
    await db.battles.delete_one({"id": battle_id})
    return {"ok": True}

app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
