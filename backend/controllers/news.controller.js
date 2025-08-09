import axios from 'axios';

// Using the correct NewsAPI key
const NEWS_API_KEY = 'a20134fb667a4ab08ed527f64dc2f27b';
const NEWS_API_URL = 'https://newsapi.org/v2/top-headlines';

// Cache for storing news data
const newsCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getNewsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        
        // Check cache first
        const cacheKey = `news_${category}`;
        const cachedData = newsCache.get(cacheKey);
        if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
            console.log("Returning cached news data for category:", category);
            return res.status(200).json(cachedData.data);
        }

        console.log("Fetching fresh news for category:", category);
        
        const response = await axios.get(NEWS_API_URL, {
            params: {
                country: 'us',
                category: category,
                apiKey: NEWS_API_KEY,
                pageSize: 30 // Limit to 30 articles for better performance
            }
        });

        // Validate response data
        if (!response.data || !Array.isArray(response.data.articles)) {
            throw new Error("Invalid response format from News API");
        }

        // Filter out articles without required fields
        const validArticles = response.data.articles.filter(article => 
            article.title && 
            article.description && 
            article.url
        );

        if (validArticles.length === 0) {
            throw new Error("No valid news articles found");
        }

        // Update cache
        const newsData = {
            ...response.data,
            articles: validArticles
        };
        newsCache.set(cacheKey, {
            data: newsData,
            timestamp: Date.now()
        });

        console.log("Number of valid articles received:", validArticles.length);
        res.status(200).json(newsData);
    } catch (error) {
        console.error("Error in getNewsByCategory controller:", error.message);
        
        if (error.response) {
            console.error("API Error Response:", error.response.data);
            const statusCode = error.response.status;
            const errorMessage = error.response.data.message || "Failed to fetch news";
            
            // Handle specific API errors
            if (statusCode === 401) {
                return res.status(500).json({ error: "News API key is invalid" });
            }
            if (statusCode === 429) {
                return res.status(429).json({ error: "News API rate limit exceeded" });
            }
            
            return res.status(statusCode).json({ 
                error: "Failed to fetch news",
                details: error.response.data 
            });
        }
        
        res.status(500).json({ 
            error: "Failed to fetch news",
            message: error.message 
        });
    }
}; 