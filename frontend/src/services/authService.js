import { users } from "../data/mockData";

export function addUser(newUser) {
  const newId = users.length + 1;
  users.push({
    id: newId,
    ...newUser
  });
}
