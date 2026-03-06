import { describe, expect, it } from "vitest";

import { applyPagination, applySearch, applySort } from "@/services/core/filters";

type User = {
  id: number;
  name: string;
  email: string;
  age: number;
};

const users: User[] = [
  { id: 1, name: "Ana", email: "ana@gymhub.com", age: 26 },
  { id: 2, name: "Bruno", email: "bruno@gymhub.com", age: 31 },
  { id: 3, name: "Carlos", email: "carlos@gymhub.com", age: 22 },
  { id: 4, name: "Amanda", email: "amanda@gymhub.com", age: 29 },
];

describe("filters", () => {
  it("aplica busca case insensitive em múltiplos campos", () => {
    const result = applySearch(users, "AM", ["name", "email"]);

    expect(result.map((user) => user.id)).toEqual([1, 4]);
  });

  it("ordena dinamicamente por campo em ordem asc e desc", () => {
    const asc = applySort(users, "age", "asc");
    const desc = applySort(users, "age", "desc");

    expect(asc.map((user) => user.id)).toEqual([3, 1, 4, 2]);
    expect(desc.map((user) => user.id)).toEqual([2, 4, 1, 3]);
  });

  it("retorna o slice correto na paginação", () => {
    const result = applyPagination(users, 2, 2);

    expect(result.map((user) => user.id)).toEqual([3, 4]);
  });
});
