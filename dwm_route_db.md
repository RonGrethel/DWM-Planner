# Dragon Warrior Monsters Route Planning Database

Starter database for a Python planner.

Scope of this first pass:
- NPC breeding opportunities
- boss and fixed-fight monsters that can join
- gate progression requirements and earliest known access points
- a small special-rules section for planner constraints

This file is structured to stay human-readable while also being easy for Python to parse with a few regular expressions or a lightweight markdown parser.

---

## schema_notes

- `key`: stable identifier for the record.
- `type`: one of `npc_breed`, `boss_join`, `gate`, `rule`, `monster_note`.
- `unlock`: earliest progression checkpoint where the record becomes available.
- `close`: checkpoint where the opportunity disappears, if known.
- `pedigree_rule`: for NPC breeding, this should stay `player_only`.
- `sources`: plain-text provenance for later auditing.
- `confidence`: `high`, `medium`, or `low` depending on source quality.

---

## rules

### record
- key: rule_npc_breeding_pedigree
- type: rule
- rule: npc_breeding_pedigree
- value: player_only
- notes:
  - In NPC breeding opportunities, the player's monster is always the pedigree monster.
  - This means NPC monsters can be used as partners but can never occupy the pedigree slot.
- sources:
  - https://gamefaqs.gamespot.com/gbc/197155-dragon-warrior-monsters/faqs/80057/breeding-opportunities
- confidence: high

### record
- key: rule_darkdrium_once
- type: rule
- rule: unique_breed_limit
- subject: DarkDrium
- value: once_per_game
- notes:
  - DarkDrium requires Watabou.
  - The breeding chart notes this can only be done once per game because there is only one Watabou.
- sources:
  - https://dragonquest.fandom.com/wiki/DWM_Breeding
- confidence: medium

### record
- key: rule_story_gates_mandatory
- type: rule
- rule: mandatory_story_gates
- value:
  - Gate of Beginning
  - Gate of Anger
  - Gate of Reflection
- notes:
  - The teleportal list identifies these as the story-central gates required for normal story completion.
- sources:
  - https://dragonquest.fandom.com/wiki/List_of_teleportals_in_Dragon_Warrior_Monsters
- confidence: medium

---

## npc_breeding

### record
- key: npc_teto_iceman
- type: npc_breed
- npc: Teto
- partner_monster: IceMan
- location: Kure
- unlock: after_clearing_e_class
- close: after_clearing_gate_of_anger
- pedigree_rule: player_only
- suggested_outcomes:
  - partner_with: "[BIRD]"
    result: Blizzardy
  - partner_with: "[BEAST]"
    result: Grizzly
- notes:
  - Compatible with any personality and gender.
  - Good early checkpoint opportunity.
- sources:
  - https://gamefaqs.gamespot.com/gbc/197155-dragon-warrior-monsters/faqs/80057/breeding-opportunities
- confidence: high

### record
- key: npc_dob_catfly
- type: npc_breed
- npc: Dob
- partner_monster: CatFly
- location: Fuga
- unlock: after_clearing_e_class
- close: after_clearing_gate_of_anger
- pedigree_rule: player_only
- suggested_outcomes:
  - partner_with: "[DRAGON]"
    result: Tortragon
  - partner_with: "[BUG]"
    result: Gophecada
- notes:
  - Source does not call out a uniquely valuable exclusive result here.
- sources:
  - https://gamefaqs.gamespot.com/gbc/197155-dragon-warrior-monsters/faqs/80057/breeding-opportunities
- confidence: high

### record
- key: npc_mick_deadnite
- type: npc_breed
- npc: Mick
- partner_monster: DeadNite
- location: Lizd
- unlock: after_clearing_d_class
- close: before_c_class_fight
- pedigree_rule: player_only
- suggested_outcomes:
  - partner_with: "[SLIME]"
    result: RockSlime
  - partner_with: DeadNite
    result: DeadNoble
- notes:
  - Dialogue implies Mick leaves by the time Terry fights in C Class.
- sources:
  - https://gamefaqs.gamespot.com/gbc/197155-dragon-warrior-monsters/faqs/80057/breeding-opportunities
  - https://gamefaqs.gamespot.com/gbc/197155-dragon-warrior-monsters/faqs/80057/breeding-opportunities
