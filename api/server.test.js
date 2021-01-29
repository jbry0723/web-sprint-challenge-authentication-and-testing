const request = require("supertest");
const db = require("../data/dbConfig");
const server = require("./server");
const bcryptjs = require("bcryptjs");

const { generateToken } = require("./middleware/router-middleware");

const user1 = { username: "bob", password: "1234" };

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});
beforeEach(async () => {
  await db("users").truncate();
});
afterAll(async () => {
  await db.destroy();
});

test("sanity", () => {
  expect(true).toBe(true);
});

describe("server", () => {
  describe("[GET] /api/jokes", () => {
    it("returns message if token not provided", async () => {
      const res = await request(server).get("/api/jokes");
      expect(res.text).toEqual('"token required"');
    });
    it("returns array of jokes if token is provided", async () => {
      let res;

      await db("users").insert(user1);
      let token = generateToken(user1);
      res = await request(server)
        .get("/api/jokes")
        .set({ authorization: token });
      expect(res.body).toHaveLength(3);
    });
  });
  describe("[POST] /api/auth/register", () => {
    it("returns 'username taken' if username exists", async () => {
      await request(server).post("/api/auth/register").send(user1);
      let res = await request(server).post("/api/auth/register").send(user1);
      expect(res.text).toEqual('"username taken"');
    });
    it("returns an object on success", async () => {
      let res = await request(server).post("/api/auth/register").send(user1);
      expect(res.body).toBeTruthy;
    });
  });
  describe("[POST} api/auth/login", () => {
    it("returns message on success", async () => {
      let hashedpass = bcryptjs.hashSync(user1.password, 8);
      let user1hashed = { ...user1, password: hashedpass };
      await db("users").insert(user1hashed);
      let res = await request(server).post("/api/auth/login").send(user1);
      expect(res.body.message).toContain("welcome, bob");
    });
    it("returns message on failure", async () => {
      let res = await request(server).post("/api/auth/login").send(user1);
      expect(res.text).toContain('"invalid credentials"');
    });
  });
});
