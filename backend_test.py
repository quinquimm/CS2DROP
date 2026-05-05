#!/usr/bin/env python3
"""
CS2DROP Backend API Test Suite
Tests all backend endpoints with Steam OpenID + JWT auth + MongoDB
"""

import asyncio
import httpx
import jwt
from datetime import datetime, timedelta, timezone
from motor.motor_asyncio import AsyncIOMotorClient
import sys

# Configuration from .env
BASE_URL = "https://csgo-skin-casino.preview.emergentagent.com/api"
SECRET_KEY = "cs2drop_secret_change_in_prod_xyz123"
MONGO_URL = "mongodb://localhost:27017"
DB_NAME = "test_database"
TEST_STEAM_ID = "76561197960287930"
TEST_STEAM_ID_2 = "76561197960287931"  # For multi-user battle tests

# Test results tracking
test_results = []

def log_test(name: str, passed: bool, details: str = ""):
    """Log test result"""
    status = "✅ PASS" if passed else "❌ FAIL"
    test_results.append({"name": name, "passed": passed, "details": details})
    print(f"{status} | {name}")
    if details:
        print(f"    Details: {details}")

def generate_jwt(steam_id: str) -> str:
    """Generate JWT token for testing"""
    expire = datetime.now(timezone.utc) + timedelta(days=1)
    return jwt.encode({"sub": steam_id, "exp": expire}, SECRET_KEY, algorithm="HS256")

async def setup_test_users():
    """Create test users in MongoDB"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Clear existing test users
    await db.users.delete_many({"steam_id": {"$in": [TEST_STEAM_ID, TEST_STEAM_ID_2]}})
    await db.inventory.delete_many({"steam_id": {"$in": [TEST_STEAM_ID, TEST_STEAM_ID_2]}})
    await db.battles.delete_many({})
    
    # Create test users
    test_user_1 = {
        "steam_id": TEST_STEAM_ID,
        "username": "TestPlayer1",
        "avatar": "https://avatars.steamstatic.com/test1.jpg",
        "profile_url": "https://steamcommunity.com/id/testplayer1",
        "balance": 100.00,
        "wagered": 0,
        "created_at": datetime.now(timezone.utc),
        "last_login": datetime.now(timezone.utc)
    }
    
    test_user_2 = {
        "steam_id": TEST_STEAM_ID_2,
        "username": "TestPlayer2",
        "avatar": "https://avatars.steamstatic.com/test2.jpg",
        "profile_url": "https://steamcommunity.com/id/testplayer2",
        "balance": 100.00,
        "wagered": 50,  # For leaderboard testing
        "created_at": datetime.now(timezone.utc),
        "last_login": datetime.now(timezone.utc)
    }
    
    await db.users.insert_one(test_user_1)
    await db.users.insert_one(test_user_2)
    
    client.close()
    print("✓ Test users created in MongoDB")

async def test_root_endpoint():
    """Test 1: GET /api/ returns welcome message"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{BASE_URL}/")
            passed = response.status_code == 200 and response.json().get("message") == "CS2DROP API"
            log_test("GET /api/ - Root endpoint", passed, 
                    f"Status: {response.status_code}, Response: {response.json()}")
        except Exception as e:
            log_test("GET /api/ - Root endpoint", False, f"Error: {str(e)}")

async def test_steam_login_redirect():
    """Test 2: GET /api/auth/steam redirects to Steam OpenID"""
    async with httpx.AsyncClient(follow_redirects=False) as client:
        try:
            response = await client.get(f"{BASE_URL}/auth/steam")
            is_redirect = response.status_code in [307, 302]
            location = response.headers.get("location", "")
            has_steam_url = "steamcommunity.com/openid/login" in location
            has_openid_params = "openid.ns" in location and "openid.mode=checkid_setup" in location
            # Check for both encoded and unencoded versions of the callback URL
            has_return_to = "openid.return_to" in location and ("auth/steam/callback" in location or "auth%2Fsteam%2Fcallback" in location)
            
            passed = is_redirect and has_steam_url and has_openid_params and has_return_to
            log_test("GET /api/auth/steam - Steam OpenID redirect", passed,
                    f"Status: {response.status_code}, Location: {location[:100]}...")
        except Exception as e:
            log_test("GET /api/auth/steam - Steam OpenID redirect", False, f"Error: {str(e)}")

