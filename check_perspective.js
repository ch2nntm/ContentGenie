// Removed unused 'google' import
import axios from 'axios';

// Lấy API key từ biến môi trường
const API_KEY = process.env.GOOGLE_API_KEY;

if (!API_KEY) {
  console.error("❌ GOOGLE_API_KEY environment variable is not set.");
  process.exit(1);
}

// Nội dung cần kiểm tra
const textToAnalyze = "I love this!";

const analyzeRequest = {
  comment: { text: textToAnalyze },
  requestedAttributes: { TOXICITY: {} }
};

// Gửi request tới Perspective API
axios.post(
  `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${API_KEY}`,
  analyzeRequest,
  {
    headers: {
      'Content-Type': 'application/json'
    }
  }
)
.then(response => {
  const score = response.data.attributeScores.TOXICITY.summaryScore.value;
  console.log(`✅ Toxicity score: ${score}`);
  if (score > 0.7) {
    console.log("⚠️ Nội dung có thể độc hại hoặc gây xúc phạm.");
  } else {
    console.log("✅ Nội dung có vẻ ổn.");
  }
})
.catch(error => {
  console.error("❌ Lỗi khi gọi API:", error.response?.data || error.message);
});
