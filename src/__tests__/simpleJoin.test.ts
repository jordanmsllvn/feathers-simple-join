import simpleJoin from "../simpleJoin";
import feathers from "@feathersjs/feathers";
import express from "@feathersjs/express";
import memory from "feathers-memory";

const app = express(feathers());

app.use("/a", memory({ multi: true }));
app.use("/b", memory({ multi: true }));
app.use("/a-paginated", memory({ paginate: { default: 10 }, multi: true }));
app.use("/b-paginated", memory({ paginate: { default: 10 }, multi: true }));
app.use("/join", memory({ multi: true }));

app.use(express.errorHandler());

app
  .service("a")
  .create([
    { id: 0, service: "a", bId: 1 },
    { id: 1, service: "a", bId: 1 },
    { id: 2, service: "a", bId: 0 }
  ]);

app
  .service("a-paginated")
  .create([
    { id: 0, service: "a", bId: 1 },
    { id: 1, service: "a", bId: 1 },
    { id: 2, service: "a", bId: 0 }
  ]);

app
  .service("b")
  .create([
    { id: 0, service: "b" },
    { id: 1, service: "b" },
    { id: 2, service: "b" },
    { id: 3, service: "b" },
    { id: 4, service: "b" },
    { id: 5, service: "b" }
  ]);

app
  .service("b-paginated")
  .create([
    { id: 0, service: "b" },
    { id: 1, service: "b" },
    { id: 2, service: "b" },
    { id: 3, service: "b" },
    { id: 4, service: "b" },
    { id: 5, service: "b" }
  ]);

app
  .service("join")
  .create([
    { aId: 0, bId: 0 },
    { aId: 0, bId: 1 },
    { aId: 0, bId: 2 },
    { aId: 1, bId: 0 },
    { aId: 1, bId: 1 },
    { aId: 1, bId: 2 },
    { aId: 2, bId: 3 },
    { aId: 2, bId: 4 },
    { aId: 2, bId: 5 }
  ]);

test("Single result join works as expected on single record", async () => {
  const result = await app.service("a").get(0);
  const newResult = await simpleJoin(result, {
    with: {
      service: app.service("b"),
      as: "joinedB",
      local: "bId",
      remote: "id"
    }
  });
  expect(newResult.joinedB).toMatchObject({
    id: 1,
    service: "b"
  });
});

test("Single result join works as expected on multiple (join table) records", async () => {
  const result = await app.service("a").get(0);
  const newResult = await simpleJoin(result, {
    with: {
      service: app.service("b"),
      as: "joinedBs",
      local: "id",
      remote: "id"
    },
    through: { service: app.service("join"), local: "aId", remote: "bId" }
  });
  expect(newResult.joinedBs.length).toBe(3);
  expect(newResult.joinedBs[0]).toMatchObject({ id: 0, service: "b" });
  expect(newResult.joinedBs[1]).toMatchObject({ id: 1, service: "b" });
  expect(newResult.joinedBs[2]).toMatchObject({ id: 2, service: "b" });
});

test("Multiple result join works as expected on single record", async () => {
  const results = await app.service("a").find();
  const newResults = await simpleJoin(results, {
    with: {
      service: app.service("b"),
      as: "joinedB",
      local: "bId",
      remote: "id"
    }
  });
  expect(newResults.find((r: any) => r.id === 0).joinedB).toMatchObject({
    id: 1,
    service: "b"
  });
  expect(newResults.find((r: any) => r.id === 1).joinedB).toMatchObject({
    id: 1,
    service: "b"
  });
  expect(newResults.find((r: any) => r.id === 2).joinedB).toMatchObject({
    id: 0,
    service: "b"
  });
});

test("Mutiple result join works as expected on multiple (join table) records", async () => {
  const results = await app.service("a").find();
  const newResults = await simpleJoin(results, {
    with: {
      service: app.service("b"),
      as: "joinedBs",
      local: "id",
      remote: "id"
    },
    through: { service: app.service("join"), local: "aId", remote: "bId" }
  });
  expect(newResults[0].joinedBs.length).toBe(3);
  expect(newResults[1].joinedBs.length).toBe(3);
  expect(newResults[2].joinedBs.length).toBe(3);
});

test("Single result join works as expected on single record when records are paginated", async () => {
  const result = await app.service("a").get(0);
  const newResult = await simpleJoin(result, {
    with: {
      service: app.service("b-paginated"),
      as: "joinedB",
      local: "bId",
      remote: "id"
    }
  });
  expect(newResult.joinedB).toMatchObject({
    id: 1,
    service: "b"
  });
});

