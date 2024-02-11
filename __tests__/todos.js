const request = require("supertest");

const db = require("../models/index");
const app = require("../app");

let server, agent;

describe("Todo Application", function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(3008 || process.env.PORT, () => {});
    agent = request.agent(server);
  });
  afterAll(async () => {
    await db.sequelize.close();
    server.close();
  });

  test("testing signup", async () => {
    let res = await agent.get("/signup");

    res = await agent.post("/users").send({
      firstName: "test",
      lastName: "test",
      email: "test@gmail.com",
      password: "12345678",
    });

    expect(res.statusCode).toBe(302);
  });

  test("Creates a todo and responds with JSON at /todos POST endpoint", async () => {
    const response = await agent
      .post("/todos")
      .set("Accept", "application/json")
      .send({
        title: "Buy silk",
        dueDate: new Date().toISOString(),
        completed: false,
      });

    expect(response.statusCode).toBe(200);
  });

  test("Marks a todo with the given ID as complete", async () => {
    const createResponse = await agent
      .post("/todos")
      .set("Accept", "application/json")
      .send({
        title: "Buy tilk",
        dueDate: new Date().toISOString(),
        completed: false,
      });

    const todoID = createResponse.body.id;
    expect(createResponse.body.completed).toBe(false);

    const markCompleteResponse1 = await agent
      .put(`/todos/${todoID}`)
      .set("Accept", "application/json")
      .send({
        completed: false,
      });
    const parsedUpdateResponse = markCompleteResponse1.body;
    expect(parsedUpdateResponse.completed).toBe(true);
    const markCompleteResponse2 = await agent
      .put(`/todos/${todoID}`)
      .set("Accept", "application/json")
      .send({
        completed: true,
      });

    const parsedUpdateResponse2 = markCompleteResponse2.body;
    expect(parsedUpdateResponse2.completed).toBe(false);
  });

  test("Fetches all todos in the database using /todos endpoint", async () => {
    await agent.post("/todos").send({
      title: "Buy xbox",
      dueDate: new Date().toISOString(),
      completed: false,
    });
    await agent.post("/todos").send({
      title: "Buy ps3",
      dueDate: new Date().toISOString(),
      completed: false,
    });
    const response = await agent
      .set("Accept", "application/json")
      .get("/todos");
    const parsedResponse = JSON.parse(response.text);
    console.log(parsedResponse);
    expect(parsedResponse.todaydues.length).toBe(4);
    expect(parsedResponse["todaydues"][3]["title"]).toBe("Buy ps3");
  });

  test("Deletes a todo with the given ID if it exists and sends a boolean response", async () => {
    const response = await agent
      .post("/todos")
      .set("Accept", "application/json")
      .send({
        title: "Buy milk",
        dueDate: new Date().toISOString(),
        completed: false,
      });

    expect(response.statusCode).toBe(200);
    expect(response.header["content-type"]).toMatch(/application\/json/);

    const parsedResponse = JSON.parse(response.text);
    const todoID = parsedResponse.id;
    const response2 = await agent.delete(`/todos/${todoID}`);
    console.log(response2.text);
    const parsedResponses = JSON.parse(response2.text);
    expect(parsedResponses).toBe(true);
  });
});
