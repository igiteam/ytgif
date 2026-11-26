
const {
  fetchTranscript,
  toPlainText,
} = require("youtube-transcript-plus");

exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };

  const videoId = event.queryStringParameters?.videoId;

  try {
    if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Invalid video ID" }),
      };
    }

    const segments = await fetchTranscript(videoId, {
      lang: "en",
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36",
      retries: 2,
      retryDelay: 1500,
    });

    const transcript = toPlainText(segments);

    if (!transcript.trim()) {
      throw new Error("Transcript was empty.");
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        transcript,
        language: segments[0]?.lang || "en",
        segmentCount: segments.length,
        message: "Transcript retrieved successfully",
      }),
    };

  } catch (error) {
    console.error("TRANSCRIPT ERROR:", error);

    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({
        error: "Could not retrieve transcript",
        details: error.message,
        errorType: error.name,
        videoId,
      }),
    };
  }
};
