import { encodeBlock, getTerrainBlockType } from "@dust/world/internal";
import type { Vec3 } from "@dust/world/internal";
import { publicClient} from "./chain";
import { stash, tables } from "./mud/stash";
import { worldAddress } from "./common/worldAddress";

export async function getObjectTypeAt(pos: Vec3): Promise<number> {
  const objectTypeRecord = stash.getRecord({
    table: tables.EntityObjectType,
    key: { entityId: encodeBlock(pos) },
  });
  let objectTypeId = objectTypeRecord?.objectType;
  if (!objectTypeId) {
    objectTypeId = await getTerrainBlockType(publicClient, worldAddress, pos);
  }
  return objectTypeId;
}