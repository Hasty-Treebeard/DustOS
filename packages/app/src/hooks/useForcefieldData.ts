import { useMemo } from "react";
import { Matches } from "@latticexyz/stash/internal";
import { bigIntMax } from "@latticexyz/common/utils";
import { stash, tables } from "../mud/stash";
import { useSyncStatus } from "../mud/useSyncStatus";
import { decodePosition, decodePlayer } from "@dust/world/internal";
import { useDustName } from "../common/useDustName";
import { useENS } from "../common/useENS";

import type { Hex } from "viem";
import type { Vec3 } from "@dust/world/internal";

export interface ForcefieldData {
  owner: string;
  entityId: string;
  fragments: number;
  energy: string;
  drainRate: string;
  daysRemaining: string;
}

export function useForcefieldData(playerPosition: { data: any }): ForcefieldData | null {
  const { data: playerPos } = playerPosition;
  const syncStatus = useSyncStatus();

  
  // Get all energy entities (potential forcefields) - always call this hook
  const energyEntities = useMemo(() => {
    if (!stash || !syncStatus.isLive) return [];
    
    try {
      const entities = stash.getKeys({ table: tables.Energy });
      
      // Debug: Let's see what tables are available
     //console.log('Available tables:', Object.keys(tables));
      //  console.log('Energy entities found:', Object.keys(entities).length);
      
      return entities;
    } catch (error) {
      //console.error('Forcefield hook: Error getting energy entities:', error);
      return [];
    }
  }, [syncStatus.isLive]);

  // Find forcefield at player position - always call this hook
  const forcefieldData = useMemo(() => {
    if (!playerPos || Object.keys(energyEntities).length === 0) {
      return null;
    }

    const playerX = Math.floor(playerPos.x);
    const playerY = Math.floor(playerPos.y);
    const playerZ = Math.floor(playerPos.z);

    // Check each energy entity to see if it's a forcefield at player position
    for (const energyKey of Object.keys(energyEntities)) {
      const energy = stash.getRecord({ 
        table: tables.Energy, 
        key: { entityId: energyKey as Hex }
      });
      
      if (!energy?.energy) continue;

      // Check if this energy entity is also a machine
      const machine = stash.getRecord({ 
        table: tables.Machine, 
        key: { entityId: energyKey as Hex }
      });
      
      if (!machine) continue;

      const entityId = energy.entityId;
      
      // Get fragments for this forcefield
      const fragments = stash.runQuery({
        query: [Matches(tables.Fragment, { forceField: entityId })],
      });

      if (!fragments.keys || Object.keys(fragments.keys).length === 0) continue;

      // Check if player is inside any fragment
      const fragmentSize = 8;
      let playerInForcefield = false;

      for (const fragment of Object.values(fragments.keys)) {
        const fragmentRecord = stash.getRecord({
          table: tables.Fragment,
          key: { entityId: fragment.entityId as Hex },
        });
        
        if (!fragmentRecord || machine.createdAt !== fragmentRecord.forceFieldCreatedAt) continue;

        const fragmentPos = decodePosition(fragment.entityId as Hex);
        const fragmentCoords: Vec3 = [
          fragmentPos[0] * fragmentSize,
          fragmentPos[1] * fragmentSize,
          fragmentPos[2] * fragmentSize,
        ];

        // Check if player is inside this fragment
        if (playerX >= fragmentCoords[0] && playerX < fragmentCoords[0] + fragmentSize &&
            playerY >= fragmentCoords[1] && playerY < fragmentCoords[1] + fragmentSize &&
            playerZ >= fragmentCoords[2] && playerZ < fragmentCoords[2] + fragmentSize) {
          playerInForcefield = true;
          break;
        }
      }

      if (playerInForcefield) {
        // Calculate optimistic energy using the same logic as the other app
        const currentTime = BigInt(Date.now());
        const lastUpdatedTime = energy.lastUpdatedTime * 1000n;
        const elapsed = (currentTime - lastUpdatedTime) / 1000n;
        const energyDrained = elapsed * energy.drainRate;
        const optimisticEnergy = bigIntMax(0n, energy.energy - energyDrained);

        // Get the owner address through the access group chain:
        // EntityID → EntityAccessGroup → AccessGroupOwner → Owner Address
        let ownerAddress: Hex | undefined = undefined;
        
        try {
          // Step 1: Get the access group for this entity
          const accessGroup = stash.getRecord({ 
            table: tables.dfprograms_1__EntityAccessGroup, 
            key: { entityId } 
          });
          
          if (accessGroup) {
            //console.log('Found access group:', accessGroup);
            
            // Step 2: Get the owner from the access group
            const ownerRecord = stash.getRecord({ 
              table: tables.dfprograms_1__AccessGroupOwner, 
              key: { groupId: accessGroup.groupId } 
            });
            
            if (ownerRecord) {
              //console.log('Found owner record:', ownerRecord);
              //console.log('Owner entity ID:', ownerRecord.owner);
              
              // Use decodePlayer to convert the entity ID to an Ethereum address
              try {
                if (ownerRecord.owner && typeof ownerRecord.owner === 'string') {
                  const playerAddress = decodePlayer(ownerRecord.owner as Hex);
                  //console.log('Decoded player address:', playerAddress);
                  ownerAddress = playerAddress;
                } else {
                  //console.log('Owner record has invalid owner field:', ownerRecord.owner);
                }
              } catch (error) {
                //console.log('Could not decode player address:', error);
                // Don't set ownerAddress if decodePlayer fails
                ownerAddress = undefined;
              }
            }
          }
          
        } catch (error) {
          //console.log('Could not get owner through access group chain:', error);
        }

        return {
          entityId,
          energy: optimisticEnergy,
          fragments: Object.keys(fragments.keys).length,
          ownerAddress,
        };
      }
    }

    return null;
  }, [playerPos, energyEntities]);

  // Always call these hooks to avoid React hooks rule violations
  // Use the ownerAddress from forcefieldData if it exists, otherwise undefined
  const ownerAddress = forcefieldData?.ownerAddress;
  const { data: ownerNameData } = useDustName(ownerAddress);
  const { data: ownerENSData } = useENS(ownerAddress);

  if (!forcefieldData) return null;

  // Use the same fallback priority: dust name -> ENS name -> fallback
  const ownerDisplayName = ownerNameData?.username || 
                          ownerENSData?.name || 
                          (forcefieldData.ownerAddress ? 
                            `${forcefieldData.ownerAddress.slice(0, 6)}...${forcefieldData.ownerAddress.slice(-4)}` : 
                            "Unknown Owner");
  
  // Also truncate the entity ID for display
  const machineId = forcefieldData.entityId;
  const truncatedEntityId = machineId ? 
    `${machineId.slice(0, 6)}...${machineId.slice(-4)}` : 
    "Unknown";

  // Calculate drain rate as fragments × 8.2
  const drainRate = Math.round(forcefieldData.fragments * 8.2).toLocaleString('en-US');

  // Calculate days remaining using BigInt for energy, but drainRate as number
  const drainRateNumber = Math.round(forcefieldData.fragments * 8.2);
  let daysRemaining: string;
  if (drainRateNumber > 0) {
    const energyNumber = Number(forcefieldData.energy / BigInt(10 ** 14));
    daysRemaining = Math.round(energyNumber / drainRateNumber).toLocaleString('en-US');
  } else {
    daysRemaining = "N/A";
  }

  return {
    owner: ownerDisplayName,
    entityId: truncatedEntityId,
    fragments: forcefieldData.fragments,
    energy: (forcefieldData.energy / BigInt(10 ** 14)).toLocaleString(),
    drainRate: drainRate,
    daysRemaining: daysRemaining,
  };
} 
