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
import type { Vec3 } from "@dust/world/internal";

export default function App() {
  const { data: dustClient } = useDustClient();
  const syncStatus = useSyncStatus();
  const playerStatus = usePlayerStatus();
  const playerPosition = usePlayerPositionQuery();
  const isSplatRisk = true; // Placeholder for actual splat risk logic


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

const [playerBlockType, setPlayerBlockType] = useState(null);

const updatePlayerBlockType = async (playerPosition) => {
const newPlayerBlockType = await getObjectTypeAt([
         playerPosition.data.x,
         playerPosition.data.y - 1,
         playerPosition.data.z,
       ]);
setPlayerBlockType(newPlayerBlockType);
}
useEffect(() => {
  if(playerPosition.data){
  updatePlayerBlockType(playerPosition);
}
}, [playerPosition]);


  return (
    <div>
      <p>
        Hello Hello <AccountName address={dustClient.appContext.userAddress} />
      </p>
      {playerPosition.data && (
        <div>
          <p>Your position: {JSON.stringify(playerPosition.data, null, " ")}</p>
          <p> Standing on: {playerBlockType}</p>
        </div>
      )}
      
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span>Splat Risk:</span>
        <div
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "4px",
            backgroundColor: isSplatRisk ? "red" : "green",
            border: "2px solid #222",
          }}
          title={isSplatRisk ? "At risk if dig" : "No risk if dig"}
        />
      </div>
      
    </div>
  );
}
