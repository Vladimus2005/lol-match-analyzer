import os
import requests
from typing import Optional
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()
API_KEY: Optional[str] = os.getenv("RIOT_API_KEY")

app = FastAPI()

@app.get("/")
def read_root():
    return {
        "message": "Welcome to the LoL Match Analyzer API!",
        "hint": "Try accessing /api/analyze/YourGameName/YourTagLine or go to /docs to test the API."
    }

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_puuid(game_name: str, tag_line: str) -> Optional[str]:
    """
    Fetches the Player Universally Unique Identifier (PUUID) using the Riot ID.
    
    The Riot Account API uses broad routing values (europe, americas, asia).
    This function defaults to 'europe' which covers both EUW and EUNE servers.
    
    Args:
        game_name (str): The player's in-game name.
        tag_line (str): The player's tag line (without the '#' symbol).
        
    Returns:
        Optional[str]: The PUUID string if successful, None otherwise.
    """
    url: str = f"https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{game_name}/{tag_line}"
    
    headers: dict[str, Optional[str]] = {
        "X-Riot-Token": API_KEY
    }
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        data: dict = response.json()
        print(f"Success! Found account: {data['gameName']}#{data['tagLine']}")
        return data['puuid']
    else:
        print(f"Error {response.status_code}: Could not find the account.")
        return None

def get_last_match_id(puuid: str) -> Optional[str]:
    """
    Fetches the match ID of the last Ranked Solo/Duo game played by the user.
    
    Args:
        puuid (str): The player's unique PUUID.
        
    Returns:
        Optional[str]: The match ID string if successful, None otherwise.
    """
    # queue=420 is the specific Riot ID for 5v5 Ranked Solo games
    url: str = f"https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids?queue=420&start=0&count=1"
    
    headers: dict[str, Optional[str]] = {
        "X-Riot-Token": API_KEY
    }
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        match_ids: list[str] = response.json()
        if match_ids:
            print(f"Success! Found last Ranked Solo/Duo match: {match_ids[0]}")
            return match_ids[0]
        else:
            print("No Ranked Solo/Duo matches found for this account.")
            return None
    else:
        print(f"Error {response.status_code}: Could not fetch match IDs.")
        return None
    
def get_match_details(match_id: str) -> Optional[dict]:
    """
    Fetches the full details of a specific match using its Match ID.
    
    Args:
        match_id (str): The unique identifier of the match (e.g., EUN1_123456789).
        
    Returns:
        Optional[dict]: A dictionary containing all match statistics if successful, None otherwise.
    """
    url: str = f"https://europe.api.riotgames.com/lol/match/v5/matches/{match_id}"
    
    headers: dict[str, Optional[str]] = {
        "X-Riot-Token": API_KEY
    }
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        print("Success! Downloaded all match details.")
        return response.json()
    else:
        print(f"Error {response.status_code}: Could not fetch match details.")
        return None

def analyze_lane_diff(match_data: dict, player_puuid: str) -> Optional[dict]:
    """
    Finds the player and their direct opponent in the match data,
    extracts their stats, and calculates the lane difference.
    
    Args:
        match_data (dict): The massive dictionary containing all match info.
        player_puuid (str): The PUUID of the user to find them in the match.
        
    Returns:
        Optional[dict]: A summary of the player vs enemy stats, or None on error.
    """
    participants: list[dict] = match_data['info']['participants']
    
    my_data: Optional[dict] = None
    enemy_data: Optional[dict] = None
    
    for p in participants:
        if p['puuid'] == player_puuid:
            my_data = p
            break
            
    if not my_data:
        print("Error: Player not found in the match data.")
        return None
        
    my_role: str = my_data.get('teamPosition', 'UNKNOWN')
    my_team: int = my_data.get('teamId', 0)
    
    for p in participants:
        if p['teamPosition'] == my_role and p['teamId'] != my_team:
            enemy_data = p
            break
            
    if not enemy_data:
        print(f"Error: Could not find a direct opponent for the role: {my_role}")
        return None
        
    stats_summary = {
        "role": my_role,
        "player": {
            "champion": my_data['championName'],
            "champion_id": my_data['championId'],
            "kills": my_data['kills'],
            "deaths": my_data['deaths'],
            "assists": my_data['assists'],
            "damage": my_data['totalDamageDealtToChampions'],
            "cs": my_data['totalMinionsKilled'] + my_data['neutralMinionsKilled'],
            "gold": my_data['goldEarned'],
            "vision": my_data.get('visionScore', 0),
            "objective_dmg": my_data.get('damageDealtToObjectives', 0),
            "cc_time": my_data.get('timeCCingOthers', 0),
            "mitigated_dmg": my_data.get('damageSelfMitigated', 0),
            "win": my_data['win']
        },
        "enemy": {
            "champion": enemy_data['championName'],
            "champion_id": enemy_data['championId'],
            "kills": enemy_data['kills'],
            "deaths": enemy_data['deaths'],
            "assists": enemy_data['assists'],
            "damage": enemy_data['totalDamageDealtToChampions'],
            "cs": enemy_data['totalMinionsKilled'] + enemy_data['neutralMinionsKilled'],
            "gold": enemy_data['goldEarned'],
            "vision": enemy_data.get('visionScore', 0),
            "objective_dmg": enemy_data.get('damageDealtToObjectives', 0),
            "cc_time": enemy_data.get('timeCCingOthers', 0),
            "mitigated_dmg": enemy_data.get('damageSelfMitigated', 0),
            "win": enemy_data['win']
        }
    }
    
    return stats_summary

