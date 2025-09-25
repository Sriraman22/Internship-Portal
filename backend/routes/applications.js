// backend/routes/applications.js
import express from "express";
import multer from "multer";
import { BlobServiceClient } from "@azure/storage-blob";
import { getPool } from "../db.js";
import auth from "../middleware/auth.js";
import PDFDocument from "pdfkit";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Azure Blob (uses AZURE_STORAGE_CONNECTION_STRING and AZURE_STORAGE_CONTAINER from .env)
const blobService = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);
const containerClient = blobService.getContainerClient(
  process.env.AZURE_STORAGE_CONTAINER || "application-docs"
);

/**
 * Helper: Upload a buffer to the given container name and filename.
 * Returns the blob URL.
 */
async function uploadBufferToContainer(containerName, blobName, buffer, contentType = "application/pdf") {
  const container = blobService.getContainerClient(containerName);
  await container.createIfNotExists(); // creates container if missing
  const blockBlobClient = container.getBlockBlobClient(blobName);
  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: contentType },
  });
  return blockBlobClient.url;
}

/**
 * Submit application (student) + optional single file upload "file"
 */
router.post("/", auth, upload.single("file"), async (req, res) => {
  try {
    const role = (req.user.role || "").toLowerCase();
    if (role !== "student") return res.status(403).json({ message: "Only students can apply" });

    const { company_name, position, start_date, end_date } = req.body;
    const pool = await getPool();

    const insertResult = await pool
      .request()
      .input("student_id", req.user.id)
      .input("company_name", company_name)
      .input("position", position)
      .input("start_date", start_date)
      .input("end_date", end_date)
      .query(
        `INSERT INTO Applications (student_id, company_name, position, start_date, end_date)
         OUTPUT INSERTED.id VALUES (@student_id, @company_name, @position, @start_date, @end_date)`
      );

    const appId = insertResult.recordset[0].id;
    let fileUrl = null;

    if (req.file) {
      const blobName = `${appId}_${Date.now()}_${req.file.originalname}`;
      fileUrl = await uploadBufferToContainer(
        process.env.AZURE_STORAGE_CONTAINER || "application-docs",
        blobName,
        req.file.buffer,
        req.file.mimetype || "application/octet-stream"
      );

      // store document record
      await pool
        .request()
        .input("application_id", appId)
        .input("blob_url", fileUrl)
        .input("file_name", req.file.originalname)
        .input("doc_type", "OfferLetter")
        .query(
          `INSERT INTO Documents (application_id, blob_url, file_name, doc_type)
           VALUES (@application_id, @blob_url, @file_name, @doc_type)`
        );
    }

    res.json({ message: "✅ Application submitted successfully!", id: appId, fileUrl });
  } catch (err) {
    console.error("❌ Application insert error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * List applications (role-based). Each application returns the latest document via OUTER APPLY.
 */
router.get("/", auth, async (req, res) => {
  try {
    const pool = await getPool();
    const role = (req.user.role || "").toLowerCase();

    let baseQuery = `
      SELECT a.id, a.student_id, a.company_name, a.position,
             a.start_date, a.end_date,
             a.coordinator_status, a.hod_status, a.admin_status, a.applied_on,
             a.od_letter_url,
             d.blob_url, d.file_name
      FROM Applications a
      OUTER APPLY (
        SELECT TOP 1 d.blob_url, d.file_name, d.uploaded_on
        FROM Documents d
        WHERE d.application_id = a.id
        ORDER BY d.uploaded_on DESC
      ) d
    `;

    if (role === "student") {
      baseQuery += ` WHERE a.student_id = @student_id ORDER BY a.applied_on DESC`;
    } else {
      baseQuery += ` ORDER BY a.applied_on DESC`;
    }

    const request = pool.request();
    if (role === "student") request.input("student_id", req.user.id);

    const result = await request.query(baseQuery);
    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Application fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * Approve / Reject endpoint (Coordinator / HOD)
 * PUT /applications/:id/approve  body: { decision: "approved"|"rejected" }
 */
router.put("/:id/approve", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { decision } = req.body;
    if (!decision) return res.status(400).json({ message: "decision required" });
    const role = (req.user.role || "").toLowerCase();

    let field;
    if (role === "coordinator") field = "coordinator_status";
    else if (role === "hod") field = "hod_status";
    else return res.status(403).json({ message: "Not authorized to approve" });

    const pool = await getPool();
    await pool.request().input("decision", decision).input("id", id).query(
      `UPDATE Applications SET ${field} = @decision WHERE id = @id`
    );

    res.json({ message: `Application ${decision} by ${role}` });
  } catch (err) {
    console.error("❌ Approval error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * HOD: list coordinator-approved applications
 * GET /applications/hod
 */
router.get("/hod", auth, async (req, res) => {
  try {
    if ((req.user.role || "").toLowerCase() !== "hod") return res.status(403).json({ message: "Not authorized" });
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT a.*, d.blob_url, d.file_name
      FROM Applications a
      LEFT JOIN Documents d ON a.id = d.application_id
      WHERE a.coordinator_status = 'approved'
      ORDER BY a.applied_on DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error("❌ HOD fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * Generate OD letter (HOD only).
 * We support both POST and GET for backwards compatibility.
 * - checks that application exists and hod_status === 'approved'
 * - if od already exists, returns it (idempotent)
 * - generates PDF, uploads to 'odletters' container and stores od_letter_url on Applications
 */
async function generateODHandler(req, res) {
  const id = req.params.id;
  try {
    if ((req.user.role || "").toLowerCase() !== "hod") return res.status(403).json({ message: "Only HOD can generate OD" });

    const pool = await getPool();
    const q = await pool.request().input("id", id).query("SELECT * FROM Applications WHERE id = @id");
    const app = q.recordset[0];
    if (!app) return res.status(404).json({ message: "Application not found" });

    // ensure HOD has approved (business rule)
    if (app.hod_status !== "approved") {
      return res.status(400).json({ message: "Application must be approved by HOD before generating OD" });
    }

    // If OD was already generated, return the url (idempotent)
    if (app.od_letter_url) {
      return res.json({ url: app.od_letter_url, existed: true });
    }

    // generate PDF in-memory
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", async () => {
      try {
        const pdfBuffer = Buffer.concat(buffers);
        const odContainerName = "odletters";
        const blobName = `od_letter_${id}_${Date.now()}.pdf`;

        // upload to odletters container and get URL
        const odUrl = await uploadBufferToContainer(odContainerName, blobName, pdfBuffer, "application/pdf");

        // save od url in Applications table (add od_letter_url column beforehand)
        await pool.request().input("id", id).input("od_letter_url", odUrl)
          .query("UPDATE Applications SET od_letter_url = @od_letter_url WHERE id = @id");

        res.json({ url: odUrl });
      } catch (err) {
        console.error("❌ OD upload/save error:", err);
        res.status(500).json({ message: "Failed to upload/save OD" });
      }
    });

    // PDF content
    doc.fontSize(20).text("On Duty (OD) Letter", { align: "center" });
    doc.moveDown();
    doc.fontSize(12);
    doc.text(`Application ID: ${app.id}`);
    doc.text(`Student ID: ${app.student_id}`);
    doc.moveDown();
    const sd = app.start_date ? new Date(app.start_date).toLocaleDateString() : "";
    const ed = app.end_date ? new Date(app.end_date).toLocaleDateString() : "";
    doc.text(`This is to certify that ${app.student_id} has been approved for internship at ${app.company_name} (${app.position}) from ${sd} to ${ed}.`);
    doc.moveDown();
    doc.text("Regards,");
    doc.text("Internship Cell / HOD");
    doc.end();
  } catch (err) {
    console.error("❌ OD Letter error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// expose both POST and GET for compatibility:
// preferred is POST (side-effect), but supporting GET keeps existing frontend working.
router.post("/:id/od-letter", auth, generateODHandler);
router.get("/:id/od-letter", auth, generateODHandler);

/**
 * Admin: list only fully approved + OD generated applications
 */
router.get("/admin", auth, async (req, res) => {
  try {
    if ((req.user.role || "").toLowerCase() !== "admin") return res.status(403).json({ message: "Not authorized" });
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT a.id, a.student_id, a.company_name, a.position, a.start_date, a.end_date, a.od_letter_url, d.file_name, d.blob_url
      FROM Applications a
      LEFT JOIN Documents d ON a.id = d.application_id
      WHERE a.coordinator_status = 'approved'
        AND a.hod_status = 'approved'
        AND a.od_letter_url IS NOT NULL
      ORDER BY a.applied_on DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Admin fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