test("Multiple result join works as expected on single record when records are paginated", async () => {
  const results = await app.service("a").find();
  const newResults = await simpleJoin(results, {
    with: {
      service: app.service("b-paginated"),
      as: "joinedB",
      local: "bId",
      remote: "id"
    }
  });
  expect(newResults.find((r: any) => r.id === 0).joinedB).toMatchObject({
    id: 1,
    service: "b"
  });
  expect(newResults.find((r: any) => r.id === 1).joinedB).toMatchObject({
    id: 1,
    service: "b"
  });
  expect(newResults.find((r: any) => r.id === 2).joinedB).toMatchObject({
    id: 0,
    service: "b"
  });
});

test("Multiple result join works as expected on multiple (join table) records when records are paginated", async () => {
  const results = await app.service("a").find();
  const newResults = await simpleJoin(results, {
    with: {
      service: app.service("b-paginated"),
      as: "joinedBs",
      local: "id",
      remote: "id"
    },
    through: { service: app.service("join"), local: "aId", remote: "bId" }
  });
  expect(newResults[0].joinedBs.length).toBe(3);
  expect(newResults[1].joinedBs.length).toBe(3);
  expect(newResults[2].joinedBs.length).toBe(3);
});

test("Multiple result join works as expected on single record when results are paginated ", async () => {
  const results = await app.service("a-paginated").find();
  console.log(results);
  const newResults = await simpleJoin(results, {
    with: {
      service: app.service("b"),
      as: "joinedB",
      local: "bId",
      remote: "id"
    }
  });

  expect(newResults.data.find((r: any) => r.id === 0).joinedB).toMatchObject({
    id: 1,
    service: "b"
  });
  expect(newResults.data.find((r: any) => r.id === 1).joinedB).toMatchObject({
    id: 1,
    service: "b"
  });
  expect(newResults.data.find((r: any) => r.id === 2).joinedB).toMatchObject({
    id: 0,
    service: "b"
  });
});

test("Multiple paginated result join works as expected on multiple (join table) records when results are paginated", async () => {
  const results = await app.service("a-paginated").find();
  const newResults = await simpleJoin(results, {
    with: {
      service: app.service("b-paginated"),
      as: "joinedBs",
      local: "id",
      remote: "id"
    },
    through: { service: app.service("join"), local: "aId", remote: "bId" }
  });
  expect(newResults.data[0].joinedBs.length).toBe(3);
  expect(newResults.data[1].joinedBs.length).toBe(3);
  expect(newResults.data[2].joinedBs.length).toBe(3);
});

test("Include option works as expected on single record", async () => {
  const result = await app.service("a").get(0);
  const newResult = await simpleJoin(result, {
    with: {
      service: app.service("b"),
      as: "joinedB",
      local: "bId",
      remote: "id"
    },
    include: ["id"]
  });
  expect(newResult.joinedB.id).toBe(1);
  expect(newResult.joinedB.service).toBeUndefined();
});

test("Exclude option works as expected on single record", async () => {
  const result = await app.service("a").get(0);
  const newResult = await simpleJoin(result, {
    with: {
      service: app.service("b"),
      as: "joinedB",
      local: "bId",
      remote: "id"
    },
    exclude: ["service"]
  });
  expect(newResult.joinedB.id).toBe(1);
  expect(newResult.joinedB.service).toBeUndefined();
});

test("Include option works as expected on multiple (join table) records", async () => {
  const result = await app.service("a").get(0);
  const newResult = await simpleJoin(result, {
    with: {
      service: app.service("b"),
      as: "joinedBs",
      local: "id",
      remote: "id"
    },
    through: { service: app.service("join"), local: "aId", remote: "bId" },
    include: ["id"]
  });
  expect(newResult.joinedBs.length).toBe(3);
  expect(newResult.joinedBs[0].id).toBe(0);
  expect(newResult.joinedBs[0].service).toBeUndefined();
  expect(newResult.joinedBs[1].id).toBe(1);
  expect(newResult.joinedBs[1].service).toBeUndefined();
  expect(newResult.joinedBs[2].id).toBe(2);
  expect(newResult.joinedBs[2].service).toBeUndefined();
});

test("Exclude option works as expected on multiple (join table) records", async () => {
  const result = await app.service("a").get(0);
  const newResult = await simpleJoin(result, {
    with: {
      service: app.service("b"),
      as: "joinedBs",
      local: "id",
      remote: "id"
    },
    through: { service: app.service("join"), local: "aId", remote: "bId" },
    exclude: ["service"]
  });
  expect(newResult.joinedBs.length).toBe(3);
  expect(newResult.joinedBs[0].id).toBe(0);
  expect(newResult.joinedBs[0].service).toBeUndefined();
  expect(newResult.joinedBs[1].id).toBe(1);
  expect(newResult.joinedBs[1].service).toBeUndefined();
  expect(newResult.joinedBs[2].id).toBe(2);
  expect(newResult.joinedBs[2].service).toBeUndefined();
});