async def test_steam_callback_invalid():
    """Test 3: GET /api/auth/steam/callback with invalid params"""
    async with httpx.AsyncClient(follow_redirects=False) as client:
        try:
            # Test with no openid.mode parameter
            response = await client.get(f"{BASE_URL}/auth/steam/callback")
            is_redirect = response.status_code in [307, 302]
            location = response.headers.get("location", "")
            has_error = "error=cancelled" in location
            
            passed = is_redirect and has_error
            log_test("GET /api/auth/steam/callback - Invalid params", passed,
                    f"Status: {response.status_code}, Location: {location}")
        except Exception as e:
            log_test("GET /api/auth/steam/callback - Invalid params", False, f"Error: {str(e)}")

async def test_auth_me_no_token():
    """Test 4: GET /api/auth/me without token returns 401"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{BASE_URL}/auth/me")
            passed = response.status_code == 401
            log_test("GET /api/auth/me - No token (401)", passed,
                    f"Status: {response.status_code}")
        except Exception as e:
            log_test("GET /api/auth/me - No token (401)", False, f"Error: {str(e)}")

async def test_auth_me_with_token():
    """Test 5: GET /api/auth/me with valid token returns user"""
    token = generate_jwt(TEST_STEAM_ID)
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{BASE_URL}/auth/me", headers=headers)
            passed = response.status_code == 200
            if passed:
                data = response.json()
                passed = (data.get("steam_id") == TEST_STEAM_ID and 
                         "username" in data and 
                         "balance" in data)
            log_test("GET /api/auth/me - With valid token", passed,
                    f"Status: {response.status_code}, User: {response.json() if passed else 'N/A'}")
        except Exception as e:
            log_test("GET /api/auth/me - With valid token", False, f"Error: {str(e)}")

async def test_inventory_get_empty():
    """Test 6: GET /api/inventory returns empty array initially"""
    token = generate_jwt(TEST_STEAM_ID)
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{BASE_URL}/inventory", headers=headers)
            passed = response.status_code == 200 and isinstance(response.json(), list)
            log_test("GET /api/inventory - Empty inventory", passed,
                    f"Status: {response.status_code}, Items: {len(response.json())}")
        except Exception as e:
            log_test("GET /api/inventory - Empty inventory", False, f"Error: {str(e)}")

async def test_inventory_add():
    """Test 7: POST /api/inventory/add adds item"""
    token = generate_jwt(TEST_STEAM_ID)
    headers = {"Authorization": f"Bearer {token}"}
    
    skin_data = {
        "skin": {
            "id": "temp_id",
            "name": "AK-47 | Redline",
            "wear": "Field-Tested",
            "rarity": "Classified",
            "price": 50.00,
            "image": "https://example.com/ak47.jpg",
            "locked": False
        }
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(f"{BASE_URL}/inventory/add", headers=headers, json=skin_data)
            passed = response.status_code == 200
            if passed:
                data = response.json()
                passed = (data.get("name") == "AK-47 | Redline" and 
                         data.get("price") == 50.00 and
                         "id" in data and data["id"].startswith("inv_"))
                # Store item ID for later tests
                global added_item_id
                added_item_id = data.get("id")
            log_test("POST /api/inventory/add - Add item", passed,
                    f"Status: {response.status_code}, Item ID: {added_item_id if passed else 'N/A'}")
        except Exception as e:
            log_test("POST /api/inventory/add - Add item", False, f"Error: {str(e)}")

async def test_inventory_lock():
    """Test 8: POST /api/inventory/{id}/lock toggles lock state"""
    token = generate_jwt(TEST_STEAM_ID)
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(f"{BASE_URL}/inventory/{added_item_id}/lock", headers=headers)
            passed = response.status_code == 200
            if passed:
                data = response.json()
                passed = data.get("locked") == True
            log_test("POST /api/inventory/{id}/lock - Lock item", passed,
                    f"Status: {response.status_code}, Locked: {data.get('locked') if passed else 'N/A'}")
        except Exception as e:
            log_test("POST /api/inventory/{id}/lock - Lock item", False, f"Error: {str(e)}")

async def test_inventory_add_second():
    """Test 9: Add second unlocked item for sell-all test"""
    token = generate_jwt(TEST_STEAM_ID)
    headers = {"Authorization": f"Bearer {token}"}
    
    skin_data = {
        "skin": {
            "id": "temp_id_2",
            "name": "AWP | Dragon Lore",
            "wear": "Factory New",
            "rarity": "Covert",
            "price": 150.00,
            "image": "https://example.com/awp.jpg",
            "locked": False
        }
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(f"{BASE_URL}/inventory/add", headers=headers, json=skin_data)
            passed = response.status_code == 200
            if passed:
                data = response.json()
                global second_item_id
                second_item_id = data.get("id")
            log_test("POST /api/inventory/add - Add second item", passed,
                    f"Status: {response.status_code}, Item ID: {second_item_id if passed else 'N/A'}")
        except Exception as e:
            log_test("POST /api/inventory/add - Add second item", False, f"Error: {str(e)}")

async def test_inventory_sell():
    """Test 10: POST /api/inventory/{id}/sell sells item and updates balance"""
    token = generate_jwt(TEST_STEAM_ID)
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(f"{BASE_URL}/inventory/{second_item_id}/sell", headers=headers)
            passed = response.status_code == 200
            if passed:
                data = response.json()
                # Balance should be 100 (initial) + 150 (AWP price) = 250
                passed = data.get("balance") == 250.00
            log_test("POST /api/inventory/{id}/sell - Sell item", passed,
                    f"Status: {response.status_code}, New balance: {data.get('balance') if passed else 'N/A'}")
        except Exception as e:
            log_test("POST /api/inventory/{id}/sell - Sell item", False, f"Error: {str(e)}")

async def test_inventory_sell_all():
    """Test 11: POST /api/inventory/sell-all sells unlocked items only"""
    token = generate_jwt(TEST_STEAM_ID)
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(f"{BASE_URL}/inventory/sell-all", headers=headers)
            passed = response.status_code == 200
            if passed:
                data = response.json()
                # Should sell nothing (first item is locked), balance stays 250
                passed = data.get("balance") == 250.00 and data.get("sold_value") == 0
            log_test("POST /api/inventory/sell-all - Sell unlocked items", passed,
                    f"Status: {response.status_code}, Balance: {data.get('balance') if passed else 'N/A'}, Sold: {data.get('sold_value') if passed else 'N/A'}")
        except Exception as e:
            log_test("POST /api/inventory/sell-all - Sell unlocked items", False, f"Error: {str(e)}")

async def test_balance_spend():
    """Test 12: POST /api/balance/spend decrements balance and increments wagered"""
    token = generate_jwt(TEST_STEAM_ID)
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(f"{BASE_URL}/balance/spend", headers=headers, json={"amount": 10.00})
            passed = response.status_code == 200
            if passed:
                data = response.json()
                # Balance should be 250 - 10 = 240
                passed = data.get("balance") == 240.00
            log_test("POST /api/balance/spend - Spend balance", passed,
                    f"Status: {response.status_code}, New balance: {data.get('balance') if passed else 'N/A'}")
        except Exception as e:
            log_test("POST /api/balance/spend - Spend balance", False, f"Error: {str(e)}")

async def test_balance_spend_insufficient():
    """Test 13: POST /api/balance/spend with insufficient balance returns 400"""
    token = generate_jwt(TEST_STEAM_ID)
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(f"{BASE_URL}/balance/spend", headers=headers, json={"amount": 1000.00})
            passed = response.status_code == 400
            log_test("POST /api/balance/spend - Insufficient balance (400)", passed,
                    f"Status: {response.status_code}")
        except Exception as e:
            log_test("POST /api/balance/spend - Insufficient balance (400)", False, f"Error: {str(e)}")

async def test_balance_add():
    """Test 14: POST /api/balance/add increments balance"""
    token = generate_jwt(TEST_STEAM_ID)
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(f"{BASE_URL}/balance/add", headers=headers, json={"amount": 50.00})
            passed = response.status_code == 200
            if passed:
                data = response.json()
                # Balance should be 240 + 50 = 290
                passed = data.get("balance") == 290.00
            log_test("POST /api/balance/add - Add balance", passed,
                    f"Status: {response.status_code}, New balance: {data.get('balance') if passed else 'N/A'}")
        except Exception as e:
            log_test("POST /api/balance/add - Add balance", False, f"Error: {str(e)}")

async def test_battles_list_empty():
    """Test 15: GET /api/battles returns empty array initially"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{BASE_URL}/battles")
            passed = response.status_code == 200 and isinstance(response.json(), list)
            log_test("GET /api/battles - Empty battles list", passed,
                    f"Status: {response.status_code}, Battles: {len(response.json())}")
        except Exception as e:
            log_test("GET /api/battles - Empty battles list", False, f"Error: {str(e)}")

