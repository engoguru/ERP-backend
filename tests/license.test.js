import request from "supertest";
import mongoose from "mongoose";
import app from "../server.js";

beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGO_URI);
    }
});

afterAll(async () => {
    if (mongoose.connection.readyState === 1) {
        await mongoose.connection.db.dropDatabase(); // clear test DB
        await mongoose.connection.close();
    }
});

describe("License API Tests", () => {

    let licenseId;

    it("POST /api/license/create → Create License", async () => {
        const res = await request(app)
            .post("/api/license/create")
            .send({
            companyName: "NGO Guru Pvt Ltd",
            gstNumber: "22ABCDE1234F1Z5",
            registrationNumber: "A1234",
            companyPhone: { phone: "+911234567890", isVerified: false },
            companyEmail: { email: "testcompany@example.com", isVerified: true },
            maxUser: 50,
            status: "ACTIVE",
            expiresAt: new Date("2026-12-31T00:00:00.000Z")
    });

        expect(res.status).toBe(201);
        expect(res.body.data).toHaveProperty("_id");
        licenseId = res.body.data._id;
    });

    it("GET /api/license/view → Get All Licenses", async () => {
        const res = await request(app).get("/api/license/view");

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
        expect(res.body.data[0]).toHaveProperty("_id");
    });

    it("GET /api/license/view/:id → Get One License", async () => {
        const res = await request(app).get(`/api/license/view/${licenseId}`);

        expect(res.status).toBe(200);
        expect(res.body.data._id).toBe(licenseId);
    });

    it("PUT /api/license/update/:id → Update License", async () => {
        const res = await request(app)
            .put(`/api/license/update/${licenseId}`)
            .send({
                maxUser: 100,
                status: "INACTIVE"
            });

        expect(res.status).toBe(200);
        expect(res.body.data.maxUser).toBe(100);
        expect(res.body.data.status).toBe("INACTIVE");
    });

    it("DELETE /api/license/delete/:id → Delete License", async () => {
        const res = await request(app).delete(`/api/license/delete/${licenseId}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

});
