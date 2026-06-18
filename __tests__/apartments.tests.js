import request from "supertest";
import app from "../app.js";
import { pool } from "../connections/db.js";
describe("apartments API", () => {

    //close the DB connection after all the tests are run
    afterAll(async () => {
        await pool.end();
    });

    it("lists apartments", async () => {
        const res = await request(app).get("/api/apartments");
        expect(res.status).toBe(200);
    });

    it("blocks an unauthenticated review", async () => {
        const res = await request(app).post("/api/apartments/1/reviews")
                    .send({ rating: 5, body: "Nice" });
        expect(res.status).toBe(401);
    });
});
