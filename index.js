import express from "express";
import cors from "cors";
import multer from "multer";
import Tesseract from "tesseract.js";

const app = express();
const upload = multer(); // memory storage by default

app.use(cors());

app.get("/", (req, res) => {
  res.send("✅ OCR API is running");
});

app.post("/extract", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  try {
    const result = await Tesseract.recognize(req.file.buffer, "eng");
    const text = result.data.text;

    // ✅ Extract Email
    const email = text.match(/[\w\.-]+@[\w\.-]+\.\w+/)?.[0] || null;

    // ✅ Extract Phone Number
    const phone = text.match(/\+?\d[\d\s\-]{7,}\d/)?.[0] || null;

    // ✅ Extract Name (First line with 2 words having capital letters)
    const nameMatch = text.match(/[A-Z][a-z]+\s[A-Z][a-z]+/);
    const name = nameMatch ? nameMatch[0].trim() : null;

    // ✅ Extract Company Name (search for words like “Pvt”, “Ltd”, “Solutions”, “Tech”, etc.)
    const companyMatch = text.match(/([A-Z][A-Za-z&\s]+(?:Pvt|Ltd|Solutions|Company|Technologies|Tree))/i);
    const companyname = companyMatch ? companyMatch[1].trim() : null;

    // ✅ Extract Address (lines containing “Plot”, “Road”, “Street”, “Noida”, “India”, “Delhi”)
    const addressMatch = text.match(/(?:Plot|Road|Street|Sector|Noida|Delhi|India)[^\n]+/i);
    const companyaddress = addressMatch ? addressMatch[0].trim() : null;

    res.json({
      extracted_text: text,
      structured_data: {
        name,
        email,
        phone,
        companyname,
        companyaddress
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "OCR failed" });
  }
});

app.listen(process.env.PORT, () => console.log("🚀 Server running on http://localhost:5000"));