async def test_battles_create():
    """Test 16: POST /api/battles creates battle"""
    token = generate_jwt(TEST_STEAM_ID)
    headers = {"Authorization": f"Bearer {token}"}
    
    battle_data = {
        "cases": ["yakuza_bite", "omakase"],
        "mode": "1v1",
        "underdog": False,
        "vs_bot": True
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(f"{BASE_URL}/battles", headers=headers, json=battle_data)
            passed = response.status_code == 200
            if passed:
                data = response.json()
                passed = (data.get("status") == "open" and
                         data.get("creator_id") == TEST_STEAM_ID and
                         len(data.get("players", [])) == 1 and
                         data.get("mode") == "1v1" and
                         "id" in data)
                global created_battle_id
                created_battle_id = data.get("id")
            log_test("POST /api/battles - Create battle", passed,
                    f"Status: {response.status_code}, Battle ID: {created_battle_id if passed else 'N/A'}")
        except Exception as e:
            log_test("POST /api/battles - Create battle", False, f"Error: {str(e)}")

async def test_battles_get():
    """Test 17: GET /api/battles/{id} returns battle"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{BASE_URL}/battles/{created_battle_id}")
            passed = response.status_code == 200
            if passed:
                data = response.json()
                passed = data.get("id") == created_battle_id
            log_test("GET /api/battles/{id} - Get battle", passed,
                    f"Status: {response.status_code}")
        except Exception as e:
            log_test("GET /api/battles/{id} - Get battle", False, f"Error: {str(e)}")

async def test_battles_get_nonexistent():
    """Test 18: GET /api/battles/{id} with non-existent ID returns 404"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{BASE_URL}/battles/nonexistent_battle_id")
            passed = response.status_code == 404
            log_test("GET /api/battles/{id} - Non-existent (404)", passed,
                    f"Status: {response.status_code}")
        except Exception as e:
            log_test("GET /api/battles/{id} - Non-existent (404)", False, f"Error: {str(e)}")

