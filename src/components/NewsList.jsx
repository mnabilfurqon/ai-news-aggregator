import { useEffect, useState } from "react";
import { List, Input, Typography, Spin } from "antd";
import axios from "axios";
import dayjs from "dayjs";

const { Title } = Typography;
const { Search } = Input;

const NewsList = () => {
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const urls = [
        `https://newsdata.io/api/1/news?apikey=${
          import.meta.env.VITE_NEWSDATA_API_KEY
        }&q=AI&language=en`,
        `https://gnews.io/api/v4/search?q=AI&token=${
          import.meta.env.VITE_GNEWS_API_KEY
        }&lang=en`,
        `http://api.mediastack.com/v1/news?access_key=${
          import.meta.env.VITE_MEDIASTACK_API_KEY
        }&keywords=AI&languages=en`,
      ];

      const responses = await Promise.all(
        urls.map(async (url, idx) => {
          try {
            const res = await axios.get(url);
            return res;
          } catch (err) {
            console.error(
              `Error fetching from API ${idx + 1}:`,
              err.response?.data || err.message
            );
            return null;
          }
        })
      );

      const allNews = [];

      responses.forEach((res, idx) => {
        if (!res) return;

        let articles = [];
        switch (idx) {
          case 0:
            articles = res.data.results || [];
            articles.forEach((article) => {
              allNews.push({
                title: article.title,
                url: article.link,
                publishedAt: article.pubDate,
                source: article.source_id || "NewsData",
              });
            });
            break;
          case 1:
            articles = res.data.articles || [];
            articles.forEach((article) => {
              allNews.push({
                title: article.title,
                url: article.url,
                publishedAt: article.publishedAt,
                source: article.source?.name || "GNews",
              });
            });
            break;
          case 2:
            articles = res.data.data || [];
            articles.forEach((article) => {
              allNews.push({
                title: article.title,
                url: article.url,
                publishedAt: article.published_at,
                source: article.source || "MediaStack",
              });
            });
            break;
        }
      });

      allNews.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

      setNews(allNews);
      setFilteredNews(allNews);
    } catch (error) {
      console.error("Unexpected error fetching news:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleSearch = (value) => {
    const keyword = value.toLowerCase();
    const result = news.filter((item) =>
      item.title.toLowerCase().includes(keyword)
    );
    setFilteredNews(result);
  };

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>AI News</Title>

      <Search
        placeholder="Search news..."
        enterButton
        onSearch={handleSearch}
        style={{ marginBottom: 20 }}
      />

      {loading ? (
        <Spin tip="Loading news..." />
      ) : (
        <List
          itemLayout="vertical"
          dataSource={filteredNews}
          renderItem={(item) => (
            <List.Item>
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                <strong>{item.title}</strong>
              </a>
              <div style={{ fontSize: "12px", color: "#888" }}>
                {item.source} –{" "}
                {dayjs(item.publishedAt).format("DD MMM YYYY HH:mm")}
              </div>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default NewsList;