- confidence: high

### record
- key: npc_mick_lizardman
- type: npc_breed
- npc: Mick
- partner_monster: LizardMan
- location: unspecified
- unlock: after_clearing_e_class
- close: after_clearing_gate_of_anger
- pedigree_rule: player_only
- suggested_outcomes:
  - partner_with: "[BEAST]"
    result: Goategon
  - partner_with: "[DEVIL]"
    result: Lionex
- notes:
  - Source calls these the only truly unique offspring of note from this pairing.
- sources:
  - https://gamefaqs.gamespot.com/gbc/197155-dragon-warrior-monsters/faqs/80057/breeding-opportunities
- confidence: high

### record
- key: npc_may_rayburn
- type: npc_breed
- npc: May
- partner_monster: Rayburn
- location: Gate_of_Anger_area
- unlock: after_clearing_gate_of_anger
- close: after_clearing_a_class
- pedigree_rule: player_only
- suggested_outcomes:
  - partner_with: "[BIRD]"
    result: WhipBird
  - partner_with: "[ZOMBIE]"
    result: Skullgon
- notes:
  - Rayburn is flagged as liking birds in the source text.
- sources:
  - https://gamefaqs.gamespot.com/gbc/197155-dragon-warrior-monsters/faqs/80057/breeding-opportunities
  - https://gamefaqs.gamespot.com/boards/197155-dragon-warrior-monsters/74178072
  - https://gamefaqs.gamespot.com/boards/197155-dragon-warrior-monsters/74178072
- confidence: medium

### record
- key: npc_medalman_fangslime
- type: npc_breed
- npc: MedalMan
- partner_monster: FangSlime
- location: Moha_or_queens_room_note
- unlock: after_clearing_gate_of_anger
- close: after_clearing_s_class
- pedigree_rule: player_only
- suggested_outcomes:
  - partner_with: "[BEAST]"
    result: Unicorn
  - partner_with: "[ZOMBIE]"
    result: Mudron
  - partner_with:
      - GulpBeast
      - Tonguella
    result: SuperTen
- notes:
  - The guide specifically recommends Unicorn as the best pairing.
  - The guide notes Medal Man is found in the Queen's room in Mick's usual seat during this opportunity.
- sources:
  - https://gamefaqs.gamespot.com/gbc/197155-dragon-warrior-monsters/faqs/80057/breeding-opportunities
  - https://gamefaqs.gamespot.com/boards/197155-dragon-warrior-monsters/74178072
- confidence: medium

### record
- key: npc_teto_eyeder
- type: npc_breed
- npc: Teto
- partner_monster: Eyeder
- location: Pach
- unlock: after_clearing_c_class
- close: after_clearing_b_class
- pedigree_rule: player_only
- suggested_outcomes:
  - partner_with:
      - Butterfly
      - TailEater
      - Eyeder
    result: Droll
  - partner_with: "[PLANT]"
    result: EvilSeed
- notes:
  - The guide includes a note that its own class timing may be bugged or mislabeled.
- sources:
  - https://gamefaqs.gamespot.com/gbc/197155-dragon-warrior-monsters/faqs/80057/breeding-opportunities
- confidence: medium

### record
- key: npc_teto_yeti
- type: npc_breed
- npc: Teto
- partner_monster: Yeti
- location: unspecified
- unlock: after_clearing_a_class
- close: after_clearing_gate_of_reflection
- pedigree_rule: player_only
- suggested_outcomes:
  - partner_with: "[BIRD]"
    result: Blizzardy
  - partner_with: "[ZOMBIE]"
    result: Mudron
- notes:
  - Late-story checkpoint opportunity.
- sources:
  - https://gamefaqs.gamespot.com/gbc/197155-dragon-warrior-monsters/faqs/80057/breeding-opportunities
  - https://gamefaqs.gamespot.com/boards/197155-dragon-warrior-monsters/74178072
- confidence: medium

### record
- key: npc_medalman_metaly
- type: npc_breed
- npc: MedalMan
- partner_monster: Metaly
- location: unspecified
- unlock: after_clearing_s_class
- close: after_clearing_starry_night_tournament
- pedigree_rule: player_only
- suggested_outcomes:
  - partner_with: Metaly
    result: Metabble
  - partner_with: "[BIRD]"
    result: Blizzardy
