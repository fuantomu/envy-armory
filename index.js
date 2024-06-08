const accessToken = 'EU725AIXGpCL36IAx42VYPL0A1yW4zO863'
const baseUrl = `https://eu.api.blizzard.com/profile/wow/character/everlook/CHARACTERNAME/equipment?namespace=profile-classic-eu&locale=en_DE&access_token=${accessToken}`
const wowheadBaseUrl = 'https//www.wowhead.com/cata/de/item='

const slotNames = {
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

const affixStats = {
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

const ignore_enchant = [12,13,17]

function getSortedEquipment(characterName) {
    return fetch(baseUrl.replace("CHARACTERNAME", characterName.toLowerCase())).then(res => res.json()).then(character => {
        return fetch("https://raw.githubusercontent.com/fuantomu/envy-armory/main/enchants.json").then(res => res.json()).then(enchants => {
            return fetch("https://raw.githubusercontent.com/fuantomu/envy-armory/main/affix.json").then(res => res.json()).then(affixes => {
                const sortedEquipment = {
                    0: {}, 
                    1: {}, 
                    2: {}, 
                    3: {}, 
                    4: {}, 
                    5: {}, 
                    6: {}, 
                    7: {}, 
                    8: {}, 
                    9: {}, 
                    10: {}, 
                    11: {}, 
                    12: {}, 
                    13: {}, 
                    14: {}, 
                    15: {}, 
                    16: {}, 
                    17: {}, 
                    18: {}, 
                }
                const items = character["equipped_items"]
                for(item of items) {
                    item["link"] = `${wowheadBaseUrl}${item["item"]["id"]}`
                    if(!ignore_enchant.includes(slotNames[item["slot"]["type"]])) {
                        if(item["enchantments"]){
                            const beltBuckle = (entry) => entry["enchantment_id"] === 3729
                            if(item["enchantments"][0]["enchantment_id"] !== 4080 && (item["enchantments"][0]["enchantment_slot"]["id"] === 0 || item["enchantments"].some(beltBuckle))){
                                
                                item["link"] += "&ench="
                            }

                            filtered = enchants[slotNames[item["slot"]["type"]]].filter(entry => entry["id"] === item["enchantments"][0]["enchantment_id"] || item["enchantments"].some(beltBuckle))
                            if(filtered.length > 0){
                                item["link"] += item["enchantments"][0]["enchantment_id"]
                            }
                            
                            if(item["enchantments"].length > 0){
                                filtered = item["enchantments"].filter(entry => entry["enchantment_slot"]["id"] === 2 || entry["enchantment_slot"]["id"] === 3)
                                if(filtered.length > 0){
                                    item["link"] += "&gems="
                                }
                                for(gem in filtered){
                                    item["link"] += filtered[gem]["source_item"]["id"]

                                    if(gem < filtered.length-1){
                                        item["link"] += ":"
                                    }
                                    
                                }
                                filtered = item["enchantments"].filter(entry => entry["enchantment_slot"]["id"] === 8 || entry["enchantment_slot"]["id"] === 9 || entry["enchantment_slot"]["id"] === 10 || entry["enchantment_slot"]["id"] === 11)
                                if(affixes[item["inventory_type"]["type"]]){
                                    if(affixes[item["inventory_type"]["type"]]["ids"].includes(item["item"]["id"])){
                                        filtered = item["enchantments"].filter(entry => entry["enchantment_slot"]["id"] === 8 || entry["enchantment_slot"]["id"] === 9 || entry["enchantment_slot"]["id"] === 10 || entry["enchantment_slot"]["id"] === 11)
                                        if(filtered.length > 0){
                                            item["link"] += "&rand="
                                        }
                                        affixNames = filtered.map(entry => affixStats[entry["enchantment_id"]])
                                        
                                        filtered = Object.values(affixes[item["inventory_type"]["type"]]["affix"]).filter(affix => {
                                            const includesStat = (currentStat) => affix["stats"].includes(currentStat)

                                            if(affixNames.every(includesStat)){
                                                return true
                                            }
                                        })

                                        for(entry in affixes[item["inventory_type"]["type"]]["affix"]){
                                            if(affixes[item["inventory_type"]["type"]]["affix"][entry]["name"] === filtered[0]["name"] ){
                                                item["link"] += entry
                                                break
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if(item["set"]){
                        item["link"] += "&pcs="
                        item["link"] += items.map(item => `${item["item"]["id"]}`).join(":")
                    }
                    
                    sortedEquipment[slotNames[item["slot"]["type"]]] = item
                }
                return sortedEquipment
            })
        })
    })
}
                    
//module.exports = { getSortedEquipment }

getSortedEquipment("ivoryii").then(resp => {
    console.log(resp)
})