async def test_battles_join():
    """Test 19: POST /api/battles/{id}/join adds player"""
    token = generate_jwt(TEST_STEAM_ID_2)
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(f"{BASE_URL}/battles/{created_battle_id}/join", headers=headers)
            passed = response.status_code == 200
            if passed:
                data = response.json()
                passed = len(data.get("players", [])) == 2
            log_test("POST /api/battles/{id}/join - Join battle", passed,
                    f"Status: {response.status_code}, Players: {len(data.get('players', [])) if passed else 'N/A'}")
        except Exception as e:
            log_test("POST /api/battles/{id}/join - Join battle", False, f"Error: {str(e)}")

async def test_battles_join_duplicate():
    """Test 20: POST /api/battles/{id}/join with same user returns 400"""
    token = generate_jwt(TEST_STEAM_ID_2)
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(f"{BASE_URL}/battles/{created_battle_id}/join", headers=headers)
            passed = response.status_code == 400
            log_test("POST /api/battles/{id}/join - Duplicate join (400)", passed,
                    f"Status: {response.status_code}")
        except Exception as e:
            log_test("POST /api/battles/{id}/join - Duplicate join (400)", False, f"Error: {str(e)}")

async def test_battles_delete_non_creator():
    """Test 21: DELETE /api/battles/{id} by non-creator returns 403"""
    token = generate_jwt(TEST_STEAM_ID_2)
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.delete(f"{BASE_URL}/battles/{created_battle_id}", headers=headers)
            passed = response.status_code == 403
            log_test("DELETE /api/battles/{id} - Non-creator (403)", passed,
                    f"Status: {response.status_code}")
        except Exception as e:
            log_test("DELETE /api/battles/{id} - Non-creator (403)", False, f"Error: {str(e)}")

