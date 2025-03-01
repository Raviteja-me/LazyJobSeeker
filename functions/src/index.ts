import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import axios from "axios";
import PDFDocument from "pdfkit";

admin.initializeApp();

const CLOUD_RUN_PDF_EXTRACTOR = "https://lazy-job-scraper-275448735352.us-central1.run.app/extract-pdf";
const CLOUD_RUN_JOB_SCRAPER = "https://lazy-job-scraper-275448735352.us-central1.run.app/scrape-job";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "your-openai-api-key";
const STORAGE_BUCKET = "lazy-job-seeker-4b29b.appspot.com";

export const optimizeResume = functions.https.onRequest(async (req, res) => {
    try {
        const { userId, originalResumeUrl, jobUrl, jobTitle } = req.body;
        if (!originalResumeUrl || !jobUrl || !userId) {
            res.status(400).json({ error: "Missing required parameters" });
            return;
        }

        // Create a document in Firestore to track progress
        const docRef = admin.firestore().collection('processedResumes').doc();
        await docRef.set({
            userId,
            jobTitle: jobTitle || 'Job Application',
            originalResumeUrl,
            jobUrl,
            status: 'processing',
            processedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        try {
            const pdfResponse = await axios.post(CLOUD_RUN_PDF_EXTRACTOR, { url: pdfUrl });
            const resumeText = pdfResponse.data.text;

            const jobResponse = await axios.post(CLOUD_RUN_JOB_SCRAPER, { url: jobUrl });
            const jobText = jobResponse.data.text;

            const openAiResponse = await axios.post(
                "https://api.openai.com/v1/chat/completions",
                {
                    model: "gpt-4",
                    messages: [
                        { role: "system", content: "Optimize the user's resume to match the job description perfectly." },
                        { role: "user", content: `User Resume:\n${resumeText}\n\nJob Description:\n${jobText}` }
                    ]
                },
                {
                    headers: { Authorization: `Bearer ${OPENAI_API_KEY}` }
                }
            );

            const optimizedResumeText = openAiResponse.data.choices[0].message.content;
            const pdfBuffer = await generatePDF(optimizedResumeText);

            // Store optimized PDF
            const bucket = admin.storage().bucket(STORAGE_BUCKET);
            const fileName = `optimized-resumes/${userId}/${Date.now()}.pdf`;
            const file = bucket.file(fileName);
            await file.save(pdfBuffer, { contentType: "application/pdf" });

            const [downloadUrl] = await file.getSignedUrl({ 
                action: "read", 
                expires: "03-01-2026" 
            });

            // Update Firestore document with success
            await docRef.update({
                status: 'completed',
                downloadUrl
            });

            res.json({ success: true, documentId: docRef.id });
        } catch (error) {
            // Update Firestore document with error
            await docRef.update({
                status: 'error',
                error: error.message
            });
            throw error;
        }

    } catch (error) {
        console.error("Error optimizing resume:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


/**
 * Generates a PDF from text using PDFKit
 * @param text - The text to convert into a PDF
 * @returns {Promise<Buffer>} - PDF buffer
 */
async function generatePDF(text: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const buffers: Buffer[] = [];

        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => resolve(Buffer.concat(buffers)));
        doc.on("error", reject);

        doc.fontSize(12).text(text, { align: "left" });
        doc.end();
    });
}
