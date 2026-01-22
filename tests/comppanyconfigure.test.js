import request from "supertest";
import mongoose from "mongoose";
import app from "../server.js";
import LicenseModel from "../models/license.model.js";

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

describe("Company Configure API Tests", () => {

    let id;
    let licenseId;



    /** CREATE **/
  it("POST /api/companyConfigure/create → Create Company Configure", async () => {
       licenseId = new mongoose.Types.ObjectId(); 
    const res = await request(app)
        .post("/api/companyConfigure/create")
        .send({
            leadForm: [
                { field: "name", type: "text", required: true }
            ],
            roles: [
                {
                    Department: "Sales",
                    roles: ["Manager", "Executive"]
                }
            ],
            permissions: [
                {
                    department: "Sales",
                    roleName: "Manager",
                    permission: ["CREATE", "UPDATE", "VIEW"]
                }
            ],
            licenseId: licenseId.toHexString(), // ObjectId, NOT string
        });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty("_id");

    id = res.body.data._id;
});


    /** VIEW ALL **/
    it("GET /api/companyConfigure/view → View All", async () => {
        const res = await request(app)
            .get("/api/companyConfigure/view");

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
        expect(res.body.data[0]).toHaveProperty("_id");
    });

    /** VIEW ONE **/
    it("GET /api/companyConfigure/view/:id → View One", async () => {
        const res = await request(app)
            .get(`/api/companyConfigure/view/${id}`);

        expect(res.status).toBe(200);
        expect(res.body.data._id).toBe(id.toString());
    });

    /** UPDATE **/
    it("PUT /api/companyConfigure/update/:id → Update", async () => {
        const res = await request(app)
            .put(`/api/companyConfigure/update/${id}`)
            .send({
                leadForm: [{ field: "email", type: "email" }]
            });

        expect(res.status).toBe(200);
        expect(res.body.data.leadForm.length).toBe(1);
    });

    /** DELETE **/
    it("DELETE /api/companyConfigure/delete/:id → Delete", async () => {
        const res = await request(app)
            .delete(`/api/companyConfigure/delete/${id}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

});
