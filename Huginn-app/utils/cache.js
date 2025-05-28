
// PROVIDE MANAGING INTERFACE FOR REDIS SETS
export const redisSet = async (client, setName) => {

  return {
    add : async (id) => {
      const rst = await client.sAdd(setName, id);
      return rst
    },
    has : async (id) => {
      const rst = await client.sIsMember(setName, id);
      return rst
    },
    length : async () => {
      const rst = await client.sCard(setName);
      return rst
    },
    remove : async (id) => {
      const rst = await client.sRem(setName, id);
      return rst
    },

  }
}