def calculate_performance_score(player: dict, enemy: dict, role: str) -> dict:
    """
    Compares player stats against the enemy and generates a grade and feedback.
    
    Args:
        player (dict): The player's stats.
        enemy (dict): The enemy's stats.
        role (str): The role for both players
        
    Returns:
        dict: A dictionary containing the 'grade' and a list of 'tips'.
    """
    score: float = 0.0
    tips: list[str] = []
    
    # KDA Analysis
    player_kda = (player['kills'] + player['assists']) / max(1, player['deaths'])
    enemy_kda = (enemy['kills'] + enemy['assists']) / max(1, enemy['deaths'])
    
    if player_kda > enemy_kda:
        score += 30
        tips.append("Excellent KDA! You traded much better than your opponent.")
    else:
        tips.append("Watch your positioning. The enemy had a better KDA ratio.")
        
    if role == "UTILITY":
        vision_diff = player['vision'] - enemy['vision']
        if vision_diff > 15:
            score += 40
            tips.append("Map Hacker! Your vision control completely outclassed the enemy support.")
        elif vision_diff > 0:
            score += 20
            tips.append("Good job on vision, you kept your team safer than the enemy support did.")
        else:
            score -= 15
            tips.append(f"Vision gap. The enemy had {abs(vision_diff)} more vision score. Buy more Control Wards!")
            
        cc_diff = player['cc_time'] - enemy['cc_time']
        if cc_diff > 10:
            score += 15
            tips.append("Great crowd control! You locked down enemies much better than your opponent.")

        if player['assists'] > enemy['assists'] + 5:
            score += 15
            tips.append("Great roaming and kill participation!")
        
    elif role == "JUNGLE":
        obj_diff = player['objective_dmg'] - enemy['objective_dmg']
        if obj_diff > 5000:
            score += 30
            tips.append("Objective Control King! You secured Dragons and Barons much better than the enemy jungler.")
        elif obj_diff < -2000:
            score -= 15
            tips.append("You lacked objective control. Focus more on Dragons and Herald/Grubs next time.")
                
        if player['assists'] + player['kills'] > enemy['assists'] + enemy['kills']:
            score += 15
            tips.append("Great ganking presence across the map!")

    elif role == "TOP":
        obj_diff = player['objective_dmg'] - enemy['objective_dmg']
        if obj_diff > 3000:
            score += 15
            tips.append("Excellent split-pushing pressure on enemy turrets.")
                
        tank_diff = player['mitigated_dmg'] - enemy['mitigated_dmg']
        if tank_diff > 10000:
            score += 10
            tips.append("You acted as a solid frontline, absorbing a massive amount of damage for your team.")
                
        cs_diff = player['cs'] - enemy['cs']
        if cs_diff > 20:
            score += 20
            tips.append(f"Top lane island won: You out-farmed your opponent by {cs_diff} minions.")
        elif cs_diff < 0:
            score -= 10
            tips.append("You fell behind in farm during the laning phase.")

    else:
        cs_diff = player['cs'] - enemy['cs']
        if cs_diff > 20:
            score += 30
            tips.append(f"Great farming! You out-CS'd your opponent by {cs_diff} minions.")
        elif cs_diff > 0:
            score += 15
            tips.append("You had a slight CS advantage, keep focusing on last hits.")
        else:
            score -= 10
            tips.append(f"You fell behind in farm. The enemy got {abs(cs_diff)} more minions than you.")
            
        dmg_diff = player['damage'] - enemy['damage']
        if dmg_diff > 5000:
            score += 25
            tips.append("Huge impact in fights! You dealt significantly more damage.")
        elif dmg_diff > 0:
            score += 10
            tips.append("Good damage output, slightly edging out your lane opponent.")
        else:
            score -= 10
            tips.append("You lacked damage compared to your opponent. Try to participate more in teamfights.")
    
    # Calculate Final Grade based on the score (Max is around 100)
    grade = "D"
    if score >= 80:
        grade = "S"
    elif score >= 60:
        grade = "A"
    elif score >= 40:
        grade = "B"
    elif score >= 20:
        grade = "C"
        
    return {
        "score": score,
        "grade": grade,
        "tips": tips
    }

# Application entry point
@app.get("/api/analyze/{game_name}/{tag_line}")
def analyze_match(game_name: str, tag_line: str) -> dict[str, Any]:
    """
    Example call: http://localhost:8000/api/analyze/vladimus2005/EUNE
    
    Args:
        game_name (str): The player's in-game name.
        tag_line (str): The player's tag line (without the '#' symbol).
        
    Returns:
        Dict[str, Any]: A JSON response containing match info and lane diff data.
    """
    my_puuid: Optional[str] = get_puuid(game_name, tag_line)
    if not my_puuid:
        raise HTTPException(status_code=404, detail="Player not found. Please check the name and tag.")

    last_match_id: Optional[str] = get_last_match_id(my_puuid)
    if not last_match_id:
        raise HTTPException(status_code=404, detail="No Ranked Solo/Duo match found for this account.")

    match_data: Optional[dict] = get_match_details(last_match_id)
    if not match_data:
        raise HTTPException(status_code=500, detail="Error fetching match data from Riot API.")

    analysis_result: Optional[dict] = analyze_lane_diff(match_data, my_puuid)
    if not analysis_result:
        raise HTTPException(status_code=500, detail="Error analyzing direct opponent data.")

    performance = calculate_performance_score(
        analysis_result['player'], 
        analysis_result['enemy'],
        analysis_result['role']
    )
    analysis_result['evaluation'] = performance

    game_duration_min: int = match_data['info']['gameDuration'] // 60
    
    return {
        "status": "success",
        "match_info": {
            "mode": match_data['info']['gameMode'],
            "duration_minutes": game_duration_min
        },
        "data": analysis_result
    }