import request from "supertest";
import mongoose from "mongoose";
import app from "../server.js";

beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect("mongodb://127.0.0.1:27017/test_db");
    }
});

afterAll(async () => {
    if (mongoose.connection.readyState === 1) {
        await mongoose.connection.db.dropDatabase();
        await mongoose.connection.close();
    }
});

describe("Lead API CRUD Tests", () => {

    let leadId;
    let licenseId;

    it("POST /api/lead/create → create lead", async () => {
        licenseId = new mongoose.Types.ObjectId(); // generate valid ObjectId

        const res = await request(app)
            .post("/api/lead/create")
            .send({
                licenseId: licenseId.toHexString(), // valid MongoDB ObjectId
                version: 1,
                fields: [
                    { key: "name", label: "Name", type: "text", required: true }
                ]
            });

        expect(res.status).toBe(201);
        expect(res.body.data).toHaveProperty("_id");

        leadId = res.body.data._id;
    });

    it("GET /api/lead/view → View All lead", async () => {
        const res = await request(app).get("/api/lead/view");

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
        expect(res.body.data[0]).toHaveProperty("_id");
    });

    it("GET /api/lead/view/:id → View One Lead", async () => {
        const res = await request(app).get(`/api/lead/view/${leadId}`);

        expect(res.status).toBe(200);
        expect(res.body.data._id).toBe(leadId);
    });

    it("PUT /api/lead/update/:id → Update Lead", async () => {
        const res = await request(app)
            .put(`/api/lead/update/${leadId}`) //  match route
            .send({ version: 2 });

        expect(res.status).toBe(200);
        expect(res.body.data.version).toBe(2);
    });

    it("DELETE /api/lead/delete/:id → Delete Lead", async () => {
        const res = await request(app)
            .delete(`/api/lead/delete/${leadId}`); //  match route

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

});
