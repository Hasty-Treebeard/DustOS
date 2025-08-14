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

export default function App() {
  const { data: dustClient } = useDustClient();
  const syncStatus = useSyncStatus();
  const playerStatus = usePlayerStatus();
  const playerPosition = usePlayerPositionQuery();
  const isSplatRisk = false; // Placeholder for actual splat risk logic
  

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

  //const updatePlayerBlockType = async (playerPosition) => {
  const [distanceToCave, setDistanceToCave] = useState<number | null>(null);
/*  if (!playerPosition?.data) return;
  try {
    const newPlayerBlockType = await getObjectTypeAt([
      playerPosition.data.x,
      playerPosition.data.y - 1,
      playerPosition.data.z,
    ]);
    setPlayerBlockType(newPlayerBlockType);
    console.log("Updated playerBlockType:", newPlayerBlockType);
  } catch (err) {
    console.error("Failed to update playerBlockType:", err);
  }
  };*/

  const playerBlockName = objectsById[playerBlockType]?.name || "Unknown";
  
  const updatePlayerBlockTypeAndCave = async (playerPosition) => {
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

      // Check blocks below for types 1, 2, or 111, up to Y = -60
      let found = false;
      const maxDistance = playerPosition.data.y + 60;
      for (let i = 1; i <= maxDistance; i++) {
        const blockType = await getObjectTypeAt([
          playerPosition.data.x,
          playerPosition.data.y - i,
          playerPosition.data.z,
        ]);
        if (blockType === 1 || blockType === 2 || blockType === 111) {
          setDistanceToCave(i);
          found = true;
          console.log(`Found cave block type (${blockType}) at distance:`, i);
          break;
        }
      }
      if (!found) {
        setDistanceToCave(null);
      }
    } catch (err) {
      console.error("Failed to update playerBlockType or cave distance:", err);
    }
  };

useEffect(() => {
    if (playerPosition.data) {
      console.log("Player position changed:", playerPosition.data);
      //updatePlayerBlockType(playerPosition);
      updatePlayerBlockTypeAndCave(playerPosition);

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
          <p>Distance to cave: {distanceToCave == null ? "Bedrock" : distanceToCave}</p>
          
        </div>
      )}
      
      
    </div>
  );
}