- notes:
  - Source calls this a very strong opportunity if the player has another Metaly or the Metaly egg from Tiny Medals.
- sources:
  - https://gamefaqs.gamespot.com/gbc/197155-dragon-warrior-monsters/faqs/80057/breeding-opportunities
  - https://gamefaqs.gamespot.com/boards/197155-dragon-warrior-monsters/74178072
- confidence: medium

### record
- key: npc_milayou_skeletor
- type: npc_breed
- npc: Milayou
- partner_monster: Skeletor
- location: starry_night_tournament_period
- unlock: after_clearing_starry_night_tournament
- close: unknown
- pedigree_rule: player_only
- suggested_outcomes:
  - partner_with: Skeletor
    result: Servant
  - partner_with: SabreMan
    result: Roboster
  - partner_with:
      - Grizzly
      - Tonguella
      - Trumpeter
      - Unicorn
      - WildApe
      - Yeti
    result: GulpBeast
- notes:
  - One guide note warns that completing the Queen's Divinegon request may remove this opportunity; this is unverified.
  - Servant is especially relevant for DarkDrium planning.
- sources:
  - https://gamefaqs.gamespot.com/gbc/197155-dragon-warrior-monsters/faqs/80057/breeding-opportunities
  - https://gamefaqs.gamespot.com/boards/197155-dragon-warrior-monsters/74178072
- confidence: medium

---

## boss_joins

### record
- key: boss_join_healer
- type: boss_join
- monster: Healer
- encounter: Gate of Beginning boss
- unlock: gate_of_beginning
- join_method: automatic_after_defeat
- earliest_gate: Gate of Beginning
- notes:
  - Named Hale in the gate description.
- sources:
  - https://dragonquest.fandom.com/wiki/List_of_teleportals_in_Dragon_Warrior_Monsters
- confidence: medium

### record
- key: boss_join_dragon
- type: boss_join
- monster: Dragon
- encounter: Gate of Villager boss
- unlock: gate_of_villager
- join_method: automatic_after_defeat
- earliest_gate: Gate of Villager
- sources:
  - https://dragonquest.fandom.com/wiki/List_of_teleportals_in_Dragon_Warrior_Monsters
- confidence: medium

### record
- key: boss_join_servant
- type: boss_join
- monster: Servant
- encounter: fixed_or_boss_fight
- unlock: unknown_checkpoint
- join_method: feed_meat_after_battle
- preferred_meat: Sirloin
- notes:
  - Community source states one Sirloin should be enough.
- sources:
  - https://gamefaqs.gamespot.com/boards/197155-dragon-warrior-monsters/74178072
- confidence: low

### record
- key: boss_join_darkhorn
- type: boss_join
- monster: DarkHorn
- encounter: fixed_or_boss_fight
- unlock: unknown_checkpoint
- join_method: feed_meat_after_battle
- preferred_meat: Sirloin
- sources:
  - https://gamefaqs.gamespot.com/boards/197155-dragon-warrior-monsters/74178072
- confidence: low

### record
- key: boss_join_kingslime
- type: boss_join
- monster: KingSlime
- encounter: fixed_or_boss_fight
- unlock: unknown_checkpoint
- join_method: feed_meat_after_battle
- preferred_meat: Sirloin
- sources:
  - https://gamefaqs.gamespot.com/boards/197155-dragon-warrior-monsters/74178072
- confidence: low

### record
- key: boss_join_gigantes
- type: boss_join
- monster: Gigantes
- encounter: fixed_or_boss_fight
- unlock: unknown_checkpoint
- join_method: feed_meat_after_battle
- preferred_meat: Sirloin
- sources:
  - https://gamefaqs.gamespot.com/boards/197155-dragon-warrior-monsters/74178072
- confidence: low

---

## gates

### record
- key: gate_beginning
- type: gate
- gate: Gate of Beginning
- category: main_gate
- unlock: collect_slib_from_pulio
- monsters:
  - Slime
  - Dracky
  - Anteater
- boss: Healer
- boss_joins: true
- mandatory_story_gate: true
- earliest_access_rank: pre_g_class_completion
- sources:
  - https://dragonquest.fandom.com/wiki/List_of_teleportals_in_Dragon_Warrior_Monsters
