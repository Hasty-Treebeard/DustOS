import { usePlayerStatus } from "./common/usePlayerStatus";
import { useSyncStatus } from "./mud/useSyncStatus";
import { usePlayerPositionQuery } from "./common/usePlayerPositionQuery";
import { AccountName } from "./common/AccountName";
import { useDustClient } from "./common/useDustClient";
import { stash, tables } from "./mud/stash";
import { useRecord } from "@latticexyz/stash/react";
import { useMutation } from "@tanstack/react-query";
import { resourceToHex } from "@latticexyz/common";
// import IWorldAbi from "dustkit/out/IWorld.sol/IWorld.abi";
import mudConfig from "contracts/mud.config";
import CounterAbi from "contracts/out/CounterSystem.sol/CounterSystem.abi.json";
import { getObjectTypeAt } from "./getObjectTypeAt";
import { useState, useEffect } from "react";
import { objects, objectsById } from "@dust/world/internal";
import type { Vec3 } from "@dust/world/internal";
import { useCursorPositionQuery } from "./common/useCursorPositionQuery";
import { getBiome } from "@dust/world/internal";

export default function App() {
  const { data: dustClient } = useDustClient();
  const syncStatus = useSyncStatus();
  const playerStatus = usePlayerStatus();
  const playerPosition = usePlayerPositionQuery();
  const isSplatRisk = false; // Placeholder for actual splat risk logic
  const cursorPosition = useCursorPositionQuery();

  const counter = useRecord({
    stash,
  
    table: tables.Counter,
    key: {},
  });

  const increment = useMutation({
    mutationFn: () => {
      if (!dustClient) throw new Error("Dust client not connected");
      return dustClient.provider.request({
        method: "systemCall",
        params: [
          {
            systemId: resourceToHex({
              type: "system",
              namespace: mudConfig.namespace,
              name: "CounterSystem",
            }),
            abi: CounterAbi,
            functionName: "increment",
            args: [],
          },
        ],
      });
    },
  });

  const [playerBlockType, setPlayerBlockType] = useState<number | null>(null);
  const [cursorBlockType, setCursorBlockType] = useState<number | null>(null);

 
  const [distanceToCave, setDistanceToCave] = useState<number | null>(null);
  const [distanceToSurface, setDistanceToSurface] = useState<number | null>(null);

  //const biomeName = getBiome(
   // playerPosition.data ? [playerPosition.data.x, playerPosition.data.y, playerPosition.data.z] as Vec3 : [0, 0, 0]
  //)?.name || "Unknown Biome";
  
  const playerBlockName = objectsById[playerBlockType]?.name || "Unknown";
  const cursorBlockName = objectsById[cursorBlockType]?.name || "Unknown";
  
  const updatePlayerBlockColumn = async (playerPosition) => {
    if (!playerPosition?.data) return;
    try {
      // Block directly below
      const newPlayerBlockType = await getObjectTypeAt([
        playerPosition.data.x,
        playerPosition.data.y - 1,
        playerPosition.data.z,
      ]);
      setPlayerBlockType(newPlayerBlockType);
      console.log("Updated playerBlockType:", newPlayerBlockType);

      // Block at Cursor Position
      const cursorBlockType = await getObjectTypeAt([
        cursorPosition.data.x,
        cursorPosition.data.y,
        cursorPosition.data.z,
      ]);
      setCursorBlockType(cursorBlockType);
      console.log("Updated cursorBlockType:", cursorBlockType);


      // Check blocks below for types 1, 2, or 111, up to Y = -60
      let foundBelow = false;
      const maxDistanceDown = playerPosition.data.y + 60;
      for (let i = 1; i <= maxDistanceDown; i++) {
        const blockType = await getObjectTypeAt([
          playerPosition.data.x,
          playerPosition.data.y - i,
          playerPosition.data.z,
        ]);
        if (blockType === 1 || blockType === 2 || blockType === 111) {
          setDistanceToCave(i);
          foundBelow = true;
          console.log(`Found cave block type (${blockType}) at distance:`, i);
          break;
        }
      }
      if (!foundBelow) {
        setDistanceToCave(null);
      }
      
      // Check blocks above for types 1, 2, or 111, up to Y = 324
      let foundAbove = false;
      const maxDistanceUp = 322 - playerPosition.data.y;
      for (let j = 2; j <= maxDistanceUp; j++) {
        const blockType = await getObjectTypeAt([
          playerPosition.data.x,
          playerPosition.data.y + j,
          playerPosition.data.z,
        ]);
        if (blockType === 1 || blockType === 2 || blockType === 111) {
          setDistanceToSurface(j);
          foundAbove = true;
          console.log(`Found cave block type (${blockType}) at distance:`, j);
          break;
        }
      }
      if (!foundAbove) {
        setDistanceToSurface(null);
      }

      
    } catch (err) {
      console.error("Failed to update playerBlockType or cave distance:", err);
    }
  };

useEffect(() => {
    if (playerPosition.data) {
      console.log("Player position changed:", playerPosition.data);
      //updatePlayerBlockType(playerPosition);
      updatePlayerBlockColumn(playerPosition);

    }
  }, [playerPosition.data?.x, playerPosition.data?.y, playerPosition.data?.z]);
      

  

  if (!dustClient) {
    const url = `https://alpha.dustproject.org?debug-app=${window.location.origin}/dust-app.json`;
    return (
      <div className="flex flex-col h-screen items-center justify-center">
        <a href={url} className="text-center text-blue-500 underline">
          Open this page in DUST to connect to dustkit
        </a>
      </div>
    );
  }

  if (!syncStatus.isLive || !playerStatus) {
    return (
      <div className="flex flex-col h-screen items-center justify-center">
        <p className="text-center">Syncing ({syncStatus.percentage}%)...</p>
      </div>
    );
  }






  return (
    <div>
      <p>
        Hello Hello <AccountName address={dustClient.appContext.userAddress} />
          
      </p>
      {playerPosition.data && (
        <div>
          <p>Your position: {JSON.stringify(playerPosition.data, null, " ")}</p>
          <p> Standing on: {playerBlockName}</p>
          <p>Distance down to cave: {distanceToCave == null ? "Bedrock" : distanceToCave}</p>
          <p>Distance up to surface: {distanceToSurface == 2 ? "Surface" : distanceToSurface}</p>
          <p>Cursor Position: {JSON.stringify(cursorPosition.data, null, " ")}</p>
          <p>Pointing at: {cursorBlockName}</p>

        </div>
      )}
      
      
    </div>
  );
}
