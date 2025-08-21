import { usePlayerStatus } from "./common/usePlayerStatus";
import { useSyncStatus } from "./mud/useSyncStatus";
import { usePlayerPositionQuery } from "./common/usePlayerPositionQuery";
import { AccountName } from "./common/AccountName";
import { useDustClient } from "./common/useDustClient";
//import { stash, tables } from "./mud/stash";
//import { useRecord } from "@latticexyz/stash/react";
//import { useMutation } from "@tanstack/react-query";
//import { resourceToHex } from "@latticexyz/common";
// import IWorldAbi from "dustkit/out/IWorld.sol/IWorld.abi";
//import mudConfig from "contracts/mud.config";
//import CounterAbi from "contracts/out/CounterSystem.sol/CounterSystem.abi.json";
import { getObjectTypeAt } from "./getObjectTypeAt";
import { useState, useEffect } from "react";
import { objects, objectsById } from "@dust/world/internal";
//import type { Vec3 } from "@dust/world/internal";
import { useCursorPositionQuery } from "./common/useCursorPositionQuery";
import { getBiomeName } from "@dust/world/internal";
import { worldAddress
 } from "./common/worldAddress";
import { publicClient } from "./chain";

export default function App() {
  const { data: dustClient } = useDustClient();
  const syncStatus = useSyncStatus();
  const playerStatus = usePlayerStatus();
  const playerPosition = usePlayerPositionQuery();
  //const isSplatRisk = false; // Placeholder for actual splat risk logic
  const cursorPosition = useCursorPositionQuery();


  /*const counter = useRecord({
    stash,
  
    table: tables.Counter,
    key: {},
  });*/

  /* const increment = useMutation({
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
  }); */

  const [playerBlockType, setPlayerBlockType] = useState<number | null>(null);
  const [cursorBlockType, setCursorBlockType] = useState<number | null>(null);

 
  const [distanceToCave, setDistanceToCave] = useState<number | null>(null);
  const [distanceToSurface, setDistanceToSurface] = useState<number | null>(null);

  const [biomeName, setBiomeName] = useState<string | null>(null);

  
   
  
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

      const newBiome = await getBiomeName(worldAddress, publicClient, [
         playerPosition.data.x,
          playerPosition.data.y,
          playerPosition.data.z,
      ]);
      setBiomeName(newBiome);
      console.log("Biome Name:", biomeName);

      
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
          Open this app in DUST
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
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Player name/title row above toolbar */}
          <div style={{
            width: '1100px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontFamily: 'Press Start 2P, monospace',
            fontSize: 18,
            color: '#38a169',
            background: '#000',
            margin: '0 auto',
            paddingLeft: '16px',
            paddingRight: '16px',
            boxSizing: 'border-box',
            letterSpacing: '1px',
            textShadow: '0 1px 2px #013220',
          }}>
            <div>
              {playerPosition.data && <AccountName address={dustClient?.appContext?.userAddress ?? ""} />}
            </div>
            <div style={{
              fontFamily: 'Fira Mono, Menlo, Monaco, Consolas, monospace',
              fontSize: 16,
              color: '#eee',
              background: 'none',
              letterSpacing: '0.5px',
              fontWeight: 600,
              textShadow: '0 1px 2px #222',
            }}>
              DUST OS v1.0 - The Lorax
            </div>
          </div>
      {/* Toolbar row */}
      <div style={{
        width: '1100px',
        height: '61px',
        background: '#1e3a24', // softer forest green
        padding: '6px 0',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        border: '6px solid #38a169', // softer pixel-style border
        boxShadow: '0 2.7px 10.8px 0 rgba(56,161,105,0.18)',
        fontFamily: 'Press Start 2P, monospace', // pixel font
        margin: '0 auto',
        imageRendering: 'pixelated',
        borderRadius: '0',
        zIndex: 1000
      }}>
        {playerPosition.data && (
          <>
            <ToolbarItem title="Position:" value={playerPosition.data ? `${playerPosition.data.x}, ${playerPosition.data.y}, ${playerPosition.data.z}` : "-"} />
            <ToolbarItem title="Standing on:" value={playerBlockName} />
            <ToolbarItem title="Depth to Cave:" value={distanceToCave == null ? "Bedrock" : distanceToCave} />
            <ToolbarItem title="Up to Surface" value={distanceToSurface == 2 ? "Here" : distanceToSurface} />
            <ToolbarItem title="Cursor:" value={cursorPosition.data ? `${cursorPosition.data.x}, ${cursorPosition.data.y}, ${cursorPosition.data.z}` : "-"} />
            <ToolbarItem title="Pointing at:" value={cursorBlockName} />
            <ToolbarItem title="Biome:" value={biomeName} />
          </>
        )}
      </div>
    </div>
  );
}

// ToolbarItem component for clean column layout
function ToolbarItem({ title, value }: { title: string, value: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 130,
      margin: '0 10px',
      padding: '4px 0',
      background: '#13861dff', // slightly lighter green for item
      border: '3.6px solid #013220', // pixel-style border
      color: '#fff', // high contrast font
      fontFamily: 'Press Start 2P, monospace',
      fontSize: 11.7,
      boxShadow: '0 1.8px 7.2px 0 rgba(20,83,45,0.13)',
      letterSpacing: '1px',
      imageRendering: 'pixelated',
    }}>
      <span style={{ fontSize: 13, fontWeight: 700, marginBottom: 1.3, color: '#fff', textDecoration: 'underline', textUnderlineOffset: '2px', textShadow: '0 1px 2px #013220' }}>{title}</span>
      <span style={{ fontSize: 14, fontWeight: 650, color: '#fff', textShadow: '0 1px 2px #013220' }}>{value}</span>
    </div>
  );
}