async def test_battles_delete_creator():
    """Test 22: DELETE /api/battles/{id} by creator deletes battle"""
    token = generate_jwt(TEST_STEAM_ID)
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.delete(f"{BASE_URL}/battles/{created_battle_id}", headers=headers)
            passed = response.status_code == 200
            log_test("DELETE /api/battles/{id} - Creator deletes", passed,
                    f"Status: {response.status_code}")
        except Exception as e:
            log_test("DELETE /api/battles/{id} - Creator deletes", False, f"Error: {str(e)}")

async def test_leaderboard():
    """Test 23: GET /api/leaderboard returns sorted users"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{BASE_URL}/leaderboard")
            passed = response.status_code == 200
            if passed:
                data = response.json()
                passed = (isinstance(data, list) and
                         len(data) >= 2 and
                         all("rank" in u and "name" in u and "wagered" in u and "reward" in u for u in data))
                # Check that user with wagered=50 is ranked higher than user with wagered=10
                if passed and len(data) >= 2:
                    # TestPlayer2 should be ranked higher (wagered=50) than TestPlayer1 (wagered=10)
                    user2_rank = next((u["rank"] for u in data if u.get("name") == "TestPlayer2"), None)
                    user1_rank = next((u["rank"] for u in data if u.get("name") == "TestPlayer1"), None)
                    if user2_rank and user1_rank:
                        passed = user2_rank < user1_rank
            log_test("GET /api/leaderboard - Sorted by wagered", passed,
                    f"Status: {response.status_code}, Users: {len(data) if passed else 'N/A'}")
        except Exception as e:
            log_test("GET /api/leaderboard - Sorted by wagered", False, f"Error: {str(e)}")

async def run_all_tests():
    """Run all backend tests"""
    print("\n" + "="*70)
    print("CS2DROP Backend API Test Suite")
    print("="*70 + "\n")
    
    print("Setting up test environment...")
    await setup_test_users()
    print()
    
    # Run tests in order
    await test_root_endpoint()
    await test_steam_login_redirect()
    await test_steam_callback_invalid()
    await test_auth_me_no_token()
    await test_auth_me_with_token()
    await test_inventory_get_empty()
    await test_inventory_add()
    await test_inventory_lock()
    await test_inventory_add_second()
    await test_inventory_sell()
    await test_inventory_sell_all()
    await test_balance_spend()
    await test_balance_spend_insufficient()
    await test_balance_add()
    await test_battles_list_empty()
    await test_battles_create()
    await test_battles_get()
    await test_battles_get_nonexistent()
    await test_battles_join()
    await test_battles_join_duplicate()
    await test_battles_delete_non_creator()
    await test_battles_delete_creator()
    await test_leaderboard()
    
    # Summary
    print("\n" + "="*70)
    print("TEST SUMMARY")
    print("="*70)
    
    passed = sum(1 for t in test_results if t["passed"])
    failed = sum(1 for t in test_results if not t["passed"])
    total = len(test_results)
    
    print(f"\nTotal: {total} | Passed: {passed} | Failed: {failed}")
    
    if failed > 0:
        print("\n❌ FAILED TESTS:")
        for t in test_results:
            if not t["passed"]:
                print(f"  - {t['name']}")
                if t["details"]:
                    print(f"    {t['details']}")
    
    print("\n" + "="*70 + "\n")
    
    return failed == 0

if __name__ == "__main__":
    success = asyncio.run(run_all_tests())
    sys.exit(0 if success else 1)
