import os
import requests
from typing import Optional
from dotenv import load_dotenv

load_dotenv()
API_KEY: Optional[str] = os.getenv("RIOT_API_KEY")

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
            "kills": my_data['kills'],
            "deaths": my_data['deaths'],
            "assists": my_data['assists'],
            "damage": my_data['totalDamageDealtToChampions'],
            "cs": my_data['totalMinionsKilled'] + my_data['neutralMinionsKilled'],
            "gold": my_data['goldEarned'],
            "win": my_data['win']
        },
        "enemy": {
            "champion": enemy_data['championName'],
            "kills": enemy_data['kills'],
            "deaths": enemy_data['deaths'],
            "assists": enemy_data['assists'],
            "damage": enemy_data['totalDamageDealtToChampions'],
            "cs": enemy_data['totalMinionsKilled'] + enemy_data['neutralMinionsKilled'],
            "gold": enemy_data['goldEarned'],
            "win": enemy_data['win']
        }
    }
    
    return stats_summary

# Application entry point
if __name__ == "__main__":
    print("\n=== 🎮 LoL Match Analyzer ===")
    
    my_game_name: str = input("Enter your Riot ID (e.g., vladimus2005): ")
    my_tag_line: str = input("Enter your Tagline without # (e.g., EUNE): ")
    print("---------------------------------")
    
    my_puuid: Optional[str] = get_puuid(my_game_name, my_tag_line)
    
    if my_puuid:
        last_match_id: Optional[str] = get_last_match_id(my_puuid)
        
        if last_match_id:
            match_data: Optional[dict] = get_match_details(last_match_id)
            
            if match_data:
                game_mode: str = match_data['info']['gameMode']
                game_duration_sec: int = match_data['info']['gameDuration']
                game_duration_min: int = game_duration_sec // 60
                
                print(f"\nMatch Info: {game_mode} game lasting {game_duration_min} minutes.")
                analysis_result = analyze_lane_diff(match_data, my_puuid)
                
            if analysis_result:
                p_stats = analysis_result['player']
                e_stats = analysis_result['enemy']
                role = analysis_result['role']
                    
                print(f"\n  LANE DIFF ANALYSIS ({role}) ")
                print(f"You ({p_stats['champion']}) vs Enemy ({e_stats['champion']})")
                print(f"Result: {'VICTORY ' if p_stats['win'] else 'DEFEAT '}")
                print("---------------------------------")
                print(f"KDA:    {p_stats['kills']}/{p_stats['deaths']}/{p_stats['assists']}  vs  {e_stats['kills']}/{e_stats['deaths']}/{e_stats['assists']}")
                print(f"CS:     {p_stats['cs']}  vs  {e_stats['cs']}")
                print(f"Damage: {p_stats['damage']:,}  vs  {e_stats['damage']:,}")
                print(f"Gold:   {p_stats['gold']:,}  vs  {e_stats['gold']:,}")