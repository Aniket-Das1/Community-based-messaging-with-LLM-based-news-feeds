import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./LoadingSpinner";
import toast from "react-hot-toast";

const categories = [
  "general",
  "business",
  "entertainment",
  "health",
  "science",
  "sports",
  "technology"
];

const NewsFeed = () => {
  const [selectedCategory, setSelectedCategory] = useState("general");
  const [imageErrors, setImageErrors] = useState(new Set());

  const { data: news, isLoading, error, refetch } = useQuery({
    queryKey: ["news", selectedCategory],
    queryFn: async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/news/${selectedCategory}`);
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || data.details?.message || "Failed to fetch news");
        }
        
        if (!data.articles || data.articles.length === 0) {
          throw new Error("No news articles found");
        }
        
        return data;
      } catch (error) {
        console.error("Error fetching news:", error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleImageError = (articleIndex) => {
    setImageErrors(prev => new Set([...prev, articleIndex]));
  };

  const handleRetry = () => {
    setImageErrors(new Set());
    refetch();
  };

  if (error) {
    return (
      <div style={{ width: '10px',
    height: '550px',
   marginBottom: '10px' ,
    fontSize: '12px',}}className="flex-[4_4_0] border-r border-gray-700 min-h-screen">
        <div className="flex w-full border-b border-gray-700">
          <h1 className="text-xl font-bold p-4">Trending News</h1>
        </div>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center text-red-500 mb-4">
            <p className="text-lg font-semibold mb-2">Failed to load news</p>
            <p className="text-sm">{error.message}</p>
          </div>
          <button
            onClick={handleRetry}
            className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary/90 transition duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div  >
      {/* Header */}
      <div className="flex w-full border-b border-gray-700">
        <h1 style={{ width: '200px',position:'relative',top:'-30px',color:'red'}} className="text-xl font-bold p-4">Trending News</h1>
      </div>

      {/* Categories */}
      <div style={{ width: '10px',position:'relative',top:'320px',
    height: '550px',
   marginBottom: '10px' ,
    fontSize: '12px',}}className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4 border-b border-gray-700">
      <div style={{ position:'relative',left:'-150px', display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '10px',
    width: '350px', }}>
        {categories.map((category) => (
          <button style={{ width: '110px',}}
            key={category}
            className={`px-4 py-2 rounded-full capitalize transition-colors ${
              selectedCategory === category
                ? "bg-primary text-white"
                : "bg-gray-800 hover:bg-gray-700"
            }`}
            onClick={() => {
              setSelectedCategory(category);
              setImageErrors(new Set());
            }}
          >
            {category}
          </button>
        ))}
      </div>
      </div>
  <div >
      {/* News Content */}
<div style={{ position:'relative',left:'-30px',top:'-600px',height: '350px',width:'450px', overflowY: 'auto' }}>
  {isLoading ? (
    <div>
      <LoadingSpinner size="lg" />
    </div>
  ) : (
    <div style={{ fontSize: '12px' }}>
      {news?.articles?.map((article, index) => (
        <div
          key={index}
          className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition duration-300 mb-4"
        >
          {article.urlToImage && !imageErrors.has(index) && (
            <div>
              <a href={article.url} target="_blank" rel="noopener noreferrer">
                <img style={{ height: '350px',width:'450px',}}
                  src={article.urlToImage}
                  alt={article.title}
                  className="w-full h-[250px] object-cover"
                  onError={() => handleImageError(index)}
                />
              </a>
            </div>
          )}
          <div className="p-4">
            <h2 style={{color:'black'}}className="text-sm font-semibold">{article.title}</h2>
            <p style={{color:'black'}}className="text-sm mt-2">{article.description}</p>
            <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
              <span className="truncate max-w-[150px]">{article.source.name}</span>
              <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
            </div>
          
          </div>
        </div>
      ))}
    </div>
  )}
</div>

    </div>
    </div>
  );
};

export default NewsFeed; 