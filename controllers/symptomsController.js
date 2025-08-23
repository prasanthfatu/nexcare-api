// ✅ Import Gemini + LangChain
const { GoogleGenerativeAI } = require("@google/generative-ai");
const NodeCache = require("node-cache");  // simple in-memory cache

const cache = new NodeCache({ stdTTL: 86400 }); // cache for 1 day (86400s)

const checkSymptom = async (req, res) => {

  const { symptoms } = req.body;

  if (!symptoms || symptoms.trim().length < 3) {
    return res.status(400).json({ message: "Please provide valid symptoms." });
  }

  try {

    // ✅ Check Cache First
    const cached = cache.get(symptoms.toLowerCase());

    if (cached) {
      return res.json({
        step: 1,
        symptomAnalysis: cached,
        nextAction:
          "Would you like me to suggest the right department and specialist? (yes/no)",
        cached: true,
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // ✅ Try with Flash first (faster, cheaper)
    let model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    You are a medical assistant. The user reports: ${symptoms}.
    Provide:
    1. Possible common causes (not diagnosis)
    2. Urgency level (low, medium, high)
    3. Advice on whether to book a doctor appointment.
    Keep it under 120 words. Add medical disclaimer.
    `;

    let output;

    try {

      const result = await model.generateContent(prompt);
      output = result.response.text();

    } catch (err) {

      // ✅ If quota exceeded, fallback to pro
      if (err.status === 429) {
        console.warn("Flash quota exceeded, falling back to pro...");
        model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const result = await model.generateContent(prompt);
        output = result.response.text();
      } else {
        throw err;
      }
      
    }

    // ✅ Save to Cache
    cache.set(symptoms.toLowerCase(), output);

    res.json({
      step: 1,
      symptomAnalysis: output,
      nextAction:
        "Would you like me to suggest the right department and specialist? (yes/no)",
      cached: false,
    });
  } catch (err) {
    console.error("Error in checkSymptom:", err);
    res
      .status(500)
      .json({ message: "Server Error. Please try again later." });
  }
};

module.exports = { checkSymptom };



