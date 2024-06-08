import requests
import sys
import json

accessToken = ''
baseUrl = f'https://eu.api.blizzard.com/profile/wow/character/everlook/CHARACTERNAME/equipment?namespace=profile-classic-eu&locale=en_DE&access_token={accessToken}'
wowheadBaseUrl = 'https//www.wowhead.com/cata/de/item='

slotNames = {
    "HEAD": 0,
    "NECK": 1,
    "SHOULDER": 2,
    "SHIRT": 3,
    "CHEST": 4,
    "WAIST": 5,
    "LEGS": 6,
    "FEET": 7,
    "WRIST": 8,
    "HANDS": 9,
    "FINGER_1": 10,
    "FINGER_2": 11,
    "TRINKET_1": 12,
    "TRINKET_2": 13,
    "BACK": 14,
    "MAIN_HAND": 15,
    "OFF_HAND": 16,
    "RANGED": 17,
    "TABARD": 18
}

affixStats = {
    2802: "AGILITY",
    2803: "STAMINA",
    2804: "INTELLECT",
    2805: "STRENGTH",
    2806: "SPIRIT",
    2815: "DODGE_RATING",
    2822: "CRIT_RATING",
    3726: "HASTE_RATING",
    3727: "HIT_RATING",
    4058: "EXPERTISE_RATING",
    4059: "MASTERY_RATING",
    4060: "PARRY_RATING"
}

ignore_enchant = [3,18]

def get_sorted_equipment(characterName):
    character = requests.get(baseUrl.replace("CHARACTERNAME", characterName.lower())).json()
    enchants = requests.get('https://raw.githubusercontent.com/fuantomu/envy-armory/main/enchants.json').json()
    affixes = requests.get("https://raw.githubusercontent.com/fuantomu/envy-armory/main/affix.json").json()
    sortedEquipment = {
                    "HEAD": {}, 
                    "NECK": {},
                    "SHOULDER": {},
                    "SHIRT": {},
                    "CHEST": {},
                    "WAIST": {},
                    "LEGS": {},
                    "FEET": {},
                    "WRIST": {},
                    "HANDS": {},
                    "FINGER_1": {},
                    "FINGER_2": {},
                    "TRINKET_1": {},
                    "TRINKET_2": {},
                    "BACK": {},
                    "MAIN_HAND": {},
                    "OFF_HAND": {},
                    "RANGED": {},
                    "TABARD": {} 
    }
    items = character["equipped_items"]
    for item in items:
        item["link"] = ''
        if not slotNames[item["slot"]["type"]] in ignore_enchant:
            if item.get("enchantments"):
                
                if item["enchantments"][0]["enchantment_id"] != 4080 and (item["enchantments"][0]["enchantment_slot"]["id"] == 0 or any(entry.get("enchantment_id") == 3729 for entry in item["enchantments"])):
                    item["link"] += "&ench="

                filtered = [enchant for enchant in enchants[str(slotNames[item["slot"]["type"]])] if any(enchant["id"] == item_enchant["enchantment_id"] for item_enchant in item["enchantments"]) or any(entry.get("enchantment_id") == 3729 for entry in item["enchantments"])]
                item["enchants"] = filtered
                if len(filtered) > 0:                    
                    item["link"] += ":".join(str(entry["id"]) for entry in filtered)

                if len(item["enchantments"]) > 0:
                    filtered = [entry for entry in item["enchantments"] if entry["enchantment_slot"]["id"] == 2 or entry["enchantment_slot"]["id"] == 3 or entry["enchantment_slot"]["id"] == 4]
                    item["gems"] = [{"id": entry["source_item"]["id"]} for entry in filtered]
                    if len(filtered) > 0:
                        item["link"] += "&gems="

                    for gem in filtered:
                        item["link"] += str(gem["source_item"]["id"])

                        if gem != filtered[-1]:
                            item["link"] += ":"
                        
                    if affixes.get(item["inventory_type"]["type"]):
                        if item["item"]["id"] in affixes[item["inventory_type"]["type"]]["ids"]:
                            filtered = [entry for entry in item["enchantments"] if entry["enchantment_slot"]["id"] == 8 or entry["enchantment_slot"]["id"] == 10 or entry["enchantment_slot"]["id"] == 9 or entry["enchantment_slot"]["id"] == 11]
                    
                            if len(filtered) > 0:
                                item["link"] += "&rand="
                            affixNames = [affixStats[entry.get("enchantment_id")] for entry in filtered]
                            for affix in affixes[item["inventory_type"]["type"]]["affix"]:
                                if all([stat in affixes[item["inventory_type"]["type"]]["affix"][affix]["stats"] for stat in affixNames]):
                                    item["link"] += str(affix)
                                    break
            
            if item.get("set"):
                item["link"] += "&pcs="
                item["link"] += ":".join([str(item["item"]["id"]) for item in items])
            
            if len(item["link"]) > 0:
                item["link"] = item["link"][1:]
        sortedEquipment[item["slot"]["type"]] = item

    return sortedEquipment


if __name__ == "__main__":
    result = get_sorted_equipment(sys.argv[1])
    print(json.dumps(result))
    exit