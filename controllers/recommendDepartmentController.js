const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { PromptTemplate } = require("@langchain/core/prompts");
const User = require("../model/User");

//Department Suggestion (only if user says "yes")

const testDepartment = async (req, res) => {

  const { symptoms, confirm } = req.body; // confirm = "yes" or "no"

  try {
    if (confirm.toLowerCase() !== "yes") {
      return res.json({
        step: 2,
        message: "Okay, no department suggestion provided. Take care!"
      });
    }

    // ✅ Fetch healthcare providers
    const users = await User.find().select("-password").lean();
    const doctorsData = users.filter(d => d.roles.includes("HealthcareProvider"));

    // ✅ Convert doctors into department list
    const testDepartments = doctorsData.map(doc => ({
      name: doc.department + " Department",
      specialist: `Dr. ${doc.username}`,
      tests: []
    }));

    // ✅ Always include fallback
    testDepartments.push({
      name: "General Medicine Department",
      specialist: "Dr. Priyanka",
      tests: ["Basic Blood Test", "Urine Test", "Physical Examination"]
    });

    const model = new ChatGoogleGenerativeAI({
      model: "gemini-2.0-flash",
      apiKey: process.env.GEMINI_API_KEY
    });

    const template = `
      You are a helpful assistant for Nexcare Test Center.
      The patient reports: {symptoms}.
      Available departments are: {departments}.
      Recommend the most suitable department and specialist.
      Include which tests may be required and a short disclaimer.
      Keep it under 100 words.
    `;

    const prompt = new PromptTemplate({
      template,
      inputVariables: ["symptoms", "departments"]
    });

    const finalPrompt = await prompt.format({
      symptoms,
      departments: testDepartments
        .map(d => `${d.name} (Specialist: ${d.specialist})`)
        .join(", ")
    });

    const response = await model.invoke(finalPrompt);

    res.json({
      step: 2,
      departmentRecommendation: response.content
    });
  } catch (err) {
    console.error("Error in testDepartment:", err);
    res.status(500).json({ message: "Server Error. Please try again later." });
  }
};

module.exports = { testDepartment };