- confidence: medium

### record
- key: gate_villager
- type: gate
- gate: Gate of Villager
- category: main_gate
- unlock: clear_g_class
- monsters:
  - StubSuck
  - GoHopper
  - Anteater
  - Picky
  - Gremlin
  - PillowRat
- boss: Dragon
- boss_joins: true
- mandatory_story_gate: false
- earliest_access_rank: after_g_class
- sources:
  - https://dragonquest.fandom.com/wiki/List_of_teleportals_in_Dragon_Warrior_Monsters
- confidence: medium

### record
- key: gate_demolition
- type: gate
- gate: Gate of Demolition
- category: family_gate
- unlock: win_starry_night_tournament
- monsters:
  - StubSuck
  - EvilSeed
  - BeanMan
  - FloraMan
  - WingTree
  - Gulpple
  - MadPlant
  - Oniono
  - Cactiball
  - TreeBoy
  - AmberWeed
  - FireWeed
  - ManEater
  - DanceVegi
  - Snapper
- boss:
  - Hargon
  - Sidoh
- boss_joins: false
- mandatory_story_gate: false
- earliest_access_rank: postgame_starry_night
- sources:
  - https://dragonquest.fandom.com/wiki/List_of_teleportals_in_Dragon_Warrior_Monsters
- confidence: medium

### record
- key: gate_mastermind
- type: gate
- gate: Gate of Mastermind
- category: family_gate
- unlock: win_starry_night_tournament
- monsters:
  - Dracky
  - Picky
  - BigRoost
  - BullBird
  - MadRaven
  - MadPecker
  - FloraJay
  - StubBird
  - MistyWing
  - DuckKite
  - MadGoose
  - LandOwl
  - Wyvern
  - MadCondor
  - ZapBird
  - WhipBird
- boss: Baramos
- boss_joins: false
- mandatory_story_gate: false
- earliest_access_rank: postgame_starry_night
- sources:
  - https://dragonquest.fandom.com/wiki/List_of_teleportals_in_Dragon_Warrior_Monsters
- confidence: medium

### record
- key: gate_control
- type: gate
- gate: Gate of Control
- category: family_gate
- unlock: win_starry_night_tournament
- monsters:
  - Slime
  - SpotSlime
  - Metaly
  - TreeSlime
  - DrakSlime
  - Snaily
  - Babble
  - WingSlime
  - Slabbit
  - SlimeNite
  - BoxSlime
  - RockSlime
  - SpotKing
  - Slimeborg
  - Metabble
- boss: Zoma
- boss_joins: false
- mandatory_story_gate: false
- earliest_access_rank: postgame_starry_night
- notes:
  - Listed as the only location where Metabble appears, specifically in the last nine floors.
- sources:
  - https://dragonquest.fandom.com/wiki/List_of_teleportals_in_Dragon_Warrior_Monsters
- confidence: medium

### record
- key: gate_extinction
- type: gate
- gate: Gate of Extinction
- category: family_gate
- unlock: win_starry_night_tournament
- monsters:
  - Gremlin
  - Demonite
  - 1EyeClown
  - SkulRider
  - EyeBall
  - MedusaEye
  - Pixy
  - DarkEye
  - Orc
  - AgDevil
  - ArcDemon
  - EvilBeast
  - Lionex
  - Grendal
  - Ogre
  - GoatHorn
- boss: Pizzaro
- boss_joins: false
- mandatory_story_gate: false
- earliest_access_rank: postgame_starry_night
- sources:
  - https://dragonquest.fandom.com/wiki/List_of_teleportals_in_Dragon_Warrior_Monsters
- confidence: medium

### record
- key: gate_sleep
- type: gate
- gate: Gate of Sleep
- category: family_gate
- unlock: win_starry_night_tournament
- monsters:
  - Spooky
  - Hork
  - BoneSlave
  - PutrePup
  - Mudron
  - Mummy
  - DeadNite
  - NiteWhip
  - Reaper
  - WindMerge
  - MadSpirit
  - Shadow
  - RotRaven
  - DarkCrab
  - Skullgon
  - Skeletor
  - DeadNoble
- boss: Esterk
- boss_joins: false
- mandatory_story_gate: false
- earliest_access_rank: postgame_starry_night
- sources:
  - https://dragonquest.fandom.com/wiki/List_of_teleportals_in_Dragon_Warrior_Monsters
- confidence: medium

### record
- key: gate_2nd_goopis
- type: gate
- gate: 2nd Goopi's Gate
- category: family_gate
- unlock:
  - win_starry_night_tournament
  - beat_goopi_3_rps_five_times_in_a_row
- monsters:
  - PillowRat
  - FairyRat
  - Almiraj
  - CatFly
  - SkullRoo
  - Saccer
  - Tonguella
  - MadGopher
  - WindBeast
  - Mommonja
  - Goategon
  - HammerMan
  - WildApe
  - Grizzly
  - SuperTen
  - Yeti
  - IronTurt
  - GulpBeast
  - Trumpeter
  - Unicorn
- boss: Mudou
- boss_joins: false
- mandatory_story_gate: false
- earliest_access_rank: postgame_starry_night
- sources:
  - https://dragonquest.fandom.com/wiki/List_of_teleportals_in_Dragon_Warrior_Monsters
- confidence: medium

### record
- key: gate_2nd_bazaar
- type: gate
- gate: 2nd Bazaar Gate
- category: family_gate
- unlock:
  - win_starry_night_tournament
  - monster_with_summoning_skill
- monsters:
  - Goopi
  - SaberMan
  - CoilBird
  - MudDoll
  - Facer
  - MadCandle
  - SpikyBoy
  - RogueNite
  - Gismo
  - CurseLamp
  - EvilWand
  - JewelBag
  - MadMirror
  - Voodoll
  - Balzac
  - MetalDrak
  - Roboster
  - BombCrag
- boss: Mirudraas
- boss_joins: false
- mandatory_story_gate: false
- earliest_access_rank: postgame_starry_night
- sources:
  - https://dragonquest.fandom.com/wiki/List_of_teleportals_in_Dragon_Warrior_Monsters
- confidence: medium

### record
- key: gate_grandpas
- type: gate
- gate: Grandpa's Gate
- category: family_gate
- unlock:
  - win_starry_night_tournament
  - present_goldslime_to_grandfather_after_learning_girls_name
- monsters:
  - MiniDrak
  - DragonKid
  - Crestpent
  - Poisongon
  - FairyDrak
  - Pteranod
  - Gasgon
  - KingCobra
  - Chamelgon
  - LizardFly
  - Tortagon
  - LizardMan
  - Swordgon
  - WingSnake
  - Rayburn
  - Spikerous
  - MadDragon
  - Andreal
  - GreatDrak
- boss: DeathMore
- boss_joins: false
- mandatory_story_gate: false
- earliest_access_rank: postgame_starry_night
- notes:
  - Important for DarkDrium route planning because DeathMore is the gate boss here.
- sources:
  - https://dragonquest.fandom.com/wiki/List_of_teleportals_in_Dragon_Warrior_Monsters
- confidence: medium

---

## monster_notes

### record
- key: note_darkdrium_recipe
- type: monster_note
- monster: DarkDrium
- recipe:
  - DeathMore
  - Watabou
- notes:
  - Can only be made once per game because Watabou is unique.
- sources:
  - https://dragonquest.fandom.com/wiki/DWM_Breeding
- confidence: medium

### record
- key: note_deathmore_chain
- type: monster_note
- monster: DeathMore_chain
- recipe_variants:
  - result: DeathMore1
    parents:
      - Zoma
      - Mirudraas
  - result: DeathMore2
    parents:
      - DeathMore
      - Armorpion
  - result: DeathMore3
    parents:
      - DeathMore
      - Mudou
- notes:
  - Useful for recursively expanding late-game DarkDrium planning.
- sources:
  - https://dragonquest.fandom.com/wiki/DWM_Breeding
- confidence: medium

---

## parser_tips

A simple parser can:
1. split on `### record`
2. parse `- key: value` pairs
3. treat indented lists as arrays
4. preserve `notes` and `sources` as metadata only

Good next expansion targets:
- full breeding chart as normalized recipes
- per-monster earliest encounter gate
- tameability and scoutability flags
- boss/fixed-fight join records with stronger sourcing than forum posts
- event windows for NPC breeding opportunities
